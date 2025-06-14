import {
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  Connection,
} from '@solana/web3.js'
import { BN, Program, AnchorProvider, web3 } from '@coral-xyz/anchor'
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  MINT_SIZE,
  createInitializeMint2Instruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getMint,
  getMinimumBalanceForRentExemptMint,
  createSyncNativeInstruction,
} from '@solana/spl-token'
import { deserializeMetadata } from '@metaplex-foundation/mpl-token-metadata'

import type { Vrgda } from 'idl/types/vrgda'
import vrgdaIdl from 'idl/idl/vrgda.json'
import { WSOL_MINT, DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT, AUCTION_DURATION_DAYS, TOKEN_METADATA_PROGRAM_ID } from './constants'
import type {
  VRGDAInitParams,
  VRGDABuyParams,
  VRGDAInfo,
  VRGDAInitResult,
  VRGDABuyResult,
  VRGDAPaginationOptions,
  VRGDAPaginatedResult
} from './types'
import {
  calculateVRGDAPriceForAmount,
  calculatePrice,
  findVRGDAPDA,
  generateTxUrl,
  validateVRGDAParams,
  TokenAmountUtils,
  validatePagination
} from './utils'

const IDL = vrgdaIdl

export class VRGDAClient {
  private program: Program<Vrgda>
  private provider: AnchorProvider
  private connection: Connection

  constructor(provider: AnchorProvider) {
    this.provider = provider
    this.connection = provider.connection
    this.program = new Program<Vrgda>(IDL, provider)
  }

  static create(provider: AnchorProvider): VRGDAClient {
    return new VRGDAClient(provider)
  }

  async confirmTransaction(txSig: string): Promise<string> {
    const latestBlockhash = await this.connection.getLatestBlockhash()
    await this.connection.confirmTransaction({
      signature: txSig,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    })
    const txUrl = generateTxUrl(txSig, this.connection.rpcEndpoint)
    console.log(`Tx confirmed: ${txUrl}`)
    return txUrl
  }

  async initializeVRGDA(params: VRGDAInitParams): Promise<VRGDAInitResult> {
    const authority = params.authority || this.provider.publicKey
    if (!authority) throw new Error('Authority not provided and wallet not connected')

    validateVRGDAParams(params)

    const mintPublic = params.mint.publicKey
    const transaction = new Transaction()

    // Handle mint creation or validation
    await this.handleMintSetup(transaction, mintPublic, authority)

    // Derive VRGDA PDA and validate
    const [vrgdaPda] = findVRGDAPDA(mintPublic, authority)
    await this.validateVRGDADoesNotExist(vrgdaPda)


    // get metadata public key
    const [metadata] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPublic.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
    // Setup token accounts
    const { vrgdaVault, vrgdaSolAta } = await this.setupTokenAccounts(
      transaction,
      mintPublic,
      vrgdaPda,
      authority,
      params.wsolMint
    )

    // Initialize VRGDA
    await this.addInitializeVRGDAInstruction(
      transaction,
      params,
      authority,
      vrgdaPda,
      vrgdaVault,
      vrgdaSolAta,
      mintPublic,
      metadata,
      TOKEN_METADATA_PROGRAM_ID
    )

    const tx = await this.provider.sendAndConfirm(transaction, [params.mint], { maxRetries: 3 })
    const txUrl = await this.confirmTransaction(tx)

    return {
      success: true,
      signature: tx,
      txUrl,
      vrgda: vrgdaPda.toString(),
      mint: mintPublic.toString(),
      authority: authority.toString()
    }
  }

  private async handleMintSetup(transaction: Transaction, mintPublic: PublicKey, authority: PublicKey): Promise<void> {
    const mintInfo = await this.connection.getAccountInfo(mintPublic)
    const mintExists = mintInfo !== null

    if (mintExists) {
      const mintAccount = await getMint(this.connection, mintPublic)
      if (!mintAccount.mintAuthority?.equals(authority)) {
        throw new Error('You do not have mint authority over this existing mint')
      }
      if (mintAccount.decimals !== 6) {
        console.warn(`Warning: Existing mint has ${mintAccount.decimals} decimals, expected 6`)
      }
    } else {
      const lamportsForMint = await getMinimumBalanceForRentExemptMint(this.connection)
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
  }

  private async validateVRGDADoesNotExist(vrgdaPda: PublicKey): Promise<void> {
    const vrgdaInfo = await this.connection.getAccountInfo(vrgdaPda)
    if (vrgdaInfo) {
      throw new Error('VRGDA already exists for this mint and authority')
    }
  }

  private async setupTokenAccounts(
    transaction: Transaction,
    mintPublic: PublicKey,
    vrgdaPda: PublicKey,
    authority: PublicKey,
    wsolMint?: PublicKey
  ): Promise<{ vrgdaVault: PublicKey; vrgdaSolAta: PublicKey }> {
    const wsolMintPubkey = wsolMint || WSOL_MINT

    const vrgdaVault = await getAssociatedTokenAddress(
      mintPublic,
      vrgdaPda,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const vrgdaSolAta = await getAssociatedTokenAddress(
      wsolMintPubkey,
      authority,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    // Create WSOL ATA if it doesn't exist
    const ataInfo = await this.connection.getAccountInfo(vrgdaSolAta)
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

    return { vrgdaVault, vrgdaSolAta }
  }

  private async addInitializeVRGDAInstruction(
    transaction: Transaction,
    params: VRGDAInitParams,
    authority: PublicKey,
    vrgdaPda: PublicKey,
    vrgdaVault: PublicKey,
    vrgdaSolAta: PublicKey,
    mintPublic: PublicKey,
    metadata: PublicKey,
    metadataProgram: PublicKey
  ): Promise<void> {
    const wsolMintPubkey = params.wsolMint || WSOL_MINT
    const targetPriceWad = TokenAmountUtils.toPriceWadBN(params.targetPrice)
    const vrgdaStartTimestamp = new BN(params.vrgdaStartTimestamp || 0)

    const initVrgdaIx = await this.program.methods
      .initializeVrgda(
        targetPriceWad,
        new BN(Math.floor(params.decayConstant * 100)),
        vrgdaStartTimestamp,
        new BN(TokenAmountUtils.toProgram(params.totalSupply)),
        new BN(params.r),
        params.name,
        params.symbol,
        params.uri
      )
      .accountsStrict({
        authority,
        vrgda: vrgdaPda,
        vrgdaVault,
        mint: mintPublic,
        vrgdaSolAta,
        metadataProgram,
        metadata,
        wsolMint: wsolMintPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([params.mint])
      .instruction()

    transaction.add(initVrgdaIx)
  }

  async buyTokens(params: VRGDABuyParams): Promise<VRGDABuyResult> {
    const buyer = this.provider.publicKey
    if (!buyer) throw new Error('Wallet not connected')
    if (params.amount <= 0) throw new Error('Amount must be greater than 0')

    const vrgda = typeof params.vrgdaAddress === 'string'
      ? new PublicKey(params.vrgdaAddress)
      : params.vrgdaAddress

    // Get VRGDA data and calculate cost
    const vrgdaAccount = await this.program.account.vrgda.fetch(vrgda)
    const { mint, authority } = vrgdaAccount
    const { totalCost, requiredLamports } = this.calculateBuyCost(vrgdaAccount, params.amount)
    // Setup token accounts
    const accounts = await this.setupBuyAccounts(buyer, mint, vrgda, authority)

    // Prepare transaction
    const preInstructions = await this.prepareBuyInstructions(buyer, accounts, requiredLamports)
    const amountToBuy = new BN(TokenAmountUtils.toProgram(params.amount))

    // Execute buy transaction
    const tx = await this.program.methods
      .buy(amountToBuy)
      .accountsStrict({
        buyer,
        vrgda,
        mint,
        wsolMint: WSOL_MINT,
        buyerWsolAta: accounts.buyerWsolAta,
        buyerAta: accounts.buyerAta,
        vrgdaVault: accounts.vrgdaVault,
        vrgdaSolAta: accounts.vrgdaSolAta,
        authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .preInstructions(preInstructions)
      .rpc()

    const txUrl = await this.confirmTransaction(tx)

    return {
      success: true,
      signature: tx,
      txUrl,
      amount: params.amount,
      destination: accounts.buyerAta.toString()
    }
  }

  private calculateBuyCost(vrgdaAccount: any, amount: number): { totalCost: number; requiredLamports: number } {
    const r = Number(vrgdaAccount.schedule.linearSchedule.r.toString())
    const targetPrice = TokenAmountUtils.fromPriceWad(Number(vrgdaAccount.targetPrice.toString()))
    const decayConstant = Number(vrgdaAccount.decayConstantPercent.toString()) / 100
    const tokensSold = TokenAmountUtils.fromProgram(Number(vrgdaAccount.tokensSold.toString()))
    const startTime = Number(vrgdaAccount.vrgdaStartTimestamp.toString())
    const currentTime = Math.floor(Date.now() / 1000)
    const timePassed = Math.max(0, currentTime - startTime)

    const scaledSold = Math.floor(tokensSold)
    const scaledAmount = Math.floor(amount)

    const totalCost = calculateVRGDAPriceForAmount(
      timePassed,
      scaledSold,
      scaledAmount,
      targetPrice,
      decayConstant,
      r
    )

    const requiredLamports = Math.ceil(totalCost * LAMPORTS_PER_SOL)
    return { totalCost, requiredLamports }
  }

  private async setupBuyAccounts(buyer: PublicKey, mint: PublicKey, vrgda: PublicKey, authority: PublicKey) {
    const [buyerAta, vrgdaVault, buyerWsolAta, vrgdaSolAta] = await Promise.all([
      getAssociatedTokenAddress(mint, buyer, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
      getAssociatedTokenAddress(mint, vrgda, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
      getAssociatedTokenAddress(WSOL_MINT, buyer, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
      getAssociatedTokenAddress(WSOL_MINT, authority, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
    ])

    return { buyerAta, vrgdaVault, buyerWsolAta, vrgdaSolAta }
  }

  private async prepareBuyInstructions(buyer: PublicKey, accounts: any, requiredLamports: number) {
    const buyerWsolAtaInfo = await this.connection.getAccountInfo(accounts.buyerWsolAta)
    const preInstructions = [
      web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 2000000 })
    ]

    if (!buyerWsolAtaInfo) {
      preInstructions.push(
        createAssociatedTokenAccountIdempotentInstruction(
          buyer,
          accounts.buyerWsolAta,
          buyer,
          WSOL_MINT,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )
    }

    // Add SOL to WSOL ATA and sync
    // preInstructions.push(
    //   SystemProgram.transfer({
    //     fromPubkey: buyer,
    //     toPubkey: accounts.buyerWsolAta,
    //     lamports: requiredLamports + LAMPORTS_PER_SOL / 2, // Add extra for fees
    //   }),
    //   createSyncNativeInstruction(accounts.buyerWsolAta, TOKEN_PROGRAM_ID)
    // )

    return preInstructions
  }

  async getVRGDAInfo(vrgdaAddress: string | PublicKey): Promise<VRGDAInfo> {
    const vrgda = typeof vrgdaAddress === 'string' ? new PublicKey(vrgdaAddress) : vrgdaAddress
    const vrgdaAccount = await this.program.account.vrgda.fetch(vrgda)

    return await this.transformVRGDAAccountToInfo(vrgda, vrgdaAccount)
  }

  private async transformVRGDAAccountToInfo(vrgda: PublicKey, vrgdaAccount:
    Awaited<ReturnType<typeof this.program.account.vrgda.fetch>>
  ): Promise<VRGDAInfo> {
    const mint = vrgdaAccount.mint
    const currentTime = Math.floor(Date.now() / 1000)
    const startTime = Number(vrgdaAccount.vrgdaStartTimestamp.toString())
    const timePassed = Math.max(0, currentTime - startTime)

    const tokenSoldProgram = Number(vrgdaAccount.tokensSold.toString())
    const tokensSold = TokenAmountUtils.fromProgram(tokenSoldProgram)
    const totalSupply = TokenAmountUtils.fromProgram(Number(vrgdaAccount.totalSupply.toString()) + tokenSoldProgram)
    const remainingSupply = totalSupply - tokensSold

    const r = Number(vrgdaAccount.schedule.linearSchedule.r.toString())
    const targetPrice = TokenAmountUtils.fromPriceWad(Number(vrgdaAccount.targetPrice.toString()))
    const currentPrice = TokenAmountUtils.fromPriceWad(vrgdaAccount.currentPrice.toNumber())
    const decayConstant = Number(vrgdaAccount.decayConstantPercent.toString()) / 100

    // Fetch and parse metadata
    const [metadataPDA] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
    console.log(mint.toBase58(), metadataPDA.toBase58())
    const metadataAccount = await this.connection.getAccountInfo(metadataPDA)
    let metadata = null
    if (metadataAccount && metadataAccount.data) {
      try {
        // @ts-ignore correct according to mpl-token-metadata docs
        const meta = deserializeMetadata(metadataAccount);
        metadata = {
          name: meta.name,
          symbol: meta.symbol,
          uri: meta.uri,
        }
      } catch (parseError) {
        console.warn('Failed to parse metadata:', parseError)
      }
    }

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
      timePassed,
      vrgdaStartTimestamp: startTime,
      auctionEndTime: startTime + (AUCTION_DURATION_DAYS * 24 * 60 * 60),
      isAuctionActive: !vrgdaAccount.auctionEnded,
      reservePrice: 0,
      metadata: metadata || {
        name: 'VRGDA Token',
        symbol: 'VRGDA',
        uri: ''
      }
    }
  }

  async getAllVRGDATokens(): Promise<VRGDAInfo[]> {
    try {
      const vrgdaAccounts = await this.program.account.vrgda.all()
      const tokens = await Promise.all(
        vrgdaAccounts.map(account =>
          this.transformVRGDAAccountToInfo(account.publicKey, account.account)
        )
      )

      // Sort by start time (newest first)
      return tokens.sort((a, b) => b.startTime - a.startTime)
    } catch (error) {
      console.error('Error fetching VRGDA tokens:', error)
      throw new Error(`Failed to fetch VRGDA tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getVRGDATokensPaginated(options: VRGDAPaginationOptions = {}): Promise<VRGDAPaginatedResult<VRGDAInfo>> {
    const { page = 1, limit = DEFAULT_PAGINATION_LIMIT } = options
    validatePagination(page, limit, MAX_PAGINATION_LIMIT)

    const allTokens = await this.getAllVRGDATokens()
    const totalItems = allTokens.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const items = allTokens.slice(startIndex, endIndex)

    return {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    }
  }

  // Utility methods
  calculatePrice = calculatePrice

  getProgramId(): PublicKey {
    return this.program.programId
  }

  getConnection(): Connection {
    return this.connection
  }

  getProvider(): AnchorProvider {
    return this.provider
  }
}
