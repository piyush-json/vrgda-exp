import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Vrgda } from '../target/types/vrgda';

import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  Connection,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAccount,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";


describe("vrgda", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const connection = provider.connection;
  const program = anchor.workspace.Vrgda as Program<Vrgda>;

  const confirmTx = async (txSig: string) => {
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: txSig,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
    console.log(`Tx confirmed: https://explorer.solana.com/tx/${txSig}?cluster=localnet&customUrl=${connection.rpcEndpoint}`);
    return txSig;
  };

  // We'll create local Keypairs. We must ensure each gets airdropped enough SOL.
  const authority = Keypair.generate();
  const buyer = Keypair.generate();
  const buyer2 = Keypair.generate();
  const buyer3 = Keypair.generate();

  // This mint is the "token being sold."
  const mintKeypair = Keypair.generate();

  const localWsolMintKeypair = Keypair.generate();

  // Derive the VRGDA PDA
  const [vrgdaPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("vrgda"),
      mintKeypair.publicKey.toBuffer(),
      authority.publicKey.toBuffer(),
    ],
    program.programId
  );

  // We'll store addresses for the VRGDA vault, VRGDA wSOL vault, etc.
  let vrgdaVault: PublicKey;
  let vrgdaSolAta: PublicKey;
  let buyerAta: PublicKey;
  let buyer2Ata: PublicKey;
  let buyer3Ata: PublicKey;
  let buyerwSolAta: PublicKey;
  let buyer2wSolAta: PublicKey;
  let buyer3wSolAta: PublicKey;
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  before("Airdrop, create mint, and compute associated addresses", async () => {
    // 1) Airdrop 20 SOL to each local Keypair so they can pay for creation.
    await confirmTx(await connection.requestAirdrop(authority.publicKey, 20 * LAMPORTS_PER_SOL));
    await confirmTx(await connection.requestAirdrop(buyer.publicKey, 20 * LAMPORTS_PER_SOL));
    await confirmTx(await connection.requestAirdrop(buyer2.publicKey, 20 * LAMPORTS_PER_SOL));

    console.log("Authority:", authority.publicKey.toString());
    console.log("VRGDA PDA:", vrgdaPda.toString());
    // 2) Create the "mint being sold."
    const lamportsForMint = await getMinimumBalanceForRentExemptMint(connection);
    let createMintTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: authority.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: lamportsForMint,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mintKeypair.publicKey,
        6, // decimals
        authority.publicKey, // mint authority
        null,               // freeze authority
        TOKEN_PROGRAM_ID
      )
    );

    await provider.sendAndConfirm(createMintTx, [mintKeypair, authority]);

    const lamportsforsolmint = await getMinimumBalanceForRentExemptMint(connection);

    let createWSOLMINTtx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: authority.publicKey,
        newAccountPubkey: localWsolMintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: lamportsforsolmint,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        localWsolMintKeypair.publicKey,
        9, // decimals
        authority.publicKey, // mint authority
        null,               // freeze authority
        TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(createWSOLMINTtx, [localWsolMintKeypair, authority]);

    // 3) We'll derive the VRGDA vault for the minted token being sold.
    vrgdaVault = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      vrgdaPda,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // 4) We'll derive the VRGDA's wSOL vault
    vrgdaSolAta = await getAssociatedTokenAddress(
      localWsolMintKeypair.publicKey,
      authority.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create the VRGDA's wSOL ATA
    const createVrgdaSolAtaTx = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        authority.publicKey,
        vrgdaSolAta,
        authority.publicKey,
        localWsolMintKeypair.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(createVrgdaSolAtaTx, [authority]);

    // 5) We'll also pre-derive the buyer's associated addresses:
    buyerAta = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      buyer.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    buyer2Ata = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      buyer2.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    buyer3Ata = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      buyer3.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    buyerwSolAta = await getAssociatedTokenAddress(
      localWsolMintKeypair.publicKey,
      buyer.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    buyer2wSolAta = await getAssociatedTokenAddress(
      localWsolMintKeypair.publicKey,
      buyer2.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    buyer3wSolAta = await getAssociatedTokenAddress(
      localWsolMintKeypair.publicKey,
      buyer3.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create the buyer's wSOL ATA
    const createBuyerwSolAtaTx = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        authority.publicKey,
        buyerwSolAta,
        buyer.publicKey,
        localWsolMintKeypair.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(createBuyerwSolAtaTx, [authority]);

    // Create the buyer2's wSOL ATA
    const createBuyer2wSolAtaTx = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        authority.publicKey,
        buyer2wSolAta,
        buyer2.publicKey,
        localWsolMintKeypair.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(createBuyer2wSolAtaTx, [authority]);

    // Create the buyer3's wSOL ATA
    const createBuyer3wSolAtaTx = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        authority.publicKey,
        buyer3wSolAta,
        buyer3.publicKey,
        localWsolMintKeypair.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(createBuyer3wSolAtaTx, [authority]);

    // Mint wSOL to VRGDA's ATA
    const WsolminttoTx = new Transaction().add(
      createMintToInstruction(
        localWsolMintKeypair.publicKey,
        vrgdaSolAta,
        authority.publicKey,
        1_000_000_000,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(WsolminttoTx, [authority]);

    // Mint wSOL to buyer's ATA
    const mintToBuyerTx = new Transaction().add(
      createMintToInstruction(
        localWsolMintKeypair.publicKey,
        buyerwSolAta,
        authority.publicKey,
        1_000_000_000_000,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(mintToBuyerTx, [authority]);

    // Mint wSOL to buyer2's ATA
    const mintToBuyer2Tx = new Transaction().add(
      createMintToInstruction(
        localWsolMintKeypair.publicKey,
        buyer2wSolAta,
        authority.publicKey,
        1_000_000_000_000,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(mintToBuyer2Tx, [authority]);

    // Mint wSOL to buyer3's ATA
    const mintToBuyer3Tx = new Transaction().add(
      createMintToInstruction(
        localWsolMintKeypair.publicKey,
        buyer3wSolAta,
        authority.publicKey,
        1_000_000_000_000,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(mintToBuyer3Tx, [authority]);
  });

  it("Initialize VRGDA", async () => {
    const totalSupply = new BN(1_000_000_000_000_000);
    const ONE_WAD = new BN("1000000000000000000");     // 1e18
    // const targetPrice = new BN(40);
    // const lamportsPerSol = new BN(LAMPORTS_PER_SOL);
    // const targetPriceWad = targetPrice.mul(ONE_WAD).div(lamportsPerSol);
    const decayConstantPercent = new BN(5);

    const humanPriceSol = 4;

    // 2) Convert SOL → lamports (9 decimals)
    //    0.004 * 10^9 = 4_000_000
    const lamports = Math.floor(humanPriceSol * LAMPORTS_PER_SOL);
    console.log("lamports:", lamports);

    const targetPriceWad = new BN(lamports).mul(new BN(LAMPORTS_PER_SOL));
    console.log("targetPriceWad:", targetPriceWad.toString());

    console.log("Decay constant percent:", decayConstantPercent.toString());
    // Multiply by 1e18 first, then divide by 100 to preserve the fraction.
    const decayVal = decayConstantPercent.mul(ONE_WAD).div(new BN(100));
    const r = new BN(1_000_000);
    const vrgdaStartTimestamp = new BN(0);

    console.log("Initializing VRGDA with r:", r.toString());
    console.log("- Authority:", authority.publicKey.toString());
    console.log("- VRGDA PDA:", vrgdaPda.toString());

    const [metadata] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    // The instruction will create the VRGDA's vault for the minted token, 
    // and also the wsol ATA with authority = authority (on the program side).
    const txi = await program.methods
      .initializeVrgda(targetPriceWad, decayConstantPercent, vrgdaStartTimestamp, totalSupply, r, '1', '1', '1')
      .accountsStrict({
        authority: authority.publicKey,
        vrgda: vrgdaPda,
        vrgdaVault,
        mint: mintKeypair.publicKey,
        vrgdaSolAta,
        metadata,
        wsolMint: localWsolMintKeypair.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .remainingAccounts([
        {
          pubkey: authority.publicKey, // authority for minting
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: mintKeypair.publicKey, // mint for the VRGDA
          isSigner: true,
          isWritable: true,
        }
      ])
      .instruction();
    try {
      const txSig = await provider.sendAndConfirm(new Transaction().add(txi), [authority, mintKeypair]);
      await confirmTx(txSig);
    } catch (error) {
      console.error("Error initializing VRGDA:", error);
      throw error;
    }

    const mintToBuyer1Tx = new Transaction().add(
      createMintToInstruction(
        localWsolMintKeypair.publicKey,
        buyerwSolAta,
        authority.publicKey, // mint authority from createInitializeMint2Instruction
        1_000_000_000_000_000_000_000,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(mintToBuyer1Tx, [authority]);

    const mintToBuyer2Tx = new Transaction().add(
      createMintToInstruction(
        localWsolMintKeypair.publicKey,
        buyer2wSolAta,
        authority.publicKey, // mint authority from createInitializeMint2Instruction
        1_000_000_000_000_000_000_000,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(mintToBuyer2Tx, [authority]);

    const mintToBuyer3Tx = new Transaction().add(
      createMintToInstruction(
        localWsolMintKeypair.publicKey,
        buyer3wSolAta,
        authority.publicKey, // mint authority from createInitializeMint2Instruction
        1_000_000_000_000_000_000_000,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    await provider.sendAndConfirm(mintToBuyer3Tx, [authority]);

    //Mint WSOL to VRGDA's wsol ATA
    const WsolMintTx = new Transaction().add(
      createMintToInstruction(
        localWsolMintKeypair.publicKey,
        vrgdaSolAta,
        authority.publicKey,
        1_000_000_000_000_000_000_000,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(WsolMintTx, [authority]);

    const vrgdaAccount = await program.account.vrgda.fetch(vrgdaPda);
    console.log("Deserialized VRGDA account:", vrgdaAccount);

    const vaultAcc = await getAccount(connection, vrgdaVault, undefined, TOKEN_PROGRAM_ID);
    console.log("VRGDA Vault:", vaultAcc.address.toString());
    console.log("VRGDA Vault Token Balance:", vaultAcc.amount.toString());
  });

  it("Buy tokens from VRGDA", async () => {
    try {
      const amountToBuy = new BN(10_000_000_000_000);
      const amountToBuy2 = new BN(20_000_000_000_000);
      const amountToBuy3 = new BN(1_000_000_000_000);
      console.log("Buying tokens from VRGDA...", amountToBuy.toString());

      // Add a Compute Budget instruction to request extra compute units.
      const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 2_000_000,
      });

      try {
        // Airdrop SOL to buyers
        await confirmTx(await connection.requestAirdrop(buyer.publicKey, 100 * LAMPORTS_PER_SOL));
        await confirmTx(await connection.requestAirdrop(buyer2.publicKey, 100 * LAMPORTS_PER_SOL));
        await confirmTx(await connection.requestAirdrop(buyer3.publicKey, 100 * LAMPORTS_PER_SOL));
      } catch (airdropError) {
        console.error("Airdrop failed:", airdropError);
        throw airdropError;
      }
      // await sleep(80000);

      let txSig, vrgdaAccount, readablePrice;
      try {
        // First buy transaction
        txSig = await program.methods
          .buy(amountToBuy)
          .accountsStrict({
            buyer: buyer.publicKey,
            vrgda: vrgdaPda,
            mint: mintKeypair.publicKey,
            wsolMint: localWsolMintKeypair.publicKey,
            buyerWsolAta: buyerwSolAta,
            buyerAta,
            vrgdaVault,
            vrgdaSolAta,
            authority: authority.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([buyer])
          .preInstructions([computeBudgetIx])
          .rpc();
        await confirmTx(txSig);

        vrgdaAccount = await program.account.vrgda.fetch(vrgdaPda);
        readablePrice = formatLamportsToSol(vrgdaAccount.currentPrice);
        console.log("Price after first buy:", readablePrice);
      } catch (firstBuyError) {
        console.error("First buy transaction failed:", firstBuyError);
        throw firstBuyError;
      }

      // Wait some time
      // console.log("Waiting 5 seconds to simulate time passing...");
      await sleep(1000);

      let txSig2, vrgdaAccount_t, readablePrice2;
      try {
        // Second buy transaction
        txSig2 = await program.methods
          .buy(amountToBuy2)
          .accountsStrict({
            buyer: buyer2.publicKey,
            vrgda: vrgdaPda,
            mint: mintKeypair.publicKey,
            wsolMint: localWsolMintKeypair.publicKey,
            buyerWsolAta: buyer2wSolAta,
            buyerAta: buyer2Ata,
            vrgdaVault,
            vrgdaSolAta,
            authority: authority.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([buyer2])
          .preInstructions([computeBudgetIx])
          .rpc();
        await confirmTx(txSig2);

        vrgdaAccount_t = await program.account.vrgda.fetch(vrgdaPda);
        readablePrice2 = formatLamportsToSol(vrgdaAccount_t.currentPrice);
        console.log("Price after second buy:", readablePrice2);
      } catch (secondBuyError) {
        console.error("Second buy transaction failed:", secondBuyError);
        throw secondBuyError;
      }

      await sleep(10000);

      let txSig3, vrgdaAccount_3, readablePrice3;
      try {
        // Third buy transaction
        txSig3 = await program.methods
          .buy(amountToBuy3)
          .accountsStrict({
            buyer: buyer3.publicKey,
            vrgda: vrgdaPda,
            mint: mintKeypair.publicKey,
            wsolMint: localWsolMintKeypair.publicKey,
            buyerWsolAta: buyer3wSolAta,
            buyerAta: buyer3Ata,
            vrgdaVault,
            vrgdaSolAta,
            authority: authority.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([buyer3])
          .preInstructions([computeBudgetIx])
          .rpc();
        await confirmTx(txSig3);
        console.log("Buyer3 tx confirmed:", txSig3);

        vrgdaAccount_3 = await program.account.vrgda.fetch(vrgdaPda);
        readablePrice3 = formatLamportsToSol(vrgdaAccount_3.currentPrice);
        console.log("Price after third buy:", readablePrice3);
      } catch (thirdBuyError) {
        console.error("Third buy transaction failed:", thirdBuyError);
        throw thirdBuyError;
      }

      // Final state checks
      try {
        const vrgdaState = await program.account.vrgda.fetch(vrgdaPda);
        console.log("VRGDA state after second buy:", vrgdaState.totalSupply.toString());

        const buyerAtaAcc = await getAccount(connection, buyerAta, undefined, TOKEN_PROGRAM_ID);
        console.log("Buyer token balance after buy:", buyerAtaAcc.amount.toString());

        const buyer2AtaAcc = await getAccount(connection, buyer2Ata, undefined, TOKEN_PROGRAM_ID);
        console.log("Buyer2 token balance after buy:", buyer2AtaAcc.amount.toString());
      } catch (stateCheckError) {
        console.error("Error checking final state:", stateCheckError);
        throw stateCheckError;
      }
    } catch (overallError) {
      console.error("Overall test failed:", overallError);
      // Optionally re-throw to ensure test fails
      throw overallError;
    }
  });

  //   it("should successfully sell tokens back to VRGDA", async () => {
  //     // First, buy some tokens to establish a baseline
  //     const buyAmount = new BN(500_000_000_000);
  //     const sellAmount = new BN(250_000_000_000);
  //     const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
  //         units: 600_000,
  //     });

  //     try {
  //         // Sell tokens back
  //         const sellTx = await program.methods
  //             .sell(buyAmount)
  //             .accounts({
  //                 seller: buyer.publicKey,
  //                 vrgda: vrgdaPda,
  //                 mint: mintKeypair.publicKey,
  //                 wsolMint: localWsolMintKeypair.publicKey,
  //                 sellerWsolAta: buyerwSolAta,
  //                 sellerAta: buyerAta,
  //                 vrgdaVault,
  //                 vrgdaSolAta,
  //                 authority: authority.publicKey,
  //                 tokenProgram: TOKEN_PROGRAM_ID,
  //                 associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //                 systemProgram: SystemProgram.programId,
  //                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //             })
  //             .signers([buyer])
  //             .preInstructions([computeBudgetIx])
  //             .rpc();
  //         await confirmTx(sellTx);

  //         // Verify VRGDA state after sell
  //         const vrgdaAccount = await program.account.vrgda.fetch(vrgdaPda);
  //         console.log("VRGDA state after sell:", {
  //             tokensSold: vrgdaAccount.tokensSold.toString(),
  //             totalSupply: vrgdaAccount.totalSupply.toString(),
  //             currentPrice: vrgdaAccount.currentPrice.toString()
  //         });

  //         // Check seller's token balances
  //         const sellerMintAcc = await getAccount(connection, buyer.publicKey, undefined, TOKEN_PROGRAM_ID);
  //         const sellerWsolAcc = await getAccount(connection, buyerwSolAta, undefined, TOKEN_PROGRAM_ID);

  //         console.log("Seller Mint Balance:", sellerMintAcc.amount.toString());
  //         console.log("Seller WSOL Balance:", sellerWsolAcc.amount.toString());
  //     } catch (error) {
  //         console.error("Sell test failed:", error);
  //         throw error;
  //     }
  // });

  // it("should fail to sell 0 tokens", async () => {
  //     try {
  //         const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
  //             units: 600_000,
  //         });

  //         const sellTx = await program.methods
  //             .sell(new BN(0))
  //             .accounts({
  //                 seller: buyer.publicKey,
  //                 vrgda: vrgdaPda,
  //                 mint: mintKeypair.publicKey,
  //                 wsolMint: localWsolMintKeypair.publicKey,
  //                 sellerWsolAta: buyerwSolAta,
  //                 sellerAta: buyerAta,
  //                 vrgdaVault,
  //                 vrgdaSolAta,
  //                 authority: authority.publicKey,
  //                 tokenProgram: TOKEN_PROGRAM_ID,
  //                 associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //                 systemProgram: SystemProgram.programId,
  //                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //             })
  //             .signers([buyer])
  //             .preInstructions([computeBudgetIx])
  //             .rpc();

  //         await confirmTx(sellTx);
  //         throw new Error("Should have failed to sell 0 tokens");
  //     } catch (error) {
  //         // Check if error is the expected AmountCantBeZero error
  //         if (error instanceof anchor.AnchorError) {

  //         } else {
  //             throw error;
  //         }
  //     }
  // });

  // it("should fail to sell more tokens than purchased", async () => {
  //     try {
  //         // First, buy some tokens
  //         const buyAmount = new BN(500_000_000_000);
  //         const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
  //             units: 600_000,
  //         });

  //         const buyTx = await program.methods
  //             .buy(buyAmount)
  //             .accounts({
  //                 buyer: buyer.publicKey,
  //                 vrgda: vrgdaPda,
  //                 mint: mintKeypair.publicKey,
  //                 wsolMint: localWsolMintKeypair.publicKey,
  //                 buyerWsolAta: buyerwSolAta,
  //                 buyerAta: buyerAta,
  //                 vrgdaVault,
  //                 vrgdaSolAta,
  //                 authority: authority.publicKey,
  //                 tokenProgram: TOKEN_PROGRAM_ID,
  //                 associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //                 systemProgram: SystemProgram.programId,
  //                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //             })
  //             .signers([buyer])
  //             .preInstructions([computeBudgetIx])
  //             .rpc();
  //         await confirmTx(buyTx);

  //         // Try to sell more tokens than purchased
  //         const impossibleSellAmount = buyAmount.add(new BN(1));
  //         const sellTx = await program.methods
  //             .sell(impossibleSellAmount)
  //             .accounts({
  //                 seller: buyer.publicKey,
  //                 vrgda: vrgdaPda,
  //                 mint: mintKeypair.publicKey,
  //                 wsolMint: localWsolMintKeypair.publicKey,
  //                 sellerWsolAta: buyerwSolAta,
  //                 sellerAta: buyerAta,
  //                 vrgdaVault,
  //                 vrgdaSolAta,
  //                 authority: authority.publicKey,
  //                 tokenProgram: TOKEN_PROGRAM_ID,
  //                 associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //                 systemProgram: SystemProgram.programId,
  //                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //             })
  //             .signers([buyer])
  //             .preInstructions([computeBudgetIx])
  //             .rpc();

  //         await confirmTx(sellTx);
  //         throw new Error("Should have failed to sell more tokens than purchased");
  //     } catch (error) {
  //         // Check if error is the expected AmountExceedsTotalSupply error
  //         if (error instanceof anchor.AnchorError) {

  //         } else {
  //             throw error;
  //         }
  //     }
  // });

});

// Just a utility
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Define the scaling factor: for SOL, 1 SOL = 1e9 lamports.

/**
 * Converts a BN price in lamports to a human-readable SOL string.
 * For example, if the price is 1234567890 lamports, it will return "1.234567890".
 */
function formatLamportsToSol(priceLamports: BN): string {
  const solInteger = priceLamports.div(new BN(LAMPORTS_PER_SOL));
  const solRemainder = priceLamports.mod(new BN(LAMPORTS_PER_SOL));
  // Pad the remainder with zeros to ensure 9 decimal places.
  return `${solInteger.toString()}.${solRemainder.toString().padStart(9, "0")}`;
}

function percent(percent: number): BN {
  return new BN(Math.floor((percent / 100) * 18446744073709551615)); // uint64 max value
}

async function waitForUnixTime(connection: Connection, unixTime: bigint, sleepInterval: number = 500) {
  while (await getClockTime(connection) < unixTime) {
    await sleep(sleepInterval);
  }
}

async function getClockTime(connection: Connection): Promise<bigint> {
  const clock = (await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY))!;
  return clock.data.readBigInt64LE(8 * 4);
}
/*
 {
      "name": "U192",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "",
            "type": "u64"
          },
          {
            "name": "",
            "type": "u64"
          },
          {
            "name": "",
            "type": "u64"
          }
        ]
      }
    }, 
 */
