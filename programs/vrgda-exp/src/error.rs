use anchor_lang::error_code;
use std::result::Result;

pub type VrgdaResult<T> = Result<T, VRGDAError>;

#[error_code]
pub enum VRGDAError {
    #[msg("amount cant be zero")]
    AmountCantBeZero,

    #[msg("Buyer amount exceeds total supply")]
    AmountExceedsTotalSupply,

    #[msg("address mismatch")]
    AddressesDontMatch,

    #[msg("exponent error in T minus F inverse")]
    ExponentErrorInTMinusFInverse,

    #[msg("Exponent error")]
    ExponentError,

    #[msg("exponent too large")]
    ExponentTooLarge,

    #[msg("One minus k error")]
    OneMinusKError,

    #[msg("Log error")]
    LogError,

    #[msg("division error")]
    DivisionError,

    #[msg("math overflow")]
    MathOverflow,

    #[msg("Invalid decay constant percentage")]
    InvalidDecayConstant,

    #[msg("Auction has ended")]
    AuctionEnded,

    #[msg("Decay constant should be negative")]
    NonNegativeDecayConstant,
}
