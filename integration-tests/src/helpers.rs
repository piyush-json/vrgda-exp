use {
    anchor_lang::{AccountDeserialize, InstructionData, Space, ToAccountMetas}, anchor_spl::{
        associated_token::spl_associated_token_account, token::spl_token, token_2022::spl_token_2022
    }, litesvm::types::TransactionResult, solana_sdk::{
        instruction::Instruction, program_pack::Pack, pubkey::Pubkey, signature::Keypair, signer::Signer, system_instruction, transaction::Transaction
    }, spl_token_2022::{
        instruction::initialize_account,
        state::Account,
    }, std::convert::TryInto, vrgda_exp::state::VRGDA,
};

pub fn create_account(
    svm: &mut litesvm::LiteSVM,
    payer: &Keypair,
    size: usize,
    owner: Pubkey,
) -> Pubkey {
    let account = Keypair::new();
    let lamports = svm.minimum_balance_for_rent_exemption(size);
    let instruction = system_instruction::create_account(
        &payer.pubkey(),
        &account.pubkey(),
        lamports,
        size as u64,
        &owner,
    );

    let transaction = Transaction::new_signed_with_payer(
        &[instruction],
        Some(&payer.pubkey()),
        &[payer, &account],
        svm.latest_blockhash(),
    );
    svm.send_transaction(transaction).unwrap();

    account.pubkey()
}

pub fn create_token_account(
    svm: &mut litesvm::LiteSVM,
    payer: &Keypair,
    token_mint: &Pubkey,
) -> Keypair {
    let keypair = Keypair::new();
    let rent_exemption = svm.minimum_balance_for_rent_exemption(Account::LEN);

    let create_account_ix = solana_sdk::system_instruction::create_account(
        &payer.pubkey(),
        &keypair.pubkey(),
        rent_exemption,
        Account::LEN as u64,
        &spl_token_2022::ID,
    );

    let initialize_account_ix = initialize_account(
        &spl_token_2022::ID,
        &keypair.pubkey(),
        token_mint,
        &payer.pubkey(),
    )
    .unwrap();

    let transaction = Transaction::new_signed_with_payer(
        &[create_account_ix, initialize_account_ix],
        Some(&payer.pubkey()),
        &[payer, &keypair],
        svm.latest_blockhash(),
    );

    svm.send_transaction(transaction).unwrap();

    keypair
}

pub fn init_mint_account(svm: &mut litesvm::LiteSVM, payer: &Keypair, token_mint: &Keypair) {
    let mint_rent = svm.minimum_balance_for_rent_exemption(spl_token_2022::state::Mint::LEN);
    let mint_tx = Transaction::new_signed_with_payer(
        &[
            system_instruction::create_account(
                &payer.pubkey(),
                &token_mint.pubkey(),
                mint_rent,
                spl_token_2022::state::Mint::LEN.try_into().unwrap(),
                &spl_token_2022::id(),
            ),
            spl_token_2022::instruction::initialize_mint(
                &spl_token_2022::id(),
                &token_mint.pubkey(),
                &token_mint.pubkey(),
                None,
                6,
            )
            .unwrap(),
        ],
        Some(&payer.pubkey()),
        &[&payer, &token_mint],
        svm.latest_blockhash(),
    );
    svm.send_transaction(mint_tx).unwrap();
}

pub fn airdrop_spl(
    svm: &mut litesvm::LiteSVM,
    payer: &Keypair,
    destination: Pubkey,
    mint: &Keypair,
    amount: u64,
) {
    let mint_to_ix = spl_token::instruction::mint_to(
        &spl_token_2022::id(),
        &mint.pubkey(),
        &destination,
        &mint.pubkey(),
        &[&payer.pubkey(), &mint.pubkey()],
        amount,
    )
    .unwrap();
    let mint_to_tx = Transaction::new_signed_with_payer(
        &[mint_to_ix],
        Some(&payer.pubkey()),
        &[&payer, &mint],
        svm.latest_blockhash(),
    );
    svm.send_transaction(mint_to_tx).unwrap();
}

pub fn initialize_ata(
    svm: &mut litesvm::LiteSVM,
    payer: &Keypair,
    mint: Pubkey,
    authority: Pubkey,
) -> TransactionResult {
    let create_ata_ix = spl_associated_token_account::instruction::create_associated_token_account(
        &payer.pubkey(),
        &authority,
        &mint,
        &spl_token_2022::ID,
    );

    let create_ata_tx = Transaction::new_signed_with_payer(
        &[create_ata_ix],
        Some(&payer.pubkey()),
        &[payer],
        svm.latest_blockhash(),
    );

    svm.send_transaction(create_ata_tx)
}


pub fn get_vrgda_address(
    program_id: Pubkey,
    mint: &Pubkey,
    authority: &Pubkey,
) -> Pubkey {
    let seeds = [
        b"vrgda",
        mint.as_ref(),
        authority.as_ref(),
    ];
    let (address, _bump) = Pubkey::find_program_address(&seeds, &program_id);
    address
}


pub fn initialize_vrgda_testing_accounts(
    svm: &mut litesvm::LiteSVM,
    payer: &Keypair,
    mint: &Keypair,
    wsol_mint: &Keypair,
    authority: &Keypair,
    target_price: u128,
    decay_constant_percent: u64,
    vrgda_start_timestamp: i64,
    total_supply: u64,
    r: u64,
) {
    let vrgda_address = get_vrgda_address(vrgda_exp::ID, &mint.pubkey(), &authority.pubkey());
    let rent_exemption = svm.minimum_balance_for_rent_exemption(vrgda_exp::state::VRGDA::INIT_SPACE);

    svm.airdrop(&payer.pubkey(), 100_000_000_000).unwrap();
    svm.airdrop(&authority.pubkey(), 100_000_000_000).unwrap();
    let create_account_ix = system_instruction::create_account(
        &payer.pubkey(),
        &vrgda_address,
        rent_exemption,
        VRGDA::INIT_SPACE as u64,
        &vrgda_exp::ID,
    );

    svm.send_transaction(
        Transaction::new_signed_with_payer(
            &[create_account_ix],
            Some(&payer.pubkey()),
            &[payer, authority],
            svm.latest_blockhash(),
        )
    ).unwrap();

    // initialize mint account
    let _ = init_mint_account(
        svm, 
        payer, 
        mint
    );


    // initializing mint vaults
    let _ = initialize_ata(
        svm, 
        payer, 
        mint.pubkey(),
        authority.pubkey()
    );

    // initialize wsol mint account
    let _ = init_mint_account(
        svm, 
        payer, 
        wsol_mint
    );



    let vrgda_vault_address = spl_associated_token_account::get_associated_token_address_with_program_id(
        &authority.pubkey(), 
        &mint.pubkey(),
        &spl_token_2022::ID,
    );

    // initialize wsol vaults

    let _ = initialize_ata(
        svm, 
        payer, 
        wsol_mint.pubkey(),
        authority.pubkey()
    );

    let set_authority_ix = spl_token_2022::instruction::set_authority(
        &spl_token_2022::ID,
        &vrgda_vault_address,
        Some(&vrgda_address),
        spl_token_2022::instruction::AuthorityType::AccountOwner,
        &authority.pubkey(),
        &[&authority.pubkey()],
    ).unwrap();

    let vrgda_wsol_vault_address = spl_associated_token_account::get_associated_token_address_with_program_id(
        &authority.pubkey(), 
        &wsol_mint.pubkey(),
        &spl_token_2022::ID,
    );


    let ix_accounts = vrgda_exp::accounts::Initialize {
        authority: authority.pubkey(),
        vrgda: vrgda_address,
        vrgda_vault: vrgda_vault_address,
        mint: mint.pubkey(),
        wsol_mint: wsol_mint.pubkey(),
        vrgda_sol_ata: vrgda_wsol_vault_address,
        token_program: spl_token_2022::ID,
        associated_token_program: spl_associated_token_account::ID,
        system_program: solana_sdk::system_program::ID,
        rent: solana_sdk::sysvar::rent::ID,
    };

    let ix = vrgda_exp::instruction::InitializeVrgda {
        target_price,
        decay_constant_percent,
        vrgda_start_timestamp,
        total_supply,
        r,
    };

    let ix = Instruction{
        program_id: vrgda_exp::ID,
        accounts: ix_accounts.to_account_metas(None),
        data: ix.data(),
    };

    let transaction = Transaction::new_signed_with_payer(
        &[set_authority_ix, ix],
        Some(&authority.pubkey()),
        &[payer, authority ],
        svm.latest_blockhash(),
    );
    svm.send_transaction(transaction).unwrap();
   
}

pub fn fetch_account_data<T: AccountDeserialize>(
    svm: &mut litesvm::LiteSVM,
    account: &Pubkey,
) -> T {
    T::try_deserialize(&mut svm.get_account(account).unwrap().data.as_ref()).unwrap()
}