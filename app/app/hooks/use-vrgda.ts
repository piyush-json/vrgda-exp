import { useState, useCallback } from 'react'
import {
  PublicKey, SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  Keypair,
} from '@solana/web3.js'
import { BN, Program, web3 } from '@coral-xyz/anchor'
import { Buffer } from 'buffer'

import { useWallet } from '@solana/wallet-adapter-react'
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  MINT_SIZE,
  createSetAuthorityInstruction,
  AuthorityType,
  createInitializeMint2Instruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getMint,
  getMinimumBalanceForRentExemptMint,
  NATIVE_MINT,
  createSyncNativeInstruction,
  createMintToInstruction
} from '@solana/spl-token'
import { useAnchorProvider } from '~/components/solana/solana-provider'
import { type Cluster } from '~/components/cluster/cluster-data-access'
import { deserializeMetadata } from '@metaplex-foundation/mpl-token-metadata'

import type { Vrgda } from '../../idl/types/vrgda'
import vrgdaIdl from '../../idl/idl/vrgda.json'

const IDL = vrgdaIdl

export const VRGDA_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || '9rUZoTzHGK7SJ9jfAzVLaYW9uMv1YkA6pQcby1tFGRZb'
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

const DECIMAL = 1_000_000 // 6 decimals for VRGDA tokens

export function useVRGDA() {
  const { publicKey } = useWallet()
  const getProvider = useAnchorProvider()

  const [isLoading, setIsLoading] = useState(false)
  const confirmTx = useCallback(
    async (txSig: string) => {
      const connection = getProvider()?.connection
      if (!connection) {
        throw new Error('Connection not found')
      }
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: txSig,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });
      const txUrl = `Tx confirmed: https://explorer.solana.com/tx/${txSig}?cluster=localnet&customUrl=${connection.rpcEndpoint}`;
      console.log(txUrl);
      return txUrl;
    }, [getProvider])

  const initializeVRGDA = async (params: {
    mint: Keypair
    targetPrice: number
    decayConstant: number
    r: number
    totalSupply: number
    authority?: string
    vrgdaStartTimestamp?: number
    wsolMint?: string
  }) => {
    if (!publicKey) throw new Error('Wallet not connected')
    const provider = getProvider()
    if (!provider) throw new Error('Provider not found')

    const program = new Program(IDL, provider)

    // Validate parameters
    const validations = [
      [params.decayConstant <= 0, 'Decay constant must be greater than 0'],
      [params.r <= 0, 'r must be greater than 0'],
      [params.targetPrice <= 0, 'Target price must be greater than 0'],
      [params.totalSupply <= 0, 'Total supply must be greater than 0'],
      [params.totalSupply > 1e15, 'Total supply must be less than 1e15']
    ]

    for (const [condition, message] of validations) {
      if (condition) throw new Error(message as string)
    }

    try {
      setIsLoading(true)
      const mintPublic = params.mint.publicKey
      const authority = params.authority ? new PublicKey(params.authority) : publicKey
      const transaction = new Transaction()

      const mintInfo = await program.provider.connection.getAccountInfo(mintPublic)
      const mintExists = mintInfo !== null

      if (mintExists) {
        const mintAccount = await getMint(program.provider.connection, mintPublic)
        if (!mintAccount.mintAuthority?.equals(authority)) {
          throw new Error('You do not have mint authority over this existing mint')
        }
        if (mintAccount.decimals !== 6) {
          console.warn(`Warning: Existing mint has ${mintAccount.decimals} decimals, expected 6`)
        }
      } else {
        const lamportsForMint = await getMinimumBalanceForRentExemptMint(program.provider.connection)
        transaction.add(
          SystemProgram.createAccount({
            fromPubkey: authority,
            newAccountPubkey: mintPublic,
            space: MINT_SIZE,
            lamports: lamportsForMint,
            programId: TOKEN_PROGRAM_ID,
          }),
          createInitializeMint2Instruction(mintPublic, 6, authority, null, TOKEN_PROGRAM_ID)
        )
      }

      const [vrgdaPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vrgda"), mintPublic.toBuffer(), authority.toBuffer()],
        program.programId
      )

      const vrgdaInfo = await program.provider.connection.getAccountInfo(vrgdaPda)
      if (vrgdaInfo) {
        throw new Error('VRGDA already exists for this mint and authority')
      }

      const wsolMintPubkey = params.wsolMint
        ? new PublicKey(params.wsolMint)
        : new PublicKey("So11111111111111111111111111111111111111112")

      const vrgdaVault = await getAssociatedTokenAddress(
        mintPublic,
        vrgdaPda,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const vrgdaSolAta = await getAssociatedTokenAddress(
        wsolMintPubkey,
        authority,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const ataInfo = await program.provider.connection.getAccountInfo(vrgdaSolAta)
      if (!ataInfo) {
        transaction.add(
          createAssociatedTokenAccountIdempotentInstruction(
            authority,
            vrgdaSolAta,
            authority,
            wsolMintPubkey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        )
      }

      const targetPriceWad = new BN(params.targetPrice * LAMPORTS_PER_SOL).mul(new BN(LAMPORTS_PER_SOL))
      const vrgdaStartTimestamp = new BN(0)

      const initVrgdaIx = await program.methods
        .initializeVrgda(
          targetPriceWad,
          new BN(params.decayConstant * 100),
          vrgdaStartTimestamp,
          new BN(params.totalSupply * DECIMAL),
          new BN(params.r * DECIMAL)
        )
        .accounts({
          authority,
          vrgda: vrgdaPda,
          vrgdaVault,
          mint: mintPublic,
          vrgdaSolAta,
          wsolMint: wsolMintPubkey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([params.mint])
        .instruction()

      transaction.add(initVrgdaIx)
      transaction.add(
        createMintToInstruction(
          mintPublic,
          vrgdaVault,
          authority,
          params.totalSupply * DECIMAL,
          [],
          TOKEN_PROGRAM_ID
        )
      )
      transaction.add(
        createSetAuthorityInstruction(
          mintPublic,
          authority,
          AuthorityType.MintTokens,
          vrgdaPda,
          [],
          TOKEN_PROGRAM_ID
        )
      )

      const tx = await provider.sendAndConfirm(transaction, [params.mint], { maxRetries: 3 })
      await confirmTx(tx)

      return {
        success: true,
        signature: tx,
        txUrl: `https://explorer.solana.com/tx/${tx}?cluster=${provider.connection.rpcEndpoint}`,
        vrgda: vrgdaPda.toString(),
        mint: mintPublic.toString(),
        authority: authority.toString()
      }
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
    const provider = getProvider()
    if (!provider) throw new Error('Provider not found')

    if (params.amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    const program = new Program<Vrgda>(IDL, provider)
    const vrgda = new PublicKey(params.vrgdaAddress)
    const wsolMint = new PublicKey("So11111111111111111111111111111111111111112")

    try {
      setIsLoading(true)

      // Fetch VRGDA account data
      const vrgdaAccount = await program.account.vrgda.fetch(vrgda)
      const { mint, authority } = vrgdaAccount

      // Derive all required token accounts
      const [buyerAta, vrgdaVault, buyerWsolAta, vrgdaSolAta] = await Promise.all([
        getAssociatedTokenAddress(mint, publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
        getAssociatedTokenAddress(mint, vrgda, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
        getAssociatedTokenAddress(wsolMint, publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
        getAssociatedTokenAddress(wsolMint, authority, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
      ])

      const buyerWsolAtaInfo = await program.provider.connection.getAccountInfo(buyerWsolAta)
      const preInstructions = [
        web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 2000000 })
      ]

      if (!buyerWsolAtaInfo) {
        preInstructions.push(
          createAssociatedTokenAccountIdempotentInstruction(
            publicKey,
            buyerWsolAta,
            publicKey,
            wsolMint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        )
      }

      const amountToBuy = new BN(params.amount * DECIMAL)

      const r = Number(vrgdaAccount.schedule.linearSchedule.r.toString()) / DECIMAL
      const targetPrice = Number(vrgdaAccount.targetPrice.toString()) / (LAMPORTS_PER_SOL * LAMPORTS_PER_SOL)
      const decayConstant = Number(vrgdaAccount.decayConstantPercent.toString()) / 100
      const tokensSold = Number(vrgdaAccount.tokensSold.toString()) / DECIMAL
      const startTime = Number(vrgdaAccount.vrgdaStartTimestamp.toString())
      const currentTime = Math.floor(Date.now() / 1000)
      const timePassed = Math.max(0, currentTime - startTime)
      console.log({
        timePassed,
        tokensSold,
        targetPrice,
        decayConstant,
        r,
        startTime
      })
      let totalCost = 0
      for (let i = 0; i < params.amount; i++) {
        const tokenIndex = tokensSold + i + 1 // nth token being purchased
        const targetSaleTime = tokenIndex / r // f^-1(n) for linear schedule
        const timeDeviation = timePassed - targetSaleTime
        const priceMultiplier = (1 - decayConstant) ** timeDeviation
        const tokenPrice = targetPrice * priceMultiplier
        console.log(tokenIndex)
        totalCost += Math.max(tokenPrice, 0) // Ensure non-negative price
      }
      const requiredLamports = Math.ceil(totalCost * LAMPORTS_PER_SOL)
      console.log(publicKey.toBase58(), 'needs to send', requiredLamports, 'lamports ie', totalCost, 'SOL to WSOL ATA', buyerWsolAta.toBase58())

      preInstructions.push(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: buyerWsolAta,
          lamports: LAMPORTS_PER_SOL / 2,
        })
      )

      preInstructions.push(
        createSyncNativeInstruction(
          buyerWsolAta,
          TOKEN_PROGRAM_ID
        )
      )

      // Execute buy transaction
      const tx = await program.methods
        .buy(amountToBuy)
        .accountsStrict({
          buyer: publicKey,
          vrgda,
          mint,
          wsolMint,
          buyerWsolAta,
          buyerAta,
          vrgdaVault,
          vrgdaSolAta,
          authority,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .preInstructions(preInstructions)
        .rpc()

      const txUrl = await confirmTx(tx)

      return {
        success: true,
        signature: tx,
        txUrl,
        amount: params.amount,
        destination: buyerAta.toString()
      }
    } catch (error: any) {
      console.error('Error buying tokens:', error)
      throw new Error(error.message || String(error))
    } finally {
      setIsLoading(false)
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
    const { timePassed, tokensSold, targetPrice, decayConstant, r } = params
    const price = targetPrice * Math.exp(-decayConstant * (timePassed - tokensSold / r))
    return Math.max(price, params.reservePrice || 0)
  }

  const getVrgdaInfo = async (vrgdaAddress: string) => {
    const provider = getProvider()

    if (!provider) throw new Error('Provider not found')
    const program = new Program<Vrgda>(IDL, provider)

    try {
      const vrgda = new PublicKey(vrgdaAddress)
      const vrgdaAccount = await program.account.vrgda.fetch(vrgda);
      const mint = vrgdaAccount.mint;
      const currentTime = Math.floor(Date.now() / 1000)
      const startTime = Number(vrgdaAccount.vrgdaStartTimestamp.toString())

      // Calculate time passed since start (in seconds)
      const timePassed = Math.max(0, currentTime - startTime)

      const totalSupply = Number(vrgdaAccount.totalSupply.toString()) / DECIMAL
      const tokensSold = Number(vrgdaAccount.tokensSold.toString()) / DECIMAL
      const remainingSupply = totalSupply - tokensSold

      const r = Number(vrgdaAccount.schedule.linearSchedule.r.toString()) / DECIMAL
      const targetPrice = Number(vrgdaAccount.targetPrice.toString()) / (LAMPORTS_PER_SOL * LAMPORTS_PER_SOL) // Convert from WAD format (18 decimals) to SOL
      const currentPrice = vrgdaAccount.currentPrice.toNumber() / (LAMPORTS_PER_SOL * LAMPORTS_PER_SOL) // Convert from WAD format (18 decimals) to SOL

      const decayConstant = Number(vrgdaAccount.decayConstantPercent.toString()) / 100
      return {
        vrgdaAddress: vrgda.toString(),
        mintAddress: mint.toString(),
        authority: vrgdaAccount.authority.toString(),
        totalSupply,
        tokensSold,
        remainingSupply,
        targetPrice,
        currentPrice,
        decayConstant,
        r,
        startTime,
        timePassed: timePassed,
        vrgdaStartTimestamp: Number(vrgdaAccount.vrgdaStartTimestamp.toString()),
        // 1 week from now
        auctionEndTime:
          Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        isAuctionActive: !vrgdaAccount.auctionEnded,
        reservePrice: 0,
        metadata: {
          name: 'VRGDA Token',
          symbol: 'VRGDA',
          uri: ''
        }
      }
      // const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      //   "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
      // )
      // const [metadataPDA] = PublicKey.findProgramAddressSync(
      //   [
      //     Buffer.from("metadata"),
      //     TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      //     mint.toBuffer(),
      //   ],
      //   TOKEN_METADATA_PROGRAM_ID
      // )

      // const metadataAccount = await program.provider.connection.getAccountInfo(metadataPDA)

      // return await processVrgdaTokenData(vrgdaAccount, metadataAccount, mint, vrgda, metadataPDA)
    } catch (error) {
      console.error('Error fetching VRGDA info:', error)
      throw error
    }
  }

  const processVrgdaTokenData = async (vrgdaAccount: any, metadataAccount: any, mint: PublicKey, vrgda: PublicKey, metadataPDA: PublicKey) => {
    let metadata = null
    if (metadataAccount && metadataAccount.data) {
      try {
        // @ts-ignore correct according to mpl-token-metadata docs
        const meta = deserializeMetadata(metadataAccount);
        metadata = {
          name: meta.name,
          symbol: meta.symbol,
          uri: meta.uri,
          metadataPDA: metadataPDA.toString(),
        }
      } catch (parseError) {
        console.warn('Failed to parse metadata:', parseError)
      }
    }

    const currentTime = Math.floor(Date.now() / 1000)
    const startTimeNumber = Number(vrgdaAccount.vrgdaStartTimestamp.toString())

    // Calculate time passed since start (in seconds)
    const timePassed = Math.max(0, currentTime - startTimeNumber)

    const totalSupplyNumber = Number(vrgdaAccount.totalSupply.toString())
    const tokensSoldNumber = Number(vrgdaAccount.tokensSold.toString())
    const remainingSupply = totalSupplyNumber - tokensSoldNumber

    // Convert target price from WAD format (18 decimals) to SOL
    const targetPriceNumber = Number(vrgdaAccount.targetPrice.toString()) / (LAMPORTS_PER_SOL * LAMPORTS_PER_SOL)

    // Calculate current price using VRGDA formula
    const decayConstantPercent = Number(vrgdaAccount.decayConstantPercent.toString())
    const r = Number(vrgdaAccount.r.toString())

    const currentPrice = calculatePrice({
      timePassed: timePassed / 3600, // Convert to hours for consistency with old calculation
      tokensSold: tokensSoldNumber,
      targetPrice: targetPriceNumber,
      decayConstant: decayConstantPercent / 100, // Convert from percentage
      r: r,
      reservePrice: 0 // VRGDA doesn't have reserve price concept
    })

    return {
      vrgdaAddress: vrgda.toString(),
      mintAddress: mint.toString(),
      authority: vrgdaAccount.authority.toString(),
      totalSupply: totalSupplyNumber,
      tokensSold: tokensSoldNumber,
      remainingSupply,
      targetPrice: targetPriceNumber,
      currentPrice,
      decayConstantPercent: decayConstantPercent,
      r: r,
      startTime: startTimeNumber,
      vrgdaStartTimestamp: startTimeNumber,
      timePassed,
      metadata
    }
  }

  return {
    isLoading,
    initializeVRGDA,
    buyTokens,
    calculatePrice,
    getVrgdaInfo,
    // getVrgdaInfoByMint
  }
}

export type TokenData = Awaited<ReturnType<ReturnType<typeof useVRGDA>['getVrgdaInfo']>>

