import { useState, useCallback, useMemo } from 'react'
import {
  PublicKey,
  Keypair,
} from '@solana/web3.js'

import { useWallet } from '@solana/wallet-adapter-react'
import { useAnchorProvider } from '~/components/solana/solana-provider'
import { type Cluster } from '~/components/cluster/cluster-data-access'

import {
  VRGDAClient,
  type VRGDAInitParams,
  type VRGDAInfo,
  type TokenData
} from '~/lib/vrgda/index'

export const VRGDA_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || '4JfrrwUKvDRaM5DZFsuKE1uMD591KhSGGq3wq75JGwP5'
);

export function getVrgdaProgramId(cluster: Cluster) {
  switch (cluster.name) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return VRGDA_PROGRAM_ID;
  }
}


export function useVRGDA() {
  const { publicKey } = useWallet()
  const getProvider = useAnchorProvider()
  const [isLoading, setIsLoading] = useState(false)

  const vrgdaClient = useMemo(() => {
    const provider = getProvider()
    return provider ? VRGDAClient.create(provider) : null
  }, [getProvider])


  const initializeVRGDA = async (params: {
    mint: Keypair
    targetPrice: number
    decayConstant: number
    r: number
    totalSupply: number
    name: string
    symbol: string
    authority?: string
    vrgdaStartTimestamp?: number
    wsolMint?: string
    uri: string
  }) => {
    if (!publicKey) throw new Error('Wallet not connected')
    if (!vrgdaClient) throw new Error('VRGDA client not initialized')
    if (!params.uri)
      params.uri = ''
    try {
      setIsLoading(true)

      const vrgdaParams: VRGDAInitParams = {
        ...params,
        authority: params.authority ? new PublicKey(params.authority) : publicKey,
        wsolMint: params.wsolMint ? new PublicKey(params.wsolMint) : undefined,
      }

      return await vrgdaClient.initializeVRGDA(vrgdaParams)
    } catch (error: any) {
      console.error('Error initializing VRGDA:', error)
      throw new Error(error.message || String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const buyTokens = async (params: {
    amount: number
    vrgdaAddress: string
  }) => {
    if (!publicKey) throw new Error('Wallet not connected')
    if (!vrgdaClient) throw new Error('VRGDA client not initialized')

    try {
      return await vrgdaClient.buyTokens(params)
    } catch (error: any) {
      console.error('Error buying tokens:', error)
      throw new Error(error.message || String(error))
    }
  }

  const calculatePrice = (params: {
    timePassed: number
    tokensSold: number
    targetPrice: number
    decayConstant: number
    r: number
    reservePrice?: number
  }): number => {
    if (!vrgdaClient) return 0
    return vrgdaClient.calculatePrice(params)
  }

  const getVrgdaInfo = async (vrgdaAddress: string): Promise<VRGDAInfo> => {
    if (!vrgdaClient) throw new Error('VRGDA client not initialized')
    return await vrgdaClient.getVRGDAInfo(vrgdaAddress)
  }

  return {
    isLoading,
    initializeVRGDA,
    buyTokens,
    calculatePrice,
    getVrgdaInfo,
    vrgdaClient, // Expose the client for advanced usage
  }
}

export type { TokenData }

