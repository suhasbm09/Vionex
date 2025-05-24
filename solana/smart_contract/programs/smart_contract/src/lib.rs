use anchor_lang::prelude::*;
use anchor_lang::system_program::System;

declare_id!("9dkwNagtgEGXme8zZfSvwtTwoTvG6thwhWmyohkrooGY");

#[program]
pub mod smart_contract {
    use super::*;

    pub fn log_confirmation(
        ctx: Context<LogConfirmation>,
        donation_id: String,
        donor: Pubkey,
        ngo: Pubkey,
        timestamp: i64,
        verification_code: String,
    ) -> Result<()> {
        let rec = &mut ctx.accounts.record;
        rec.donation_id = donation_id;
        rec.donor = donor;
        rec.ngo = ngo;
        rec.timestamp = timestamp;
        rec.verification_code = verification_code;
        Ok(())
    }
}

#[account]
pub struct DonationRecord {
    pub donation_id: String,       // up to 64 chars
    pub donor: Pubkey,
    pub ngo: Pubkey,
    pub timestamp: i64,
    pub verification_code: String, // up to 16 chars
}

#[derive(Accounts)]
pub struct LogConfirmation<'info> {
    #[account(
        init,
        payer = signer,
        space = 8                       // discriminator
            + 4 + 64                   // donation_id string
            + 32                       // donor pubkey
            + 32                       // ngo pubkey
            + 8                        // timestamp
            + 4 + 16                   // verification_code string
    )]
    pub record: Account<'info, DonationRecord>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
