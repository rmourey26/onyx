/// Asset Tokenization NFT Module
/// Enables tokenization of physical and digital assets with comprehensive metadata
module asset_tokenization::asset_nft {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};

    /// Error codes
    const ENotOwner: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const EAssetNotActive: u64 = 3;
    const EInvalidFractionAmount: u64 = 4;
    const EAssetNotTokenized: u64 = 5;

    /// Asset NFT representing a tokenized physical or digital asset
    struct AssetNFT has key, store {
        id: UID,
        /// Unique asset identifier from platform database
        asset_id: String,
        /// Asset name
        name: String,
        /// Asset description
        description: String,
        /// Asset type (equipment, vehicle, container, device, etc.)
        asset_type: String,
        /// Current asset status (active, inactive, maintenance, retired)
        status: String,
        /// Purchase cost in smallest currency unit
        purchase_cost: u64,
        /// Current value in smallest currency unit
        current_value: u64,
        /// Image URL for the asset
        image_url: String,
        /// Location data (JSON string)
        location: String,
        /// IoT sensor ID if applicable
        iot_sensor_id: String,
        /// Asset specifications (JSON string)
        specifications: String,
        /// ESG metrics (JSON string)
        esg_metrics: String,
        /// Tokenization timestamp
        tokenized_at: u64,
        /// Original owner address
        original_owner: address,
        /// Whether asset supports fractional ownership
        is_fractionalized: bool,
        /// Platform user ID
        user_id: String,
    }

    /// Fractional ownership token for an asset
    struct FractionalToken has key, store {
        id: UID,
        /// Reference to the parent AssetNFT
        asset_id: ID,
        /// Asset name for display
        asset_name: String,
        /// Number of fractions this token represents
        fraction_count: u64,
        /// Total fractions available for the asset
        total_fractions: u64,
        /// Percentage ownership (basis points, 10000 = 100%)
        ownership_percentage: u64,
        /// Token creation timestamp
        created_at: u64,
    }

    /// Registry to track all tokenized assets
    struct AssetRegistry has key {
        id: UID,
        /// Mapping of asset_id to AssetNFT object ID
        assets: Table<String, ID>,
        /// Total number of tokenized assets
        total_assets: u64,
        /// Total value locked in tokenized assets (in SUI smallest units)
        total_value_locked: u64,
    }

    /// Fractionalization pool for an asset
    struct FractionalizationPool has key {
        id: UID,
        /// Asset NFT ID this pool represents
        asset_nft_id: ID,
        /// Asset name
        asset_name: String,
        /// Total fractions created
        total_fractions: u64,
        /// Fractions still available
        available_fractions: u64,
        /// Price per fraction in SUI (smallest units)
        price_per_fraction: u64,
        /// Balance collected from fraction sales
        balance: Balance<SUI>,
        /// Original asset owner
        owner: address,
    }

    // ==================== Events ====================

    /// Event emitted when an asset is tokenized
    struct AssetTokenized has copy, drop {
        asset_nft_id: ID,
        asset_id: String,
        name: String,
        asset_type: String,
        current_value: u64,
        owner: address,
        timestamp: u64,
    }

    /// Event emitted when asset ownership is transferred
    struct AssetTransferred has copy, drop {
        asset_nft_id: ID,
        asset_id: String,
        from: address,
        to: address,
        timestamp: u64,
    }

    /// Event emitted when asset is fractionalized
    struct AssetFractionalized has copy, drop {
        asset_nft_id: ID,
        asset_id: String,
        total_fractions: u64,
        price_per_fraction: u64,
        timestamp: u64,
    }

    /// Event emitted when fractional tokens are purchased
    struct FractionPurchased has copy, drop {
        asset_id: String,
        buyer: address,
        fraction_count: u64,
        total_cost: u64,
        timestamp: u64,
    }

    /// Event emitted when asset metadata is updated
    struct AssetMetadataUpdated has copy, drop {
        asset_nft_id: ID,
        asset_id: String,
        updated_by: address,
        timestamp: u64,
    }

    // ==================== Initialization ====================

    /// Initialize the asset registry (called once on module publish)
    fun init(ctx: &mut TxContext) {
        let registry = AssetRegistry {
            id: object::new(ctx),
            assets: table::new(ctx),
            total_assets: 0,
            total_value_locked: 0,
        };
        transfer::share_object(registry);
    }

    // ==================== Core Functions ====================

    /// Mint a new Asset NFT
    public entry fun mint_asset_nft(
        registry: &mut AssetRegistry,
        asset_id: vector<u8>,
        name: vector<u8>,
        description: vector<u8>,
        asset_type: vector<u8>,
        status: vector<u8>,
        purchase_cost: u64,
        current_value: u64,
        image_url: vector<u8>,
        location: vector<u8>,
        iot_sensor_id: vector<u8>,
        specifications: vector<u8>,
        esg_metrics: vector<u8>,
        user_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);
        
        let nft = AssetNFT {
            id: object::new(ctx),
            asset_id: string::utf8(asset_id),
            name: string::utf8(name),
            description: string::utf8(description),
            asset_type: string::utf8(asset_type),
            status: string::utf8(status),
            purchase_cost,
            current_value,
            image_url: string::utf8(image_url),
            location: string::utf8(location),
            iot_sensor_id: string::utf8(iot_sensor_id),
            specifications: string::utf8(specifications),
            esg_metrics: string::utf8(esg_metrics),
            tokenized_at: timestamp,
            original_owner: sender,
            is_fractionalized: false,
            user_id: string::utf8(user_id),
        };

        let nft_id = object::id(&nft);
        let asset_id_str = string::utf8(asset_id);

        // Update registry
        table::add(&mut registry.assets, asset_id_str, nft_id);
        registry.total_assets = registry.total_assets + 1;
        registry.total_value_locked = registry.total_value_locked + current_value;

        // Emit event
        event::emit(AssetTokenized {
            asset_nft_id: nft_id,
            asset_id: asset_id_str,
            name: string::utf8(name),
            asset_type: string::utf8(asset_type),
            current_value,
            owner: sender,
            timestamp,
        });

        // Transfer NFT to sender
        transfer::transfer(nft, sender);
    }

    /// Update asset metadata (only owner can update)
    public entry fun update_asset_metadata(
        nft: &mut AssetNFT,
        status: vector<u8>,
        current_value: u64,
        location: vector<u8>,
        esg_metrics: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == nft.original_owner, ENotOwner);

        nft.status = string::utf8(status);
        nft.current_value = current_value;
        nft.location = string::utf8(location);
        nft.esg_metrics = string::utf8(esg_metrics);

        event::emit(AssetMetadataUpdated {
            asset_nft_id: object::id(nft),
            asset_id: nft.asset_id,
            updated_by: sender,
            timestamp: tx_context::epoch(ctx),
        });
    }

    /// Transfer asset NFT to another address
    public entry fun transfer_asset(
        nft: AssetNFT,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let timestamp = tx_context::epoch(ctx);
        
        event::emit(AssetTransferred {
            asset_nft_id: object::id(&nft),
            asset_id: nft.asset_id,
            from: tx_context::sender(ctx),
            to: recipient,
            timestamp,
        });

        transfer::transfer(nft, recipient);
    }

    /// Fractionalize an asset for partial ownership
    public entry fun fractionalize_asset(
        mut nft: AssetNFT,
        total_fractions: u64,
        price_per_fraction: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == nft.original_owner, ENotOwner);
        assert!(!nft.is_fractionalized, EInvalidFractionAmount);
        assert!(total_fractions > 0, EInvalidFractionAmount);

        nft.is_fractionalized = true;
        let nft_id = object::id(&nft);

        // Create fractionalization pool
        let pool = FractionalizationPool {
            id: object::new(ctx),
            asset_nft_id: nft_id,
            asset_name: nft.asset_id,
            total_fractions,
            available_fractions: total_fractions,
            price_per_fraction,
            balance: balance::zero(),
            owner: sender,
        };

        event::emit(AssetFractionalized {
            asset_nft_id: nft_id,
            asset_id: nft.asset_id,
            total_fractions,
            price_per_fraction,
            timestamp: tx_context::epoch(ctx),
        });

        // Share the pool so anyone can buy fractions
        transfer::share_object(pool);
        
        // Keep the original NFT with the owner
        transfer::transfer(nft, sender);
    }

    /// Purchase fractional ownership tokens
    public entry fun purchase_fractions(
        pool: &mut FractionalizationPool,
        payment: Coin<SUI>,
        fraction_count: u64,
        ctx: &mut TxContext
    ) {
        assert!(fraction_count > 0 && fraction_count <= pool.available_fractions, EInvalidFractionAmount);
        
        let total_cost = pool.price_per_fraction * fraction_count;
        let payment_value = coin::value(&payment);
        assert!(payment_value >= total_cost, EInsufficientPayment);

        // Add payment to pool balance
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut pool.balance, payment_balance);

        // Update available fractions
        pool.available_fractions = pool.available_fractions - fraction_count;

        // Calculate ownership percentage (basis points)
        let ownership_percentage = (fraction_count * 10000) / pool.total_fractions;

        // Create fractional token
        let token = FractionalToken {
            id: object::new(ctx),
            asset_id: pool.asset_nft_id,
            asset_name: pool.asset_name,
            fraction_count,
            total_fractions: pool.total_fractions,
            ownership_percentage,
            created_at: tx_context::epoch(ctx),
        };

        let buyer = tx_context::sender(ctx);

        event::emit(FractionPurchased {
            asset_id: pool.asset_name,
            buyer,
            fraction_count,
            total_cost,
            timestamp: tx_context::epoch(ctx),
        });

        transfer::transfer(token, buyer);
    }

    /// Withdraw proceeds from fractionalization pool (owner only)
    public entry fun withdraw_from_pool(
        pool: &mut FractionalizationPool,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == pool.owner, ENotOwner);

        let withdrawn = coin::take(&mut pool.balance, amount, ctx);
        transfer::public_transfer(withdrawn, sender);
    }

    // ==================== View Functions ====================

    /// Get asset NFT details
    public fun get_asset_info(nft: &AssetNFT): (String, String, String, u64, u64, bool) {
        (
            nft.asset_id,
            nft.name,
            nft.status,
            nft.purchase_cost,
            nft.current_value,
            nft.is_fractionalized
        )
    }

    /// Get fractional token details
    public fun get_fraction_info(token: &FractionalToken): (ID, u64, u64, u64) {
        (
            token.asset_id,
            token.fraction_count,
            token.total_fractions,
            token.ownership_percentage
        )
    }

    /// Get pool details
    public fun get_pool_info(pool: &FractionalizationPool): (u64, u64, u64) {
        (
            pool.total_fractions,
            pool.available_fractions,
            pool.price_per_fraction
        )
    }
}
