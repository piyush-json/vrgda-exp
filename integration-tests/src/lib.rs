pub mod helpers;

#[cfg(test)]
mod tests {
    use std::fs::File;

    use super::*;
    use anchor_lang::AccountDeserialize;
    use litesvm::LiteSVM;
    use solana_sdk::{clock::Clock, signature::Keypair};
    use anchor_spl::token_2022::spl_token_2022;
    use anchor_spl::associated_token::spl_associated_token_account;
    use solana_sdk::signer::Signer;
    use pprof::ProfilerGuard;
    use vrgda_exp::state::{vrgda_price_for_amount_for_tests, VRGDA};

    
    fn dump_flamegraph(test_name: &str, guard: ProfilerGuard) {
        if let Ok(report) = guard.report().build() {
            let path = format!("{}-flamegraph.svg", test_name);
            let file = File::create(&path).expect("Could not create flamegraph file");
            report.flamegraph(file).expect("Failed to write flamegraph");
            eprintln!("🔥 Wrote {}", path);
        } else {
            eprintln!("⚠️  pprof guard failed to build report for {}", test_name);
        }
    }

    #[test]
    #[ignore] // This test is ignored by default to avoid running it on every test run
    fn test_init() {
        let mut svm = LiteSVM::new();

        svm.add_program_from_file(
            vrgda_exp::ID,
            "../target/deploy/vrgda_exp.so"
        ).expect("Failed to load VRGDA program");


        let payer = Keypair::new();
        let mint = Keypair::new();
        let wsol_mint = Keypair::new();
        let authority = Keypair::new();
        let destination = Keypair::new();

        let vrgda_pda = helpers::get_vrgda_address(vrgda_exp::ID, &mint.pubkey(), &authority.pubkey());

         let vrgda_mint_ata = spl_associated_token_account::get_associated_token_address_with_program_id(
            &vrgda_pda, 
            &mint.pubkey(),
            &spl_token_2022::ID,
        );

        let vrgda_sol_ata = spl_associated_token_account::get_associated_token_address_with_program_id(
            &authority.pubkey(), 
            &wsol_mint.pubkey(),
            &spl_token_2022::ID,
        );

        print!("Initializing SVM with payer: {:?}, mint: {:?}, wsol_mint: {:?}, authority: {:?}, destination: {:?}\n",
               payer.pubkey(), mint.pubkey(), wsol_mint.pubkey(), authority.pubkey(), destination.pubkey());

        println!("program ID: {:?}", vrgda_exp::ID);
        let target_price_wad = 4_000_000_000u128;
        // Initialize the SVM
        helpers::initialize_vrgda_testing_accounts(&mut svm, &vrgda_pda, &vrgda_sol_ata, &vrgda_mint_ata, &payer, &mint, &wsol_mint, &authority, target_price_wad, 50, 0, 1_000_000_000, 1_000_000);

        
        assert!(svm.get_account(&vrgda_pda).is_some(), "VRGDA account should be initialized");
    }

    #[test]
    // #[ignore] // This test is ignored by default to avoid running it on every test run
    fn test_buy() {
        // let guard = ProfilerGuard::new(100).expect("Failed to create profiler guard");
        let mut svm = LiteSVM::new();

        svm.add_program_from_file(
            vrgda_exp::ID,
            "../target/deploy/vrgda_exp.so"
        ).expect("Failed to load VRGDA program");

        let payer = Keypair::new();
        let mint = Keypair::new();
        let buyer = Keypair::new();
        let wsol_mint = Keypair::new();
        let authority = Keypair::new();

        let vrgda_pda = helpers::get_vrgda_address(vrgda_exp::ID, &mint.pubkey(), &authority.pubkey());


        let vrgda_mint_ata = spl_associated_token_account::get_associated_token_address_with_program_id(
            &vrgda_pda, 
            &mint.pubkey(),
            &spl_token_2022::ID,
        );

        let vrgda_sol_ata = spl_associated_token_account::get_associated_token_address_with_program_id(
            &authority.pubkey(), 
            &wsol_mint.pubkey(),
            &spl_token_2022::ID,
        );
        println!("program ID: {:?}", vrgda_exp::ID);
        
        // Initialize the SVM
        helpers::initialize_vrgda_testing_accounts(&mut svm, &vrgda_pda, &vrgda_sol_ata, &vrgda_mint_ata, &payer, &mint, &wsol_mint, &authority, 4_000_000_000u128, 50, 0, 1_000_000_000, 1_000_000);

        // Perform a buy operation
        helpers::buy_tokens(
            &mut svm, 
            &payer,
            &buyer,
            &authority,
            &vrgda_pda,
            &vrgda_sol_ata,
            &vrgda_mint_ata,
            &mint,
            &wsol_mint,
            1000000
        );

        // Dump the flamegraph for the test
        // dump_flamegraph("test_buy", guard);
        let destination = spl_associated_token_account::get_associated_token_address_with_program_id(
            &buyer.pubkey(), 
            &mint.pubkey(),
            &spl_token_2022::ID,
        );
        let acc = svm.get_account(&vrgda_pda);
        let vrgda_state: VRGDA = AccountDeserialize::try_deserialize(&mut acc.unwrap().data.as_ref())
            .expect("Failed to deserialize VRGDA state");

        println!("VRGDA state after buy: {:?}", vrgda_state);
        // Check if the buy was successful
        assert!(svm.get_account(&destination).is_some(), "Destination account should have been created");
    }

    #[test]
    #[ignore] // This test is ignored by default to avoid running it on every test run
    fn test_pricing_fn() {
        let guard = ProfilerGuard::new(10).expect("Failed to create profiler guard");
        let svm = LiteSVM::new();
        let target_price = 4u64;
        let sold = 0;
        let rate = 1_000_000u64;
        let now  = svm.get_sysvar::<Clock>()
            .unix_timestamp;
        let start_ts = now;

        let amount = 1_000_000_000u64;

        for _ in 0..100{
            let price = vrgda_price_for_amount_for_tests(
                now, 
                sold, 
                amount,
                start_ts,
                rate,
                5,
                target_price
            );
            println!("Price for amount {}: {:?}", amount, price);
        }
        dump_flamegraph("test_pricing_fn", guard);
    }
}