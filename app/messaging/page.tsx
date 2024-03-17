"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import Link from "next/link"
import UniswapV2Factory from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json"
import { getExplorers } from "@zetachain/networks"
import { getEndpoints } from "@zetachain/networks/dist/src/getEndpoints"
import { getNetworkName } from "@zetachain/networks/dist/src/getNetworkName"
import networks from "@zetachain/networks/dist/src/networks"
import { getAddress, getNonZetaAddress } from "@zetachain/protocol-contracts"
import { ethers } from "ethers"
import { formatEther, parseEther } from "ethers/lib/utils"
import { AlertCircle, BookOpen, Check, Loader2, Send } from "lucide-react"
import { useDebounce } from "use-debounce"
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi"

import { useEthersSigner } from "@/lib/ethers"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AppContext } from "@/app/index"

const contracts: any = {
  goerli_testnet: "0x122F9Cca5121F23b74333D5FBd0c5D9B413bc002",
  mumbai_testnet: "0x392bBEC0537D48640306D36525C64442E98FA780",
  bsc_testnet: "0xc5d7437DE3A8b18f6380f3B8884532206272D599",
}

const MessagingPage = () => {
  const [message, setMessage] = useState("")
  const [destinationNetwork, setDestinationNetwork] = useState("")
  const [destinationChainID, setDestinationChainID] = useState(null)
  const [isZeta, setIsZeta] = useState(false)
  const [currentNetworkName, setCurrentNetworkName] = useState<any>("")
  const [completed, setCompleted] = useState(false)
  const [fee, setFee] = useState("")
  const [currentChain, setCurrentChain] = useState<any>()

  const [debouncedMessage] = useDebounce(message, 500)

  const allNetworks = Object.keys(contracts)
  const signer = useEthersSigner()

  const { chain } = useNetwork()
  useEffect(() => {
    setCurrentNetworkName(chain ? getNetworkName(chain.name) : undefined)
    if (chain) {
      setCurrentChain(chain)
      setIsZeta(getNetworkName(chain.name) === "zeta_testnet")
    }
  }, [chain])

  useEffect(() => {
    setDestinationChainID(
      (networks as any)[destinationNetwork]?.chain_id ?? null
    )
  }, [destinationNetwork])
  const { inbounds, setInbounds, fees } = useContext(AppContext)

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: contracts[currentNetworkName || ""],
    abi: [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "message",
            type: "string",
          },
        ],
        name: "sendMessage",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ],
    value: BigInt(parseFloat(fee) * 1e18 || 0),
    functionName: "sendMessage",
    args: [
      BigInt(destinationChainID !== null ? destinationChainID : 0),
      debouncedMessage,
    ],
  })

  const { data, write } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const convertZETAtoMATIC = async (amount: string) => {
    const quoterContract = new ethers.Contract(
      "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
      Quoter.abi,
      signer
    )
    const quotedAmountOut =
      await quoterContract.callStatic.quoteExactInputSingle(
        "0x0000c9ec4042283e8139c74f4c64bcd1e0b9b54f", // WZETA
        "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", // WMATIC
        500,
        parseEther(amount),
        0
      )
    return quotedAmountOut
  }

  const getCCMFee = useCallback(async () => {
    try {
      if (!currentNetworkName || !destinationNetwork) {
        throw new Error("Network is not selected")
      }
      const feeZETA = fees.feesCCM[destinationNetwork].totalFee
      let fee
      if (currentNetworkName === "mumbai_testnet") {
        fee = await convertZETAtoMATIC(feeZETA)
      } else {
        const rpc = getEndpoints("evm", currentNetworkName)[0]?.url
        const provider = new ethers.providers.JsonRpcProvider(rpc)
        const routerAddress = getNonZetaAddress(
          "uniswapV2Router02",
          currentNetworkName
        )
        const router = new ethers.Contract(
          routerAddress,
          UniswapV2Factory.abi,
          provider
        )
        const amountIn = ethers.utils.parseEther(feeZETA)
        const zetaToken = getAddress("zetaToken", currentNetworkName)
        const weth = getNonZetaAddress("weth9", currentNetworkName)
        let zetaOut = await router.getAmountsOut(amountIn, [zetaToken, weth])
        fee = zetaOut[1]
      }
      fee = Math.ceil(parseFloat(formatEther(fee)) * 1.01 * 100) / 100 // 1.01 is to ensure that the fee is enough
      setFee(fee.toString())
    } catch (error) {
      console.error(error)
    }
  }, [currentNetworkName, destinationNetwork])

  useEffect(() => {
    try {
      getCCMFee()
    } catch (error) {
      console.error(error)
    }
  }, [currentNetworkName, destinationNetwork, signer])

  const explorer =
    destinationNetwork &&
    getExplorers(
      contracts[destinationNetwork],
      "address",
      destinationNetwork
    )[0]

  useEffect(() => {
    if (isSuccess && data) {
      const inbound = {
        inboundHash: data.hash,
        desc: `Message sent to ${destinationNetwork}`,
      }
      setCompleted(true)
      setInbounds([inbound, ...inbounds])
    }
  }, [isSuccess, data])

  useEffect(() => {
    setCompleted(false)
  }, [destinationNetwork, message])

  const availableNetworks = allNetworks.filter(
    (network) => network !== currentNetworkName
  )

  function extractDomain(url: string): string | null {
    try {
      const parsedURL = new URL(url)
      const parts = parsedURL.hostname.split(".")
      if (parts.length < 2) {
        return null
      }
      return parts[parts.length - 2]
    } catch (error) {
      console.error("Invalid URL provided:", error)
      return null
    }
  }

  return (
    <div className="px-4">
      <h1 className="text-2xl font-bold leading-tight tracking-tight mt-6 mb-4">
        Cross-Chain Message
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-10 items-start">
        <div className="col-span-1 sm:col-span-2">
          <Card className="p-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                write?.()
              }}
            >
              <Input
                disabled
                value={currentNetworkName || "Please, connect wallet"}
              />
              {isZeta && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The protocol currently does not support sending cross-chain
                    messages to/from ZetaChain. Please, switch to another
                    network.
                  </AlertDescription>
                </Alert>
              )}
              <Select
                onValueChange={(e) => setDestinationNetwork(e)}
                disabled={isZeta}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Destination network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableNetworks.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                placeholder="Message"
                disabled={isZeta}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div>
                <Label>
                  Fee
                  {currentChain?.nativeCurrency &&
                    ` (in ${chain?.nativeCurrency?.symbol})`}
                  :
                </Label>
                <Input
                  id="fee"
                  placeholder="Fee"
                  value={fee}
                  disabled={!destinationNetwork}
                  type="number"
                  onChange={(e) => setFee(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={
                  isZeta ||
                  isLoading ||
                  !write ||
                  !message ||
                  !currentNetworkName
                }
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send message
              </Button>
            </form>
          </Card>
        </div>

        <div className="text-sm col-span-1 sm:col-span-3">
          <div className="max-w-prose leading-6 space-y-2">
            <p>
              This is a dapp that uses ZetaChain&apos;s{" "}
              <strong>cross-chain messaging</strong> for sending text messages
              between smart contracts deployed on different chains. It is a
              simple example of how to use the cross-chain messaging to send
              arbitrary data.
            </p>
            <p>
              You can learn how to build a dapp like this by following the
              tutorial:
            </p>
            <Link
              href="https://www.zetachain.com/docs/developers/cross-chain-messaging/examples/hello-world/"
              target="_blank"
            >
              <Button variant="outline" className="mt-4 mb-2">
                <BookOpen className="w-4 h-4 mr-2" />
                Tutorial
              </Button>
            </Link>
            <p>
              The dapp on this page interacts with a smart contract built from
              the same source code as in the tutorial. The smart contract is
              deployed on the following networks:
            </p>
          </div>
          <pre className="my-4 rounded-md bg-slate-950 p-4 w-full overflow-x-scroll">
            <code className="text-white">
              {JSON.stringify(contracts, null, 2)}
            </code>
          </pre>
          <div className="max-w-prose leading-6 space-y-2">
            <p>Let&apos;s try using the dapp:</p>
          </div>{" "}
          <ol className="mt-5 text-sm leading-6 space-y-4">
            <li className="flex">
              <Checkbox
                className="mr-2 mt-1"
                disabled
                checked={!!destinationNetwork}
              />
              <span className={cn(!!destinationNetwork && "line-through")}>
                First, select the destination network
              </span>
            </li>
            {!!destinationNetwork && (
              <li className="leading-6">
                <Alert>
                  You&apos;ve selected <strong>{destinationNetwork}</strong> as
                  the destination network.
                </Alert>
              </li>
            )}
            <li className="flex">
              <Checkbox className="mr-2 mt-1" disabled checked={!!message} />
              <span className={cn(!!message && "line-through")}>
                Next, write a message in the input field
              </span>
            </li>
            <li className="flex">
              <Checkbox className="mr-2 mt-1" disabled checked={completed} />
              <span className={cn(completed && "line-through")}>
                Finally, click Send message and confirm in your wallet
              </span>
            </li>
            {completed && (
              <li className="leading-6">
                <Alert>
                  Great! You&apos;ve sent a message from {currentNetworkName} to{" "}
                  {destinationNetwork}. Once the cross-chain transaction with
                  the message is processed you will be able to see it in the 
                  <strong>Events</strong> tab in 
                  <a
                    href={explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    {extractDomain(explorer)}
                  </a>
                  .
                </Alert>
              </li>
            )}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default MessagingPage