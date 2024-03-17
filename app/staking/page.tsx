"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import Link from "next/link"
import { generatePostBodyBroadcast } from "@evmos/provider"
import {
  createTxMsgBeginRedelegate,
  createTxMsgDelegate,
  createTxMsgMultipleWithdrawDelegatorReward,
  createTxMsgUndelegate,
  createTxRawEIP712,
  signatureToWeb3Extension,
} from "@evmos/transactions"
import { getChainId, getEndpoints } from "@zetachain/networks"
import { bech32 } from "bech32"
import { formatDistanceToNow } from "date-fns"
import {
  AlertTriangle,
  ArrowBigDown,
  ArrowBigUp,
  Check,
  ChevronDown,
  Clock4,
  Copy,
  Eye,
  Gift,
  Globe2,
  Redo2,
  RefreshCw,
} from "lucide-react"
import { formatUnits, parseUnits } from "viem"
import { useAccount, useNetwork } from "wagmi"

import {
  bech32ToHexAddress,
  hexToBech32Address,
} from "@/lib/hexToBech32Address"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { AppContext } from "@/app/index"

const StakingPage = () => {
  const {
    validators,
    fetchValidators,
    fetchStakingDelegations,
    stakingDelegations,
    balances,
    fetchStakingRewards,
    stakingRewards,
    validatorsLoading,
    fetchUnbondingDelegations,
    unbondingDelegations,
    fetchBalances,
    observers,
    fetchObservers,
  } = useContext(AppContext)
  const [selectedValidator, setSelectedValidator] = useState<any>(null)
  const [isSending, setIsSending] = useState(false)
  const [isZetaChain, setIsZetaChain] = useState(false)
  const [amount, setAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [redelegateAmount, setRedelegateAmount] = useState("")
  const { address, isConnected, connector } = useAccount()
  const { toast } = useToast()
  const { chain } = useNetwork()
  const [showJailedValidators, setShowJailedValidators] = useState(false)
  const [withdrawAmountValid, setWithdrawAmountValid] = useState(false)
  const [selectedValidatorSelfDelegation, setSelectedValidatorSelfDelegation] =
    useState<any>(null)
  const [redelegateValidatorSelected, setRedelegateValidatorSelected] =
    useState<any>(null)
  const [redelegationDropdownOpen, setRedelegationDropdownOpen] =
    useState(false)

  const zetaChainId = getChainId("zeta_testnet") as number

  useEffect(() => {
    if (selectedValidator) {
      try {
        const amount = parseUnits(withdrawAmount.toString(), 18)
        const staked = BigInt(
          getStakedAmount(selectedValidator.operator_address)
        )
        setWithdrawAmountValid(amount > 0 && amount <= staked)
      } catch (e) {
        console.error(e)
        setWithdrawAmountValid(false)
      }
    }
  }, [withdrawAmount])

  useEffect(() => {
    setIsZetaChain(chain?.id === zetaChainId)
  }, [chain])

  const fetchStakingData = () => {
    fetchStakingDelegations()
    fetchValidators()
    fetchStakingRewards()
    fetchUnbondingDelegations()
    fetchBalances()
    fetchObservers()
  }

  useEffect(() => {
    fetchStakingData()
  }, [address, isConnected])

  const toggleJailedValidators = () => {
    setShowJailedValidators(!showJailedValidators)
  }

  const stakingRewardsTotal = stakingRewards.reduce((a: any, c: any) => {
    if (c.reward && c.reward.length > 0) {
      const azetaReward = c.reward.find((r: any) => r.denom === "azeta")
      if (azetaReward) {
        return a + parseFloat(azetaReward.amount)
      }
    }
    return a
  }, 0)

  const stakingAmountTotal = stakingDelegations.reduce((a: any, c: any) => {
    const amount = BigInt(c.balance.amount)
    return a + amount
  }, BigInt(0))

  const findBalance = (chainId: number, coinType: string) => {
    const balance = balances.find(
      (b: any) => b.chain_id === chainId && b.coin_type === coinType
    )
    return balance ? balance.balance : "0"
  }

  const zetaBalance = findBalance(zetaChainId, "Gas")

  const handleSelectValidator = async (validator: any) => {
    const same =
      selectedValidator &&
      validator.operator_address === selectedValidator.operator_address
    setSelectedValidator(same ? null : validator)
  }

  const delegatedValidatorAddresses = new Set(
    stakingDelegations.map((d: any) => {
      if (parseInt(d.balance.amount) > 0) {
        return d.delegation.validator_address
      }
    })
  )

  const unbondingValidatorsAddresses = new Set(
    unbondingDelegations.map((u: any) => u.validator_address)
  )

  const sortedValidators = validators
    .filter((v: any) => {
      const isJailed = v.jailed
      const hasStaked = delegatedValidatorAddresses.has(v.operator_address)
      const hasPendingUnstaking = unbondingValidatorsAddresses.has(
        v.operator_address
      )

      return !isJailed || (isJailed && (hasStaked || hasPendingUnstaking))
    })
    .sort((a: any, b: any) => {
      const aDelegated = delegatedValidatorAddresses.has(a.operator_address)
      const bDelegated = delegatedValidatorAddresses.has(b.operator_address)
      const aUnbonding = unbondingValidatorsAddresses.has(a.operator_address)
      const bUnbonding = unbondingValidatorsAddresses.has(b.operator_address)

      if (aDelegated && !bDelegated) return -1
      if (!aDelegated && bDelegated) return 1

      if (aUnbonding && !bUnbonding) return -1
      if (!aUnbonding && bUnbonding) return 1

      if (a.jailed && !b.jailed) return 1
      if (!a.jailed && b.jailed) return -1

      return b.voting_power - a.voting_power
    })

  const sortedValidatorsJailed = validators
    .filter((v: any) => {
      const isJailed = v.jailed
      const hasStaked = delegatedValidatorAddresses.has(v.operator_address)
      const hasPendingUnstaking = unbondingValidatorsAddresses.has(
        v.operator_address
      )

      return isJailed && !hasStaked && !hasPendingUnstaking
    })
    .sort((a: any, b: any) => {
      return b.voting_power - a.voting_power
    })

  const getStakedAmount = (validatorAddress: string) => {
    const delegation = stakingDelegations.find(
      (d: any) => d.delegation.validator_address === validatorAddress
    )
    return delegation && parseUnits(delegation.balance.amount, 18) > BigInt(0)
      ? delegation.balance.amount
      : null
  }

  const LoadingSkeleton = () => {
    return (
      <div className="space-y-4">
        {Array(10)
          .fill(null)
          .map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
      </div>
    )
  }

  const fetchSelfDelegation = useCallback(async () => {
    if (!selectedValidator) setSelectedValidatorSelfDelegation(null)
    try {
      if (selectedValidator) {
        const addr = selectedValidator.operator_address
        const api = getEndpoints("cosmos-http", "zeta_testnet")[0]?.url
        const delegator = convertToBech32(addr, "zeta")
        const url = `${api}/cosmos/staking/v1beta1/validators/${addr}/delegations/${delegator}`
        const response = await fetch(url)
        const data = await response.json()
        const amount = data?.delegation_response?.balance?.amount
        setSelectedValidatorSelfDelegation(amount / selectedValidator.tokens)
      }
    } catch (e) {
      console.error(e)
    }
  }, [selectedValidator])

  useEffect(() => {
    fetchSelfDelegation()
  }, [selectedValidator])

  const sendCosmosTx = async (
    params: any,
    createTxFunction: (
      chain: any,
      sender: any,
      fee: any,
      memo: string,
      params: any
    ) => any,
    customFee?: { amount: string; denom: string; gas: string }
  ) => {
    const provider = connector?.options.getProvider()
    const api = getEndpoints("cosmos-http", "zeta_testnet")[0]?.url
    const accountAddress = hexToBech32Address(address as any, "zeta")
    const url = `${api}/cosmos/auth/v1beta1/accounts/${accountAddress}`
    const broadcastURL = `${api}/cosmos/tx/v1beta1/txs`
    const { account } = await (await fetch(url))?.json()
    const { sequence, account_number } = account?.base_account
    const pubkey = account?.base_account.pub_key.key
    const chain = { chainId: zetaChainId, cosmosChainId: "athens_7001-1" }
    const sender = {
      accountAddress,
      sequence,
      accountNumber: account_number,
      pubkey,
    }
    const fee = customFee || {
      amount: "4000000000000000",
      denom: "azeta",
      gas: "500000",
    }
    const memo = ""
    const txDetails = { chain, sender, fee, memo, params }
    const tx = createTxFunction(
      ...(Object.values(txDetails) as [any, any, any, string, any])
    )
    if (address) {
      const signature = await provider.request({
        method: "eth_signTypedData_v4",
        params: [address, JSON.stringify(tx.eipToSign)],
      })

      const extension = signatureToWeb3Extension(
        chain,
        sender,
        signature as any
      )

      const rawTx = createTxRawEIP712(
        tx.legacyAmino.body,
        tx.legacyAmino.authInfo,
        extension
      )
      const post = await fetch(broadcastURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: generatePostBodyBroadcast({
          message: {
            toBinary() {
              return rawTx.message.serializeBinary()
            },
          },
          path: rawTx.path,
        }),
      })
      return await post.json()
    }
  }

  const handleClaimReward = async () => {
    let result: any = null
    const validatorAddresses = stakingRewards.map(
      (r: any) => r.validator_address
    )
    const customFee = {
      amount: "4000000000000000",
      denom: "azeta",
      gas: (validatorAddresses.length * 100000).toString(),
    }
    try {
      result = await sendCosmosTx(
        {
          validatorAddresses,
        },
        createTxMsgMultipleWithdrawDelegatorReward,
        customFee
      )
    } catch (e) {
      console.error(e)
    } finally {
      if (result) {
        const success = result?.tx_response?.code === 0
        const title = success ? "Success" : "Error"
        const description = success ? "All good." : result?.tx_response?.raw_log
        toast({
          title,
          description,
          variant: success ? "default" : "destructive",
        })
      }
    }
  }

  const unbondingDelegationsTotal = unbondingDelegations.reduce(
    (totalSum: any, delegator: any) => {
      const delegatorSum = delegator.entries.reduce((sum: any, entry: any) => {
        return sum + BigInt(entry.balance)
      }, BigInt(0))
      return BigInt(totalSum) + BigInt(delegatorSum)
    },
    0
  )

  const handleWithdraw = async () => {
    setIsSending(true)
    let result: any = null
    try {
      result = await sendCosmosTx(
        {
          validatorAddress: selectedValidator.operator_address,
          amount: parseUnits(withdrawAmount.toString(), 18).toString(),
          denom: "azeta",
        },
        createTxMsgUndelegate
      )
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
      setWithdrawAmount("")
      if (result) {
        const success = result?.tx_response?.code === 0
        const title = success ? "Success" : "Error"
        const description = success
          ? "Successfully withdrawn."
          : result?.tx_response?.raw_log
        toast({
          title,
          description,
          variant: success ? "default" : "destructive",
        })
      }
    }
  }

  const handleStake = async () => {
    setIsSending(true)
    let result: any = null
    try {
      result = await sendCosmosTx(
        {
          validatorAddress: selectedValidator.operator_address,
          amount: parseUnits(amount, 18).toString(),
          denom: "azeta",
        },
        createTxMsgDelegate
      )
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
      setAmount("")
      if (result) {
        const success = result?.tx_response?.code === 0
        const title = success ? "Success" : "Error"
        const description = success
          ? "Successfully delegated."
          : result?.tx_response?.raw_log
        toast({
          title,
          description,
          variant: success ? "default" : "destructive",
        })
      }
    }
  }

  const unbondingDelegationsFor = (validatorAddress: string) => {
    return unbondingDelegations.find((x: any) => {
      return x.validator_address === validatorAddress
    })?.entries
  }

  const ValidatorTable = () => {
    const jailedValidators = sortedValidators.filter((v: any) => v.jailed)

    return (
      <div className="mb-20">
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead>Validator</TableHead>
              <TableHead className="text-right">Staked</TableHead>
              <TableHead className="text-right">Voting&nbsp;power</TableHead>
              <TableHead className="text-right">Commission</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedValidators.map((v: any) => {
              const unbonding = unbondingDelegationsFor(
                v.operator_address
              )?.reduce((a: any, c: any) => a + BigInt(c.balance), BigInt(0))
              const stakedAmount = getStakedAmount(v.operator_address)
              return (
                <TableRow
                  key={v.operator_address}
                  className="transition-none border-none cursor-pointer relative"
                  onClick={() => handleSelectValidator(v)}
                >
                  <TableCell
                    className={`pl-4 rounded-bl-xl rounded-tl-xl ${
                      v.jailed ? "text-rose-500" : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        {v.description.moniker}
                        {v.jailed && <AlertTriangle className="h-4 w-4" />}
                        {isObserver(v.operator_address) && (
                          <Eye className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {stakedAmount &&
                      `${(parseFloat(stakedAmount) / 1e18).toFixed(2)}`}
                    {unbonding && (
                      <div className="text-xs flex items-center gap-1 justify-end text-slate-400">
                        <Clock4 className="w-3 h-3" />
                        {parseFloat(formatUnits(unbonding, 18)).toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span>{parseFloat(v.voting_power).toFixed(2)}</span>%
                  </TableCell>
                  <TableCell className="rounded-br-xl rounded-tr-xl text-right">
                    <span>
                      {(
                        parseFloat(v.commission.commission_rates.rate) * 100
                      ).toFixed(0)}
                    </span>
                    %
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {sortedValidatorsJailed.length > 0 && showJailedValidators && (
          <div>
            <Separator className="mx-4 my-4" />
            <Table>
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-black flex items-center gap-1">
                    Jailed Validators
                    <AlertTriangle className="h-4 w-4" />
                  </TableHead>
                  <TableHead className="text-right">
                    Voting&nbsp;power
                  </TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedValidatorsJailed.map((v: any) => (
                  <TableRow
                    key={v.operator_address}
                    className="transition-none border-none cursor-pointer"
                    onClick={() => handleSelectValidator(v)}
                  >
                    <TableCell className="pl-4 rounded-bl-xl rounded-tl-xl">
                      {v.description.moniker}
                    </TableCell>
                    <TableCell className="text-right">
                      <span>{parseFloat(v.voting_power).toFixed(2)}</span>%
                    </TableCell>
                    <TableCell className="rounded-br-xl rounded-tr-xl text-right">
                      <span>
                        {(
                          parseFloat(v.commission.commission_rates.rate) * 100
                        ).toFixed(0)}
                      </span>
                      %
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="my-5 flex justify-center">
          <Button variant="link" onClick={toggleJailedValidators}>
            {showJailedValidators ? "Hide" : "Show"} Jailed Validators
          </Button>
        </div>
      </div>
    )
  }

  const findValidatorAddressByMoniker = (moniker: string) => {
    for (const v of sortedValidators) {
      if (v.description.moniker.toLowerCase() === moniker.toLowerCase()) {
        return v.operator_address
      }
    }
    return null
  }

  const findValidatorMonikerByAddress = (address: string) => {
    for (const v of sortedValidators) {
      if (
        v.operator_address.toLowerCase() ===
        redelegateValidatorSelected.toLowerCase()
      ) {
        return v.description.moniker
      }
    }
    return null
  }

  const handleRedelegate = async () => {
    let result: any = null
    try {
      result = await sendCosmosTx(
        {
          validatorSrcAddress: selectedValidator.operator_address,
          validatorDstAddress: redelegateValidatorSelected,
          amount: parseUnits(redelegateAmount, 18).toString(),
          denom: "azeta",
        },
        createTxMsgBeginRedelegate
      )
    } catch (e) {
      console.error(e)
    } finally {
      setRedelegateAmount("")
      setRedelegateValidatorSelected("")
      if (result) {
        const success = result?.tx_response?.code === 0
        const title = success ? "Success" : "Error"
        const description = success
          ? "Successfully redelegated."
          : result?.tx_response?.raw_log
        toast({
          title,
          description,
          variant: success ? "default" : "destructive",
        })
      }
    }
  }

  function shortenAddress(address: any) {
    let isBech32 = false
    try {
      isBech32 = !!bech32.decode(address)
    } catch (error) {}
    if (isBech32) {
      try {
        const decoded = bech32.decode(address)
        const fullAddress = bech32.encode(decoded.prefix, decoded.words)

        const dataPartStart = fullAddress.indexOf("1") + 1

        if (fullAddress.length - dataPartStart > 8) {
          const start = fullAddress.substring(dataPartStart, dataPartStart + 4)
          const end = fullAddress.slice(-4)
          return `${decoded.prefix}1${start}...${end}`
        } else {
          return fullAddress
        }
      } catch (error) {
        return address
      }
    } else if (address.startsWith("0x")) {
      if (address.length > 10) {
        const start = address.slice(2, 6)
        const end = address.slice(-4)
        return `0x${start}...${end}`
      } else {
        return address
      }
    } else {
      return address
    }
  }

  const convertToBech32 = (address: any, prefix: string) => {
    try {
      const decoded = bech32.decode(address)
      return bech32.encode(prefix, decoded.words)
    } catch (error) {
      console.error("Error converting address:", error)
    }
    return address
  }

  const isObserver = (address: string) => {
    return observers.find(
      (o: any) => convertToBech32(o.operator, "zetavaloper") === address
    )
  }

  const handleCopy = async (x: any) => {
    await navigator.clipboard.writeText(x)
    toast({
      title: "Copied to clipboard",
      description: <div className="text-xs">{x}</div>,
      variant: "default",
    })
  }

  const formatSelfDelegation = (selfDelegation: any) => {
    let percentage = selfDelegation * 100
    let numStr = percentage.toString()
    let decimalIndex = numStr.indexOf(".")
    if (decimalIndex === -1) {
      return numStr
    }
    let meaningfulDigits = 0
    let index = decimalIndex + 1
    while (meaningfulDigits < 2 && index < numStr.length) {
      if (numStr[index] !== "0") {
        meaningfulDigits++
      }
      index++
    }
    let digitsAfterDecimal = index - decimalIndex - 1

    return percentage.toFixed(digitsAfterDecimal)
  }

  return (
    <div className="grid sm:grid-cols-3 gap-x-10 mt-12">
      <div className="sm:col-span-2 overflow-x-scroll">
        <div className="flex items-center justify-start gap-2 mb-6">
          <h1 className="leading-10 text-2xl font-bold tracking-tight pl-4">
            Staking
          </h1>
          <Button size="icon" variant="ghost" onClick={fetchStakingData}>
            <RefreshCw
              className={`h-4 w-4 ${validatorsLoading && "animate-spin"}`}
            />
          </Button>
        </div>
        <div className="mb-6">
          <Card className="py-6 shadow-none border-none mb-2">
            <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
              <div className="border border-gray-100 p-4 rounded-2xl">
                <div className="text-xs text-muted-foreground">Available</div>
                <div className="text-xl flex items-center font-semibold">
                  {parseFloat(zetaBalance).toFixed(4)} ZETA
                </div>
              </div>
              <div className="flex flex-col gap-3 border border-gray-100 p-4 rounded-2xl">
                <div>
                  <div className="text-xs text-muted-foreground">Staked</div>
                  <div className="text-xl flex items-center">
                    {parseFloat(formatUnits(stakingAmountTotal, 18)).toFixed(2)}
                    &nbsp;ZETA
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    Unstaking <Clock4 className="w-3 h-3" />
                  </div>
                  <div className="text-xl flex items-center">
                    {parseFloat(
                      formatUnits(unbondingDelegationsTotal, 18)
                    ).toFixed(2)}
                    &nbsp;ZETA
                  </div>
                </div>
              </div>
              <div className="border border-gray-100 rounded-2xl flex flex-col justify-between">
                <div className="p-4">
                  <div className="text-xs text-muted-foreground">Rewards</div>
                  <div className="text-xl flex items-center">
                    {parseFloat(
                      formatUnits(BigInt(parseInt(stakingRewardsTotal)), 18)
                    ).toFixed(6)}
                    &nbsp;ZETA
                  </div>
                </div>
                <div className="p-2">
                  <Button
                    onClick={handleClaimReward}
                    disabled={!isZetaChain}
                    variant="outline"
                    className="w-full rounded-lg"
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Claim rewards
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div>
          {validators.length > 0 ? (
            <ValidatorTable />
          ) : (
            <div className="pl-4">
              <LoadingSkeleton />
            </div>
          )}
        </div>
      </div>
      <div className="sm:col-span-1 relative order-first sm:order-last">
        {selectedValidator && (
          <div className="sticky max-h-[75vh] transition-all top-20 shadow-none md:shadow-xl p-0 md:px-4 md:py-7 rounded-2xl md:shadow-gray-100 mb-10 overflow-x-hidden">
            <h1 className="text-2xl flex items-center gap-2 font-bold leading-tight tracking-tight mt-6 mb-4 ml-3">
              {selectedValidator?.description.moniker}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Copy className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-none shadow-2xl rounded-lg">
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopy(
                        convertToBech32(
                          selectedValidator.operator_address,
                          "zeta"
                        )
                      )
                    }
                  >
                    {shortenAddress(
                      convertToBech32(
                        selectedValidator.operator_address,
                        "zeta"
                      )
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopy(selectedValidator.operator_address)
                    }
                  >
                    {shortenAddress(selectedValidator.operator_address)}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopy(
                        bech32ToHexAddress(selectedValidator.operator_address)
                      )
                    }
                  >
                    {shortenAddress(
                      bech32ToHexAddress(selectedValidator.operator_address)
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </h1>
            {selectedValidator.jailed && (
              <div className="ml-3 mb-4 flex items-center text-rose-500 text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <div>Validator is jailed</div>
              </div>
            )}
            <div className="ml-3 mb-2">
              {selectedValidator?.description.details}
            </div>
            {isObserver(selectedValidator.operator_address) && (
              <div className="ml-3 my-4 flex items-center text-sm">
                <Eye className="h-4 w-4 mr-1" />
                <div>This is an observer validator</div>
              </div>
            )}
            {selectedValidator?.description.website && (
              <div>
                <Button variant="link" asChild className="p-3">
                  <Link
                    href={selectedValidator?.description.website}
                    target="_blank"
                  >
                    <Globe2 className="w-4 h-4 mr-1" />
                    {selectedValidator?.description.website
                      .replace(/^(https?:\/\/)/, "")
                      .replace(/\/$/, "")}
                  </Link>
                </Button>
              </div>
            )}
            {getStakedAmount(selectedValidator.operator_address) && (
              <Card className="shadow-none rounded-2xl border-gray-100">
                <div className="mx-3 my-4 grid grid-cols-2">
                  <div className="text-sm font-semibold">Staked</div>
                  <div className="text-sm text-right">
                    {(
                      parseFloat(
                        getStakedAmount(selectedValidator.operator_address)
                      ) / 1e18
                    )
                      .toFixed(2)
                      .toString()}
                    &nbsp;ZETA
                  </div>
                </div>
                <div className="p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Popover onOpenChange={() => setWithdrawAmount("")}>
                      <PopoverTrigger asChild disabled={!isZetaChain}>
                        <Button
                          variant="outline"
                          className="rounded-lg w-full"
                          disabled={!isZetaChain}
                        >
                          <ArrowBigDown className="w-4 h-4 mr-1" />
                          Withdraw
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="flex flex-col gap-2 rounded-lg shadow-2xl border-none">
                        <div className="flex border-solid border-gray-200 rounded-lg border">
                          <Input
                            type="number"
                            placeholder="0"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            min="0"
                            className="text-xl rounded-lg border-none"
                          />
                          <Button
                            onClick={() => {
                              const addr = selectedValidator.operator_address
                              const am = formatUnits(getStakedAmount(addr), 18)
                              const isInt = Number.isInteger(parseFloat(am))
                              setWithdrawAmount(
                                isInt ? parseInt(am).toString() : am.toString()
                              )
                            }}
                            variant="link"
                            className="text-xs tracking-wide"
                          >
                            MAX
                          </Button>
                        </div>
                        <Button
                          className="grow rounded-lg w-full"
                          onClick={handleWithdraw}
                          disabled={!isZetaChain || !withdrawAmountValid}
                        >
                          Withdraw
                        </Button>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild disabled={!isZetaChain}>
                        <Button
                          variant="outline"
                          className="rounded-lg w-full"
                          disabled={!isZetaChain}
                        >
                          <Redo2 className="w-4 h-4 mr-1" />
                          Redelegate
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="flex flex-col gap-2 rounded-lg shadow-2xl border-none">
                        <Input
                          type="number"
                          placeholder="0"
                          value={redelegateAmount}
                          onChange={(e) => setRedelegateAmount(e.target.value)}
                          min="0"
                          className="text-xl rounded-lg"
                        />
                        <Popover
                          open={redelegationDropdownOpen}
                          onOpenChange={setRedelegationDropdownOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              className="w-full flex justify-between px-3"
                              variant="outline"
                            >
                              <div>
                                {redelegateValidatorSelected
                                  ? findValidatorMonikerByAddress(
                                      redelegateValidatorSelected
                                    )
                                  : "Select a validator"}
                              </div>
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0 rounded-lg shadow-2xl border-none">
                            <Command>
                              <CommandInput placeholder="Search tokens..." />
                              <CommandEmpty>No balances found.</CommandEmpty>
                              <CommandGroup className="max-h-[400px] overflow-y-scroll">
                                {sortedValidators?.map((v: any) => (
                                  <CommandItem
                                    key={v.operator_address}
                                    value={v.description.moniker}
                                    onSelect={(m: string) => {
                                      const v = findValidatorAddressByMoniker(m)
                                      setRedelegateValidatorSelected(v)
                                      setRedelegationDropdownOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 opacity-${
                                        redelegateValidatorSelected ===
                                        v.operator_address
                                          ? 100
                                          : 0
                                      }`}
                                    />
                                    <div className="w-full">
                                      <div className="flex justify-between">
                                        <div>{v.description.moniker}</div>
                                        <div>{v.voting_power.toFixed(2)}%</div>
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
                        <Button
                          className="grow rounded-lg w-full"
                          disabled={!isZetaChain}
                          onClick={handleRedelegate}
                        >
                          Redelegate
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </Card>
            )}
            {unbondingDelegationsFor(selectedValidator.operator_address) && (
              <Card className="my-4 shadow-none rounded-2xl border-gray-100 text-sm">
                <div className="mx-3 my-4 font-semibold flex items-center gap-1">
                  Unstaking <Clock4 className="w-3 h-3" />
                </div>
                {unbondingDelegationsFor(
                  selectedValidator.operator_address
                ).map((x: any, key: number) => (
                  <div key={key} className="mx-3 my-4 grid grid-cols-2">
                    <div>
                      {formatDistanceToNow(x.completion_time, {
                        addSuffix: true,
                      })}
                    </div>
                    <div className="text-right">
                      {parseFloat(formatUnits(x.balance, 18)).toFixed(2)}
                      &nbsp;ZETA
                    </div>
                  </div>
                ))}
              </Card>
            )}
            <div className="mx-3 my-4 grid grid-cols-2">
              <div className="text-sm">Commission</div>
              <div className="text-sm text-right font-semibold">
                {selectedValidator.commission.commission_rates.rate * 100}%
              </div>
            </div>
            <div className="mx-3 my-4 grid grid-cols-2">
              <div className="text-sm">Self-delegation</div>
              <div className="text-sm text-right font-semibold">
                {selectedValidatorSelfDelegation &&
                  formatSelfDelegation(selectedValidatorSelfDelegation) + "%"}
              </div>
            </div>
            <Popover>
              <PopoverTrigger
                className="px-3 w-full"
                disabled={!isZetaChain}
                asChild
              >
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={!isZetaChain}
                >
                  <ArrowBigUp className="w-4 h-4 mr-1" />
                  Stake
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex gap-2 flex-col">
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={amount}
                      min="0"
                      className="text-xl mb-1 rounded-lg"
                      disabled={isSending || !isZetaChain}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="text-xs text-slate-400">
                      Available: {parseFloat(zetaBalance).toFixed(4)} ZETA
                    </div>
                  </div>
                  <Button
                    disabled={isSending || !isZetaChain}
                    className="rounded-lg"
                    onClick={handleStake}
                  >
                    Stake
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  )
}

export default StakingPage