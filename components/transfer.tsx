"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import ERC20_ABI from "@openzeppelin/contracts/build/contracts/ERC20.json"
import UniswapV2Factory from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import { getEndpoints } from "@zetachain/networks/dist/src/getEndpoints"
import { getAddress } from "@zetachain/protocol-contracts"
import ERC20Custody from "@zetachain/protocol-contracts/abi/evm/ERC20Custody.sol/ERC20Custody.json"
import WETH9 from "@zetachain/protocol-contracts/abi/zevm/WZETA.sol/WETH9.json"
import ZRC20 from "@zetachain/protocol-contracts/abi/zevm/ZRC20.sol/ZRC20.json"
import { prepareData } from "@zetachain/toolkit/client"
import { bech32 } from "bech32"
import { ethers, utils } from "ethers"
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  RefreshCcw,
  Send,
  UserCircle,
} from "lucide-react"
import { parseEther, parseUnits } from "viem"
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi"

import { useEthersSigner } from "@/lib/ethers"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useZetaChain } from "@/app/ZetaChainContext"
import { AppContext } from "@/app/index"

const Transfer = () => {
  const { client } = useZetaChain()
  const omnichainSwapContractAddress =
    "0x102Fa443F05200bB74aBA1c1F15f442DbEf32fFb"
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const { balances, bitcoinAddress, setInbounds, inbounds, fees } =
    useContext(AppContext)
  const { chain } = useNetwork()

  const signer = useEthersSigner()

  const [sourceAmount, setSourceAmount] = useState<any>(false)
  const [sourceToken, setSourceToken] = useState<any>()
  const [sourceTokenOpen, setSourceTokenOpen] = useState(false)
  const [sourceTokenSelected, setSourceTokenSelected] = useState<any>()
  const [sourceBalances, setSourceBalances] = useState<any>()
  const [destinationToken, setDestinationToken] = useState<any>()
  const [destinationTokenSelected, setDestinationTokenSelected] =
    useState<any>()
  const [destinationTokenOpen, setDestinationTokenOpen] = useState(false)
  const [destinationAmount, setDestinationAmount] = useState("")
  const [destinationAmountIsLoading, setDestinationAmountIsLoading] =
    useState(false)
  const [destinationBalances, setDestinationBalances] = useState<any>()
  const [isRightChain, setIsRightChain] = useState(true)
  const [sendType, setSendType] = useState<any>()
  const [crossChainFee, setCrossChainFee] = useState<any>()
  const [isSending, setIsSending] = useState(false)
  const [addressSelected, setAddressSelected] = useState<any>(null)
  const [isAddressSelectedValid, setIsAddressSelectedValid] = useState(false)
  const [canChangeAddress, setCanChangeAddress] = useState(false)
  const [customAddress, setCustomAddress] = useState("")
  const [customAddressSelected, setCustomAddressSelected] = useState("")
  const [customAddressOpen, setCustomAddressOpen] = useState(false)
  const [isCustomAddressValid, setIsCustomAddressValid] = useState(false)
  const [isAmountGTFee, setIsAmountGTFee] = useState(false)
  const [isAmountLTBalance, setIsAmountLTBalance] = useState(false)
  const [isFeeOpen, setIsFeeOpen] = useState(false)
  const [sendButtonText, setSendButtonText] = useState("Send tokens")

  const [errors, setErrors] = useState<any>({
    sendTypeUnsupported: {
      message: "Transfer type not supported",
      enabled: false,
      priority: 5,
    },
    sourceTokenNotSelected: {
      message: "Select source token",
      enabled: true,
      priority: 4,
    },
    destinationTokenNotSelected: {
      message: "Select destination token",
      enabled: true,
      priority: 3,
    },
    enterAmount: {
      message: "Enter an amount",
      enabled: false,
      priority: 2,
    },
    amountLTFee: {
      message: "Amount must be higher than fee",
      enabled: false,
      priority: 1,
    },
    amountGTBalance: {
      message: "Insufficient balance",
      enabled: false,
      priority: 0,
    },
  })

  const priorityErrors = Object.entries(errors)
    .filter(([key, value]: [string, any]) => value.enabled)
    .sort((a: any, b: any) => b[1].priority - a[1].priority)
    .map(([key, value]) => value)

  const { address } = useAccount()

  const formatAddress = (address: any) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Set source token details
  useEffect(() => {
    const token = sourceBalances?.find((b: any) => b.id === sourceToken)
    setSourceTokenSelected(token ? token : false)
  }, [sourceToken])

  // Set destination token details
  useEffect(() => {
    const token = balances.find((b: any) => b.id === destinationToken)
    setDestinationTokenSelected(token ? token : false)
  }, [destinationToken])

  // Set cross-chain fee and whether address can be changed
  useEffect(() => {
    if (fees) {
      if (sendType === "crossChainZeta") {
        const dest = destinationTokenSelected?.chain_name
        const isZeta = dest === "zeta_testnet"
        const amount = isZeta
          ? 0
          : parseFloat(fees?.["feesCCM"][dest]?.totalFee)
        const formatted = amount === 0 ? "0 ZETA" : `~${amount.toFixed(2)} ZETA`
        setCrossChainFee({
          amount,
          symbol: "ZETA",
          formatted,
        })
      } else if (["crossChainSwap", "crossChainSwapBTC"].includes(sendType)) {
        const fee =
          fees?.["feesZEVM"][destinationTokenSelected?.chain_name]?.totalFee
        const amount = parseFloat(fee)
        const symbol = balances.find((c: any) => {
          if (
            c?.chain_id === destinationTokenSelected?.chain_id &&
            c?.coin_type === "Gas"
          ) {
            return c
          }
        })?.symbol
        setCrossChainFee({
          amount,
          symbol,
          formatted: `~${amount.toFixed(2)} ${symbol}`,
        })
      } else {
        setCrossChainFee(null)
      }
    }

    setCanChangeAddress(
      [
        "transferNativeEVM",
        "transferERC20EVM",
        "crossChainSwap",
        "transferBTC",
      ].includes(sendType)
    )
  }, [sourceAmount, sendType, destinationTokenSelected])

  // Set destination amount for a cross-chain swap
  const getQuoteCrossChainSwap = useCallback(async () => {
    if (
      sourceAmount &&
      parseFloat(sourceAmount) > 0 &&
      (destinationTokenSelected?.zrc20 ||
        (destinationTokenSelected?.coin_type === "ZRC20" &&
          destinationTokenSelected?.contract)) &&
      sourceTokenSelected?.zrc20
    ) {
      parseFloat(sourceAmount) > 0 && setDestinationAmountIsLoading(true)
      const rpc = getEndpoints("evm", "zeta_testnet")[0]?.url
      const provider = new ethers.providers.StaticJsonRpcProvider(rpc)
      const routerAddress = getAddress("uniswapv2Router02", "zeta_testnet")
      const router = new ethers.Contract(
        routerAddress as any,
        UniswapV2Factory.abi,
        provider
      )

      const amountIn = ethers.utils.parseEther(sourceAmount)
      const zetaToken = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf"
      const srcToken = sourceTokenSelected.zrc20
      const dstToken =
        destinationTokenSelected.coin_type === "ZRC20"
          ? destinationTokenSelected.contract
          : destinationTokenSelected.zrc20
      let zetaOut
      try {
        zetaOut = await router.getAmountsOut(
          parseUnits(sourceAmount, sourceTokenSelected.decimals),
          [srcToken, zetaToken]
        )
      } catch (e) {
        console.error(e)
      }
      let dstOut
      try {
        dstOut = await router.getAmountsOut(zetaOut[1], [zetaToken, dstToken])
        setDestinationAmountIsLoading(false)
        setDestinationAmount(
          parseFloat(
            ethers.utils.formatUnits(
              dstOut[1],
              destinationTokenSelected.decimals
            )
          ).toFixed(2)
        )
      } catch (e) {
        console.error(e)
      }
    }
  }, [sourceAmount, sourceTokenSelected, destinationTokenSelected, sendType])

  // Set destination amount
  useEffect(() => {
    const st = calculateSendType()
    setDestinationAmount("")
    if (
      [
        "crossChainSwap",
        "crossChainSwapBTC",
        "crossChainSwapBTCTransfer",
        "crossChainSwapTransfer",
      ].includes(st)
    ) {
      getQuoteCrossChainSwap()
      return
    } else if (["crossChainZeta"].includes(st)) {
      const delta = parseFloat(sourceAmount) - crossChainFee?.amount
      if (sourceAmount && delta > 0) {
        setDestinationAmount(delta.toFixed(2).toString())
      }
    }
    setDestinationAmountIsLoading(false)
  }, [
    sourceAmount,
    sourceTokenSelected,
    destinationTokenSelected,
    crossChainFee,
    sendType,
  ])

  const updateError = (errorKey: any, update: any) => {
    setErrors((prevErrors: any) => ({
      ...prevErrors,
      [errorKey]: {
        ...prevErrors[errorKey],
        ...update,
      },
    }))
  }

  useEffect(() => {
    if (sourceTokenSelected && destinationTokenSelected) {
      updateError("sendTypeUnsupported", { enabled: !sendType })
    }
    updateError("sourceTokenNotSelected", { enabled: !sourceTokenSelected })
    updateError("destinationTokenNotSelected", {
      enabled: !destinationTokenSelected,
    })
    if (sourceAmount === false) {
      // if the amount hasn't been set yet (i.e. the user hasn't typed anything)
      updateError("enterAmount", { enabled: true })
    } else {
      updateError("enterAmount", { enabled: false })
      if (!destinationAmountIsLoading) {
        updateError("amountLTFee", { enabled: !isAmountGTFee })
        updateError("amountGTBalance", { enabled: !isAmountLTBalance })
      }
    }
  }, [
    sendType,
    sourceTokenSelected,
    destinationTokenSelected,
    isAmountGTFee,
    isAmountLTBalance,
    sourceAmount,
  ])

  // Set whether amount is valid
  useEffect(() => {
    const am = parseFloat(sourceAmount || "0")
    const ltBalance = am >= 0 && am <= parseFloat(sourceTokenSelected?.balance)
    if (["crossChainZeta"].includes(sendType)) {
      const gtFee = am > parseFloat(crossChainFee?.amount)
      setIsAmountGTFee(gtFee)
      setIsAmountLTBalance(ltBalance)
    } else if (["crossChainSwap", "crossChainSwapBTC"].includes(sendType)) {
      const gtFee =
        parseFloat(destinationAmount) > parseFloat(crossChainFee?.amount)
      setIsAmountGTFee(gtFee)
      setIsAmountLTBalance(ltBalance)
    } else {
      setIsAmountGTFee(true)
      setIsAmountLTBalance(ltBalance)
    }
  }, [sourceAmount, crossChainFee, sendType, destinationAmount])

  // Set destination address
  useEffect(() => {
    if (!isAddressSelectedValid && destinationTokenSelected) {
      if (destinationTokenSelected.chain_name === "btc_testnet") {
        setAddressSelected(bitcoinAddress)
      } else {
        setAddressSelected(address)
      }
    }
  }, [destinationTokenSelected, isAddressSelectedValid])

  useEffect(() => {
    setAddressSelected(customAddressSelected || address)
  }, [customAddressSelected, address])

  const saveCustomAddress = () => {
    if (isCustomAddressValid) {
      setCustomAddressSelected(customAddress)
      setCustomAddress(customAddress)
      setCustomAddressOpen(false)
    }
  }

  // Set whether the custom destination address is valid
  useEffect(() => {
    let isValidBech32 = false
    try {
      if (bech32.decode(customAddress)) {
        const bech32address = utils.solidityPack(
          ["bytes"],
          [utils.toUtf8Bytes(customAddress)]
        )
        if (bech32address) {
          isValidBech32 = true
        }
      }
    } catch (e) {}
    const isValidEVMAddress = ethers.utils.isAddress(customAddress)
    if (!destinationTokenSelected) {
      setIsCustomAddressValid(true)
    } else if (destinationTokenSelected?.chain_name === "btc_testnet") {
      setIsCustomAddressValid(isValidBech32)
    } else {
      setIsCustomAddressValid(isValidEVMAddress)
    }
  }, [customAddress, destinationTokenSelected])

  const sendDisabled =
    !sendType ||
    !isAmountGTFee ||
    !isAmountLTBalance ||
    isSending ||
    !isAddressSelectedValid

  useEffect(() => {
    if (destinationAmountIsLoading) {
      setSendButtonText("Calculating...")
    } else if (sendDisabled && priorityErrors.length > 0) {
      setSendButtonText((priorityErrors as any)[0].message)
    } else {
      setSendButtonText("Send Tokens")
    }
  }, [destinationAmountIsLoading, sendDisabled, priorityErrors])

  // Set whether the selected destination address is valid
  useEffect(() => {
    let isValidBech32 = false
    try {
      if (bech32.decode(addressSelected)) {
        const bech32address = utils.solidityPack(
          ["bytes"],
          [utils.toUtf8Bytes(addressSelected)]
        )
        if (bech32address) {
          isValidBech32 = true
        }
      }
    } catch (e) {}
    const isValidEVMAddress = ethers.utils.isAddress(addressSelected)
    if (!destinationTokenSelected) {
      setIsAddressSelectedValid(true)
    } else if (destinationTokenSelected?.chain_name === "btc_testnet") {
      setIsAddressSelectedValid(isValidBech32)
    } else {
      setIsAddressSelectedValid(isValidEVMAddress)
    }
  }, [addressSelected, destinationTokenSelected])

  // Set whether the chain currently selected is the right one
  useEffect(() => {
    if (sourceTokenSelected?.chain_name === "btc_testnet") {
      setIsRightChain(true)
    } else if (chain && sourceTokenSelected) {
      setIsRightChain(
        chain.id.toString() === sourceTokenSelected.chain_id.toString()
      )
    }
  }, [chain, sourceTokenSelected])

  const calculateSendType = () => {
    const s = sourceTokenSelected
    const d = destinationTokenSelected
    const t = (x: any) => {
      setSendType(x)
      return x
    }
    if (s && d) {
      const fromZETA = /\bzeta\b/i.test(s?.symbol)
      const fromZETAorWZETA = /\bw?zeta\b/i.test(s?.symbol)
      const fromZetaChain = s.chain_name === "zeta_testnet"
      const fromBTC = s.symbol === "tBTC"
      const fromBitcoin = s.chain_name === "btc_testnet"
      const fromWZETA = s.symbol === "WZETA"
      const fromGas = s.coin_type === "Gas"
      const fromERC20 = s.coin_type === "ERC20"
      const toZETAorWZETA = /\bw?zeta\b/i.test(d?.symbol)
      const toWZETA = d.symbol === "WZETA"
      const toZETA = d.symbol === "ZETA"
      const toZetaChain = d.chain_name === "zeta_testnet"
      const toGas = d.coin_type === "Gas"
      const toERC20 = d.coin_type === "ERC20"
      const toZRC20 = d.coin_type === "ZRC20"
      const toBitcoin = d.chain_name === "btc_testnet"
      const sameToken = s.ticker === d.ticker
      const sameChain = s.chain_name === d.chain_name
      const fromToBitcoin = fromBitcoin && toBitcoin
      const fromToZetaChain = fromZetaChain || toZetaChain
      const fromToZETAorWZETA = fromZETAorWZETA || toZETAorWZETA

      if (fromZETAorWZETA && toZETAorWZETA && !sameChain)
        return t("crossChainZeta")
      if (fromZETA && toWZETA) return t("wrapZeta")
      if (fromWZETA && toZETA) return t("unwrapZeta")
      if (
        sameToken &&
        !fromZetaChain &&
        toZetaChain &&
        fromGas &&
        toZRC20 &&
        !fromBTC
      )
        return t("depositNative")
      if (
        sameToken &&
        !fromZetaChain &&
        toZetaChain &&
        fromERC20 &&
        toZRC20 &&
        !fromBTC &&
        s.zrc20 === d.contract
      )
        return t("depositERC20")
      if (sameToken && fromZetaChain && !toZetaChain && !fromBTC)
        return t("withdrawZRC20")
      if (sameToken && sameChain && fromGas && toGas && !fromToBitcoin)
        return t("transferNativeEVM")
      if (sameToken && sameChain && fromERC20 && toERC20 && !fromToBitcoin)
        return t("transferERC20EVM")
      if (!fromToZetaChain && !fromToZETAorWZETA && !sameChain && !fromBTC)
        return t("crossChainSwap")
      if (fromBTC && !toBitcoin && !fromToZetaChain && !toZETAorWZETA)
        return t("crossChainSwapBTC")
      if (fromBTC && !fromZetaChain && toZetaChain && toZRC20)
        return t("crossChainSwapBTCTransfer")
      if (!fromZetaChain && toZetaChain && toZRC20 && !fromToZETAorWZETA)
        return t("crossChainSwapTransfer")
      if (fromToBitcoin) return t("transferBTC")
      if (fromBTC && !fromZetaChain && toZetaChain) return t("depositBTC")
      if (fromBTC && fromZetaChain && !toZetaChain) return t("withdrawBTC")
    }
    t(null)
  }

  // Set send type
  useEffect(() => {
    calculateSendType()
  }, [sourceTokenSelected, destinationTokenSelected])

  // Set source and destination balances
  useEffect(() => {
    setSourceBalances(
      balances
        .filter((b: any) => b.balance > 0)
        .sort((a: any, b: any) => (a.chain_name < b.chain_name ? -1 : 1))
    )
    setDestinationBalances(
      balances
        .filter((b: any) =>
          b.chain_name === "btc_testnet" ? bitcoinAddress : true
        )
        .sort((a: any, b: any) => (a.chain_name < b.chain_name ? -1 : 1))
    )
  }, [balances])

  const bitcoinXDEFITransfer = (
    from: string,
    recipient: string,
    amount: number,
    memo: string
  ) => {
    return {
      method: "transfer",
      params: [
        {
          feeRate: 10,
          from,
          recipient,
          amount: {
            amount,
            decimals: 8,
          },
          memo,
        },
      ],
    }
  }

  let m = {} as any

  m.crossChainSwapBTCHandle = (action: string) => {
    if (!address) {
      console.error("EVM address undefined.")
      return
    }
    if (!bitcoinAddress) {
      console.error("Bitcoin address undefined.")
      return
    }
    const a = parseFloat(sourceAmount) * 1e8
    const bitcoinTSSAddress = "tb1qy9pqmk2pd9sv63g27jt8r657wy0d9ueeh0nqur"
    const contract = omnichainSwapContractAddress.replace(/^0x/, "")
    const zrc20 = destinationTokenSelected.zrc20.replace(/^0x/, "")
    const dest = address.replace(/^0x/, "")
    const memo = `hex::${contract}${action}${zrc20}${dest}`
    window.xfi.bitcoin.request(
      bitcoinXDEFITransfer(bitcoinAddress, bitcoinTSSAddress, a, memo),
      (error: any, hash: any) => {
        if (!error) {
          const inbound = {
            inboundHash: hash,
            desc: `Sent ${sourceAmount} tBTC`,
          }
          setInbounds([...inbounds, inbound])
        }
      }
    )
  }

  m.depositBTC = () => {
    if (!address) {
      console.error("EVM address undefined.")
      return
    }
    if (!bitcoinAddress) {
      console.error("Bitcoin address undefined.")
      return
    }
    const a = parseFloat(sourceAmount) * 1e8
    const bitcoinTSSAddress = "tb1qy9pqmk2pd9sv63g27jt8r657wy0d9ueeh0nqur"
    const memo = `hex::${address.replace(/^0x/, "")}`
    window.xfi.bitcoin.request(
      bitcoinXDEFITransfer(bitcoinAddress, bitcoinTSSAddress, a, memo),
      (error: any, hash: any) => {
        if (!error) {
          const inbound = {
            inboundHash: hash,
            desc: `Sent ${a} tBTC`,
          }
          setInbounds([...inbounds, inbound])
        }
      }
    )
  }

  m.transferNativeEVM = async () => {
    await signer?.sendTransaction({
      to: addressSelected,
      value: parseEther(sourceAmount),
    })
  }

  m.crossChainZeta = async () => {
    const from = sourceTokenSelected.chain_name
    const to = destinationTokenSelected.chain_name
    const tx = await client.sendZETA(
      signer,
      sourceAmount,
      from,
      to,
      address as string
    )
    const inbound = {
      inboundHash: tx.hash,
      desc: `Sent ${sourceAmount} ZETA from ${from} to ${to}`,
    }
    setInbounds([...inbounds, inbound])
  }

  m.withdrawBTC = async () => {
    const from = sourceTokenSelected.chain_name
    const to = destinationTokenSelected.chain_name
    const btc = bitcoinAddress
    const token = sourceTokenSelected.symbol
    const tx = await client.sendZRC20(
      signer,
      sourceAmount,
      from,
      to,
      btc,
      token
    )
    const inbound = {
      inboundHash: tx.hash,
      desc: `Sent ${sourceAmount} ${token} from ${from} to ${to}`,
    }
    setInbounds([...inbounds, inbound])
  }

  m.wrapZeta = async () => {
    signer?.sendTransaction({
      to: getAddress("zetaToken", "zeta_testnet"),
      value: parseEther(sourceAmount),
    })
  }

  m.unwrapZeta = async () => {
    if (signer) {
      const contract = new ethers.Contract(
        getAddress("zetaToken", "zeta_testnet") as any,
        WETH9.abi,
        signer
      )
      contract.withdraw(parseEther(sourceAmount))
    }
  }

  m.transferERC20EVM = async () => {
    const contract = new ethers.Contract(
      sourceTokenSelected.contract,
      ERC20_ABI.abi,
      signer
    )
    const approve = await contract.approve(
      addressSelected,
      parseUnits(sourceAmount, sourceTokenSelected.decimals)
    )
    approve.wait()
    const tx = await contract.transfer(
      addressSelected,
      parseUnits(sourceAmount, sourceTokenSelected.decimals)
    )
  }

  m.withdrawZRC20 = async () => {
    const destination = destinationTokenSelected.chain_name
    const ZRC20Address = getAddress("zrc20", destination)
    const contract = new ethers.Contract(ZRC20Address as any, ZRC20.abi, signer)
    const value = ethers.utils.parseUnits(
      sourceAmount,
      destinationTokenSelected.decimals
    )
    await contract.approve(ZRC20Address, value)
    const to =
      destination === "btc_testnet"
        ? ethers.utils.toUtf8Bytes(bitcoinAddress)
        : addressSelected
    const tx = await contract.withdraw(to, value)
    const token = sourceTokenSelected.symbol
    const from = sourceTokenSelected.chain_name
    const dest = destinationTokenSelected.chain_name
    const inbound = {
      inboundHash: tx.hash,
      desc: `Sent ${sourceAmount} ${token} from ${from} to ${dest}`,
    }
    setInbounds([...inbounds, inbound])
  }

  m.depositNative = async () => {
    const from = sourceTokenSelected.chain_name
    const to = destinationTokenSelected.chain_name
    const token = sourceTokenSelected.symbol
    const tx = await client.sendZRC20(
      signer,
      sourceAmount,
      from,
      to,
      address as string,
      token
    )
    const inbound = {
      inboundHash: tx.hash,
      desc: `Sent ${sourceAmount} ${token} from ${from} to ${to}`,
    }
    setInbounds([...inbounds, inbound])
  }

  m.depositERC20 = async () => {
    const custodyAddress = getAddress(
      "erc20Custody",
      sourceTokenSelected.chain_name
    )
    const custodyContract = new ethers.Contract(
      custodyAddress as any,
      ERC20Custody.abi,
      signer
    )
    const assetAddress = sourceTokenSelected.contract
    const amount = ethers.utils.parseUnits(
      sourceAmount,
      sourceTokenSelected.decimals
    )
    try {
      const contract = new ethers.Contract(assetAddress, ERC20_ABI.abi, signer)
      await (await contract.approve(custodyAddress, amount)).wait()
      const tx = await custodyContract.deposit(
        addressSelected,
        assetAddress,
        amount,
        "0x"
      )
      await tx.wait()
      const token = sourceTokenSelected.symbol
      const from = sourceTokenSelected.chain_name
      const dest = destinationTokenSelected.chain_name
      const inbound = {
        inboundHash: tx.hash,
        desc: `Sent ${sourceAmount} ${token} from ${from} to ${dest}`,
      }
      setInbounds([...inbounds, inbound])
    } catch (error) {
      console.error("Error during deposit: ", error)
    }
  }

  m.transferBTC = () => {
    if (!bitcoinAddress) {
      console.error("Bitcoin address undefined.")
      return
    }
    const a = parseFloat(sourceAmount) * 1e8
    const memo = ""
    window.xfi.bitcoin.request(
      bitcoinXDEFITransfer(bitcoinAddress, addressSelected, a, memo)
    )
  }

  m.crossChainSwapHandle = async (action: string) => {
    const d = destinationTokenSelected
    const zrc20 = d.coin_type === "ZRC20" ? d.contract : d.zrc20
    let recipient
    try {
      if (bech32.decode(addressSelected)) {
        recipient = utils.solidityPack(
          ["bytes"],
          [utils.toUtf8Bytes(addressSelected)]
        )
      }
    } catch (e) {
      recipient = addressSelected
    }

    const data = prepareData(
      omnichainSwapContractAddress,
      ["uint8", "address", "bytes"],
      [action, zrc20, recipient]
    )

    const to = getAddress("tss", sourceTokenSelected.chain_name)
    const value = parseEther(sourceAmount)

    const tx = await signer?.sendTransaction({ data, to, value })

    const tiker = sourceTokenSelected.ticker
    const from = sourceTokenSelected.chain_name
    const dest = destinationTokenSelected.chain_name

    if (tx) {
      const inbound = {
        inboundHash: tx.hash,
        desc: `Sent ${sourceAmount} ${tiker} from ${from} to ${dest}`,
      }
      setInbounds([...inbounds, inbound])
    }
  }

  m.crossChainSwap = () => m.crossChainSwapHandle("1")
  m.crossChainSwapTransfer = () => m.crossChainSwapHandle("2")
  m.crossChainSwapBTC = () => m.crossChainSwapBTCHandle("01")
  m.crossChainSwapBTCTransfer = () => m.crossChainSwapBTCHandle("02")

  const handleSend = async () => {
    setIsSending(true)

    if (!address) {
      setIsSending(false)
      throw new Error("Address undefined.")
    }

    try {
      await m[sendType as keyof typeof m]()
      setSourceAmount("")
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
    }
  }

  const handleSwitchNetwork = async () => {
    const chain_id = sourceTokenSelected?.chain_id
    if (chain_id) {
      switchNetwork?.(chain_id)
    }
  }

  return (
    <div className="shadow-none md:shadow-xl p-0 md:px-5 md:py-7 rounded-2xl md:shadow-gray-100 mb-10">
      <h1 className="text-2xl font-bold leading-tight tracking-tight mt-6 mb-4 ml-2">
        Swap
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Input
            className="col-span-2 h-full text-xl border-none"
            onChange={(e) => setSourceAmount(e.target.value)}
            placeholder="0"
            value={sourceAmount}
            disabled={isSending}
            type="number"
            step="any"
          />
          <Popover open={sourceTokenOpen} onOpenChange={setSourceTokenOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={sourceTokenOpen}
                className="justify-between col-span-2 h-full overflow-x-hidden border-none"
              >
                <div className="flex flex-col w-full items-start">
                  <div className="text-xs w-full flex justify-between">
                    <div>
                      {sourceTokenSelected
                        ? sourceTokenSelected.symbol
                        : "Token"}
                    </div>
                    <div>
                      {sourceTokenSelected &&
                        parseFloat(sourceTokenSelected.balance).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {sourceTokenSelected
                      ? sourceTokenSelected.chain_name
                      : "Select token"}
                  </div>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-75" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 border-none shadow-2xl">
              <Command>
                <CommandInput placeholder="Search tokens..." />
                <CommandEmpty>No balances found.</CommandEmpty>
                <CommandGroup className="max-h-[400px] overflow-y-scroll">
                  {sourceBalances?.map((balances: any) => (
                    <CommandItem
                      key={balances.id}
                      className="hover:cursor-pointer"
                      value={balances.id}
                      onSelect={(c) => {
                        setSourceToken(c === sourceToken ? null : c)
                        setSourceTokenOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          sourceToken === balances.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="w-full">
                        <div className="flex justify-between">
                          <div>{balances.symbol}</div>
                          <div>{parseFloat(balances.balance).toFixed(2)}</div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {balances.chain_name}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="col-span-2 relative">
            <Input
              className="text-xl h-full border-none"
              type="number"
              placeholder=""
              value={destinationAmount}
              disabled={true}
            />
            {destinationAmountIsLoading && (
              <div className="translate-y-[-50%] absolute top-[50%] left-[1rem]">
                <Loader2 className="h-6 w-6 animate-spin opacity-40" />
              </div>
            )}
          </div>
          <Popover
            open={destinationTokenOpen}
            onOpenChange={setDestinationTokenOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={sourceTokenOpen}
                className="justify-between col-span-2 h-full overflow-x-hidden border-none"
              >
                <div className="flex flex-col w-full items-start">
                  <div className="text-xs">
                    {destinationTokenSelected
                      ? destinationTokenSelected.symbol
                      : "Token"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {destinationTokenSelected
                      ? destinationTokenSelected.chain_name
                      : "Select token"}
                  </div>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-75" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 border-none shadow-2xl">
              <Command>
                <CommandInput placeholder="Search tokens..." />
                <CommandEmpty>No balances found.</CommandEmpty>
                <CommandGroup className="max-h-[400px] overflow-y-scroll">
                  {destinationBalances?.map((balances: any) => (
                    <CommandItem
                      key={balances.id}
                      className="hover:cursor-pointer"
                      value={balances.id}
                      onSelect={(c) => {
                        setDestinationToken(c === destinationToken ? null : c)
                        setDestinationTokenOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          destinationToken === balances.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="w-full">
                        <div className="flex justify-between">
                          <div>{balances.symbol}</div>
                          <div>{parseFloat(balances.balance).toFixed(2)}</div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {balances.chain_name}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-x-2 flex ml-2 mt-6">
          {addressSelected && (
            <Popover
              open={customAddressOpen}
              onOpenChange={setCustomAddressOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  disabled={!canChangeAddress}
                  variant="outline"
                  className="rounded-full w-[110px] text-xs h-6 px-3"
                >
                  {isAddressSelectedValid ? (
                    <UserCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {formatAddress(addressSelected)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="rounded-xl flex p-2 space-x-2 w-[390px]">
                <Input
                  className="grow border-none text-xs px-2"
                  placeholder="Recipient address"
                  onChange={(e) => setCustomAddress(e.target.value)}
                  value={customAddress}
                />
                <div>
                  <Button
                    disabled={!isCustomAddressValid}
                    size="icon"
                    variant="outline"
                    onClick={saveCustomAddress}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {crossChainFee?.formatted && (
            <Popover open={isFeeOpen} onOpenChange={setIsFeeOpen}>
              <PopoverTrigger asChild>
                <Button
                  // disabled={true}
                  variant="outline"
                  className="rounded-full text-xs h-6 px-3"
                >
                  {crossChainFee.formatted}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="rounded-xl w-auto text-xs">
                <div className="font-medium text-center">Cross-Chain Fee</div>
                <div className="text-slate-400">
                  {crossChainFee?.amount.toFixed(15)}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="ml-2 mt-6">
          {isRightChain ? (
            <div>
              <Button
                variant="outline"
                onClick={handleSend}
                disabled={sendDisabled}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {sendButtonText}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleSwitchNetwork}
              disabled={
                isLoading && pendingChainId === sourceTokenSelected.chain_id
              }
            >
              {isLoading && pendingChainId === sourceTokenSelected.chain_id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              Switch Network
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default Transfer