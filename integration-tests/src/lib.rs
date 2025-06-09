pub mod helpers;


#[cfg(test)]
mod tests {
    use super::*;
    use litesvm::LiteSVM;
    use solana_sdk::pubkey::Pubkey;
    use solana_sdk::signature::Keypair;
    use anchor_spl::token_2022::spl_token_2022;
    use anchor_spl::associated_token::spl_associated_token_account::{self, create_associated_token_account};
    use solana_sdk::signer::Signer;
    use spl_token_2022::instruction::mint_to;
    use spl_token_2022::state::Account as TokenAccount;

    
    #[test]
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
    fn test_buy() {
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
            1000
        );

        let destination = spl_associated_token_account::get_associated_token_address_with_program_id(
            &buyer.pubkey(), 
            &mint.pubkey(),
            &spl_token_2022::ID,
        );
        // Check if the buy was successful
        assert!(svm.get_account(&destination).is_some(), "Destination account should have been created");
    }
}