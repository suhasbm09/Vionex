use anchor_lang::prelude::*;

declare_id!("CW1KiQ7GtGfCNu4VH8rv7NKnXChUYarHoBy2sRht8NBa");

#[program]
pub mod vionex_impact {
    use super::*;

    /// One-time: initialize the counter at 0.
    pub fn initialize_counter(ctx: Context<InitializeCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.impact_counter;
        counter.count = 0;
        Ok(())
    }

    /// Logs a new impact record.
    /// - Reads the current counter.
    /// - Creates a new `Impact` PDA using seed ["impact", count.to_le_bytes()].
    /// - Stores `donor`, `ngo`, `medicine`, `quantity`, and `timestamp` inside that account.
    /// - Increments the counter.
    pub fn log_impact(
        ctx: Context<LogImpact>,
        donor: String,
        ngo: String,
        medicine: String,
        quantity: u64,
        timestamp: i64,
    ) -> Result<()> {
        let counter = &mut ctx.accounts.impact_counter;
        let current_index = counter.count;

        // Write into the new Impact account
        let impact_account = &mut ctx.accounts.impact;
        impact_account.donor = donor;
        impact_account.ngo = ngo;
        impact_account.medicine = medicine;
        impact_account.quantity = quantity;
        impact_account.timestamp = timestamp;

        // Bump counter
        counter.count = current_index
            .checked_add(1)
            .ok_or(ErrorCode::CounterOverflow)?;

        Ok(())
    }
}

/// Context for initialize_counter:
/// - The `impact_counter` is a PDA with seed "impact_counter".
/// - The payer (wallet) funds the creation.
#[derive(Accounts)]
pub struct InitializeCounter<'info> {
    #[account(
        init,
        seeds = [b"impact_counter"],
        bump,
        payer = signer,
        space = 8 + 8 // 8 discriminator + 8 bytes for u64
    )]
    pub impact_counter: Account<'info, ImpactCounter>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Context for log_impact:
/// - Reads the same `impact_counter` PDA
/// - Creates a new `impact` PDA derived from ["impact", &counter.count.to_le_bytes()[..]].
/// - The payer is still `signer` (your backend’s Phantom key).
#[derive(Accounts)]
pub struct LogImpact<'info> {
    #[account(
        mut,
        seeds = [b"impact_counter"],
        bump,
    )]
    pub impact_counter: Account<'info, ImpactCounter>,

    /// The new Impact record, PDA = ["impact", counter.count.to_le_bytes()]
    #[account(
        init,
        seeds = [b"impact", &impact_counter.count.to_le_bytes()[..]],
        bump,
        payer = signer,
        space = Impact::MAX_SIZE
    )]
    pub impact: Account<'info, Impact>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// The singleton account that tracks how many Impact records have been created.
#[account]
pub struct ImpactCounter {
    pub count: u64,
}

/// The on-chain Impact record.
/// Fixed space for each string + two integers.
#[account]
pub struct Impact {
    pub donor: String,      // up to 64 bytes
    pub ngo: String,        // up to 64 bytes
    pub medicine: String,   // up to 64 bytes
    pub quantity: u64,      // 8 bytes
    pub timestamp: i64,     // 8 bytes
}

/// Compute the max space needed.
/// Anchor serializes Strings with a 4-byte length prefix + UTF-8 bytes.
impl Impact {
    /// 8 (discriminator)
    /// + (4 + 64) for donor
    /// + (4 + 64) for ngo
    /// + (4 + 64) for medicine
    /// + 8 for quantity
    /// + 8 for timestamp
    pub const MAX_SIZE: usize = 8 + (4 + 64) * 3 + 8 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Counter overflow")]
    CounterOverflow,
}
