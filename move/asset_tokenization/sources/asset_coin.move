/// Asset-backed fungible token module
/// Creates fungible tokens backed by physical assets for liquidity
module asset_tokenization::asset_coin {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use std::string::{String};
    use sui::event;
    use sui::balance::{Self, Balance, Supply};

    /// Error codes
    const ENotAuthorized: u64 = 1;
    const EInsufficientCollateral: u64 = 2;
    const EInvalidAmount: u64 = 3;

    /// One-time witness for creating the currency
    struct ASSET_COIN has drop {}

    /// Asset-backed token metadata
    struct AssetCoinMetadata has key {
        id: UID,
        /// Name of the asset backing this coin
        asset_name: String,
        /// Asset ID from the platform
        asset_id: String,
        /// Total supply of coins
        total_supply: u64,
        /// Current collateral value (in SUI smallest units)
        collateral_value: u64,
        /// Authorized minter address
        authorized_minter: address,
        /// Whether minting is active
        is_active: bool,
    }

    /// Event emitted when asset coins are minted
    struct CoinsMinted has copy, drop {
        asset_id: String,
        amount: u64,
        recipient: address,
        timestamp: u64,
    }

    /// Event emitted when asset coins are burned
    struct CoinsBurned has copy, drop {
        asset_id: String,
        amount: u64,
        burner: address,
        timestamp: u64,
    }

    /// Initialize the asset coin (called during module publish)
    fun init(witness: ASSET_COIN, ctx: &mut TxContext) {
        // Create the currency
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9, // decimals
            b"ASST", // symbol
            b"Asset Token", // name
            b"Tokenized physical asset representation", // description
            option::none(), // icon URL
            ctx
        );

        // Freeze the metadata so it cannot be changed
        transfer::public_freeze_object(metadata);
        
        // Transfer treasury cap to sender
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    /// Create new asset-backed coin metadata
    public entry fun create_asset_coin_metadata(
        asset_name: vector<u8>,
        asset_id: vector<u8>,
        collateral_value: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        let metadata = AssetCoinMetadata {
            id: object::new(ctx),
            asset_name: string::utf8(asset_name),
            asset_id: string::utf8(asset_id),
            total_supply: 0,
            collateral_value,
            authorized_minter: sender,
            is_active: true,
        };

        transfer::share_object(metadata);
    }

    /// Mint asset-backed coins
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<ASSET_COIN>,
        metadata: &mut AssetCoinMetadata,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == metadata.authorized_minter, ENotAuthorized);
        assert!(metadata.is_active, ENotAuthorized);
        assert!(amount > 0, EInvalidAmount);

        // Mint coins
        let coins = coin::mint(treasury_cap, amount, ctx);
        
        // Update metadata
        metadata.total_supply = metadata.total_supply + amount;

        event::emit(CoinsMinted {
            asset_id: metadata.asset_id,
            amount,
            recipient,
            timestamp: tx_context::epoch(ctx),
        });

        transfer::public_transfer(coins, recipient);
    }

    /// Burn asset-backed coins
    public entry fun burn(
        treasury_cap: &mut TreasuryCap<ASSET_COIN>,
        metadata: &mut AssetCoinMetadata,
        coins: Coin<ASSET_COIN>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&coins);
        coin::burn(treasury_cap, coins);
        
        metadata.total_supply = metadata.total_supply - amount;

        event::emit(CoinsBurned {
            asset_id: metadata.asset_id,
            amount,
            burner: tx_context::sender(ctx),
            timestamp: tx_context::epoch(ctx),
        });
    }

    /// Update collateral value (authorized minter only)
    public entry fun update_collateral(
        metadata: &mut AssetCoinMetadata,
        new_collateral_value: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == metadata.authorized_minter, ENotAuthorized);
        
        metadata.collateral_value = new_collateral_value;
    }

    /// Toggle minting active status
    public entry fun toggle_minting(
        metadata: &mut AssetCoinMetadata,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == metadata.authorized_minter, ENotAuthorized);
        
        metadata.is_active = !metadata.is_active;
    }

    // ==================== View Functions ====================

    /// Get metadata info
    public fun get_metadata_info(metadata: &AssetCoinMetadata): (String, u64, u64, bool) {
        (
            metadata.asset_id,
            metadata.total_supply,
            metadata.collateral_value,
            metadata.is_active
        )
    }
}
