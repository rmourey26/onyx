import { 
  createConfig, 
  http, 
  cookieStorage,
  createStorage 
} from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia],
  ssr: true,
  storage: createStorage({  
    storage: cookieStorage, 
  }),  
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})