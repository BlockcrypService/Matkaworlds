import React, { createContext, useContext, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount, useDisconnect } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
import { wagmiAdapter, projectId, networks, bsc } from '../config/walletconfig'

const queryClient = new QueryClient()

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: bsc,
  metadata: {
    name: 'Matka Worlds',
    description: 'Play Smart. Play On-Chain.',
    url: 'https://play.matkaworlds.com', // MUST match the domain it is hosted on
    icons: ['https://play.matkaworlds.com/favicon.ico']
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
    history: false,
    send: false
  },
  allowUnsupportedChain: true
})

const WalletContext = createContext({
  isConnected: false,
  address: null,
  status: 'disconnected',
  disconnect: () => { },
})

export function WalletProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletStateWatcher>
          {children}
        </WalletStateWatcher>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function WalletStateWatcher({ children }) {
  const { isConnected, address, status, connector } = useAccount()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const value = {
    isConnected,
    address,
    status,
    disconnect: () => {
      if (connector) {
        wagmiDisconnect({ connector });
      } else {
        wagmiDisconnect();
      }
    }
  }

  return (
    <WalletContext.Provider value={value}>
      {!loading && children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}
