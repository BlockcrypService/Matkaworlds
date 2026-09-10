import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bsc } from '@reown/appkit/networks'

export const projectId = import.meta.env?.VITE_PROJECT_ID || '157b7402f4c07520909451f08a9a8838'

if (!projectId) {
  throw new Error('Project ID is not defined.')
}

export const networks = [bsc]
export { bsc }

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: false,
  projectId,
  networks,
  metadata: {
    name: 'Matka Worlds',
    description: 'Play Smart. Play On-Chain.',
    url: 'https://play.matkaworlds.com',
    icons: ['https://play.matkaworlds.com/favicon.ico']
  }
})

export const config = wagmiAdapter.wagmiConfig
