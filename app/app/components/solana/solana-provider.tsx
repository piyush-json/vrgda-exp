import { AnchorProvider } from '@coral-xyz/anchor'
import { WalletError } from '@solana/wallet-adapter-base'
import {
  type AnchorWallet,
  useConnection,
  useWallet,
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { lazy, memo, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
export const WalletButton = lazy(async () => ({
  default: (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton
}))

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster()
  const endpoint = useMemo(() => cluster.endpoint, [cluster])
  const onError = useCallback((error: WalletError) => {
    console.error(error)
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[
        new PhantomWalletAdapter(), new SolflareWalletAdapter()
      ]} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export function useAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const getProvider = useCallback(() => {
    if (!connection || !wallet) {
      return null
    }
    return new AnchorProvider(connection, wallet as AnchorWallet, {})
  }, [connection, wallet])
  return getProvider
}
