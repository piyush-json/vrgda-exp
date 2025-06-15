use super::*;
use crate::{
    error::VrgdaResult,
    math::{precise_number::PreciseNumber, InnerUint, SignedPreciseNumber, ONE, ONE_PREC},
};

pub const WSOL_MINT: Pubkey = Pubkey::new_from_array([
    5, 75, 241, 90, 194, 246, 107, 215, 197, 77, 10, 129, 16, 97, 158, 122, 32, 92, 138, 255, 155,
    78, 106, 228, 38, 81, 21, 101, 179, 158, 220, 99,
]);

#[account]
#[derive(InitSpace, Debug)]
pub struct VRGDA {
    pub mint: Pubkey,
    // The max amount that can be minted to a buyer's account.
    pub total_supply: u64,
    /// The account that receives payments.
    pub authority: Pubkey,
    /// The target price for a token (wad).
    pub target_price: u128, // p0
    /// The decay constant (wad) computed as ln(1 - price_decay_percent).
    pub decay_constant_percent: u64, // k
    /// Number of tokens sold so far.
    pub tokens_sold: u64,
    /// The timestamp at which this account was initialized.
    pub created_at_timestamp: i64,
    /// Unix timestamp when the VRGDA began.
    pub vrgda_start_timestamp: i64,
    /// ended?
    pub auction_ended: bool,
    pub schedule: Schedule,
    pub current_price: u64,
    /// Bump for PDA.
    pub bump: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, InitSpace)]
pub enum Schedule {
    LinearSchedule { r: u64 },
}

impl Schedule {
    pub fn get_r(&self) -> u64 {
        match self {
            Schedule::LinearSchedule { r } => *r,
        }
    }
}
// impl VrgdaSchedule for Schedule {
//     fn get_target_sale_time(&self, sold: Wad) -> Wad {
//         match self {
//             Schedule::LinearSchedule { r } => sold.saturating_mul(WAD) / r,
//         }
//     }
// }

impl VRGDA {
    pub fn new(
        mint: Pubkey,
        authority: Pubkey,
        target_price: u128,
        decay_constant_percent: u64,
        schedule: Schedule,
        created_at_timestamp: i64,
        vrgda_start_timestamp: i64,
        bump: u8,
    ) -> Self {
        Self {
            mint,
            total_supply: 0,
            authority,
            target_price,
            decay_constant_percent,
            tokens_sold: 0,
            created_at_timestamp,
            vrgda_start_timestamp,
            auction_ended: false,
            schedule,
            current_price: 0,
            bump,
        }
    }
    // pub fn get_vrgda_price<T: VrgdaSchedule>(
    //     &self,
    //     time_since_start: Wad,
    //     sold: u64,
    //     schedule: &T,
    // ) -> Wad {
    //     // Convert sold + 1 to wad (the formula uses the nth token, sold is n-1).
    //     let sold_wad = to_wad(sold + 1);
    //     // Get the target sale time for this token (wad)
    //     let target_sale_time = schedule.get_target_sale_time(sold_wad);
    //     // Compute the time deviation: current time minus target sale time.
    //     let time_deviation = time_since_start - target_sale_time;
    //     // Multiply the deviation by the decay constant.
    //     let exponent = wad_mul(to_wad(self.decay_constant_percent), time_deviation);
    //     // Compute the multiplier using our wad exponentiation function.
    //     let multiplier = wad_exp_checked(exponent).expect("ERROR OCCURED IN WAD EXP CHECKED");
    //     // Final price: target_price * multiplier.
    //     wad_mul(self.target_price.cast().unwrap(), multiplier)
    // }
    fn get_target_sale_time(&self, n: u64) -> u64 {
        // For a linear schedule t* = n / r
        // 1) build n_wad = n * 10^18

        msg!("N: {:?}", n);
        // 2) build r_wad = r * 10^18
        let r = match self.schedule {
            Schedule::LinearSchedule { r } => r,
            _ => unreachable!(),
        };
        msg!("R: {:?}", r);
        let n_over_r = (n + r).checked_div(r).unwrap();
        n_over_r
        // .checked_mul(&ONE_PREC)
        // .unwrap()
    }

    fn get_target_sale_time_precise(&self, n: u64) -> PreciseNumber {
        // For a linear schedule t* = n / r
        // 1) build n_wad = n * 10^18

        let n = PreciseNumber {
            value: InnerUint::from(n as u128),
        };
        msg!("N: {:?}", n);
        // 2) build r_wad = r * 10^18
        let r = match self.schedule {
            Schedule::LinearSchedule { r } => r,
            _ => unreachable!(),
        };

        let r_precise = PreciseNumber {
            value: InnerUint::from(r as u128),
        };
        msg!("R: {:?}", r_precise);
        let n_over_r = n.checked_div(&r_precise).unwrap();
        msg!("N OVER R: {:?}", n_over_r);

        n_over_r
    }

    pub fn vrgda_price(&self, now: i64, sold: u64) -> VrgdaResult<PreciseNumber> {
        // Compute time elapsed since auction start (t - t₀) and scale it (wad).
        let time_since_start =
            PreciseNumber::new((now - self.vrgda_start_timestamp) as u128).unwrap();
        // .checked_mul(&ONE_PREC)
        // .unwrap();
        msg!("TIME SINCE START: {:?}", time_since_start);

        // f⁻¹(n) for the (sold + 1)th token.
        let f_inv = self.get_target_sale_time(sold);
        msg!("F INVERSE (TIME): {:?}", f_inv);

        let target_time = PreciseNumber::new(f_inv as u128).unwrap();
        msg!("TARGET TIME: {:?}", target_time);
        // Compute the deviation: (t - t₀) - f⁻¹(n)
        let exponent_input = 
        
        // if f_inv.value > time_since_start.value {
        //     // If f_inv is larger, log detailed information for debugging
        //     msg!("F INVERSE: {:?}", f_inv);
        //     msg!("TIME SINCE START: {:?}", time_since_start);
        //     msg!("F INV VALUE: {}", f_inv.value);
        //     msg!("TIME SINCE START VALUE: {}", time_since_start.value);
            
        //     return Err(VRGDAError::ExponentErrorInTMinusFInverse);
        // } else {
            
        time_since_start
            .signed()
            .checked_sub(&target_time.signed())
            .ok_or(VRGDAError::ExponentErrorInTMinusFInverse)?;
        // };

        let normalized_exponent_input = exponent_input.checked_div(&ONE_PREC.signed()).unwrap();
        msg!(
            "Normalized T MINUS F INVERSE: {:?}",
            normalized_exponent_input
        );

        // Convert the decay percentage (for example, if it’s 50, we want 0.50) into wad units.
        // Here we assume ONE_PREC is your wad constant (e.g. 1e18).
        let decay_fraction = PreciseNumber::new(self.decay_constant_percent as u128)
            .unwrap()
            .checked_mul(&ONE_PREC)
            .unwrap()
            .checked_div(&PreciseNumber::new(100).unwrap())
            .unwrap();

        msg!("DECAY FRACTION (wad): {:?}", decay_fraction);
        // Compute 1 - k in wad form.
        let one = PreciseNumber::new(ONE).unwrap();
        msg!("ONE (wad): {:?}", one);

        let one_minus_k = one
            .checked_sub(&decay_fraction)
            .ok_or(VRGDAError::OneMinusKError)?;
        msg!("ONE MINUS K (wad): {:?}", one_minus_k);

        // *** FIX: Normalize one_minus_k by dividing by ONE_PREC so that the log function gets a number < 1.
        let normalized_one_minus_k = one_minus_k
            .checked_div(&PreciseNumber::new(ONE).unwrap())
            .unwrap();
        msg!("Normalized ONE MINUS K: {:?}", normalized_one_minus_k);

        // Compute ln(1 - k) on the normalized value. ln(normalized_one_minus_k)
        // should be negative (e.g. ln(0.5) ≈ -0.693...).
        let ln_one_minus_k = normalized_one_minus_k.log().ok_or(VRGDAError::LogError)?;
        msg!("ln(ONE MINUS K): {:?}", ln_one_minus_k);

        // let exponent_input_signed = exponent_input.signed();

        // let normalized_exponent_input_signed = normalized_exponent_input.signed();
        // Multiply to get the raw exponent: (t - t₀ - f⁻¹(n)) * ln(1 - k)
        let raw_exponent = normalized_exponent_input
            .checked_mul(&ln_one_minus_k)
            .and_then(|result| {
                // More explicit bounds checking
                if result.value > PreciseNumber::new(u64::MAX as u128).unwrap()
                    || result.value < PreciseNumber::new(0).unwrap()
                {
                    msg!("Exponent out of bounds: {:?}", result);
                    None
                } else {
                    Some(result)
                }
            })
            .ok_or(VRGDAError::ExponentError)?;
        msg!("RAW EXPONENT (pre-scale): {:?}", raw_exponent);

        // Since time_since_start was scaled by ONE_PREC and we normalized ln(1-k),
        // the product is off by ONE_PREC. Downscale by dividing by ONE_PREC.
        // let exponent = raw_exponent
        //     .checked_div(&PreciseNumber::new(ONE).unwrap().signed())
        //     .ok_or(VRGDAError::DivisionError)?;
        // msg!("SCALED EXPONENT: {:?}", exponent);

        // Compute the multiplier: e^(exponent)
        let multiplier = raw_exponent.exp().ok_or(VRGDAError::ExponentTooLarge)?;
        msg!("MULTIPLIER: {:?}", multiplier);

        // Multiply the target price (converted to a PreciseNumber) by the multiplier.
        let target_price_scaled = PreciseNumber::new(self.target_price as u128).unwrap();
        Ok(target_price_scaled.checked_mul(&multiplier).unwrap())
    }

    /// O(1) closed-form cost for buying `amount` tokens starting from `sold`
    pub fn vrgda_price_for_amount(
        &self,
        now: i64,
        sold: u64,
        amount: u64,
    ) -> VrgdaResult<PreciseNumber> {
        // elapsed seconds since start, then into wad
        msg!("now: {:?}", now);
        msg!("start timestamp: {:?}", self.vrgda_start_timestamp);
        let elapsed_wad = PreciseNumber::new((now - self.vrgda_start_timestamp) as u128)
            .ok_or(VRGDAError::MathOverflow)?;

        msg!(
            "ELAPSED TIME: {:?}",
            elapsed_wad.checked_div(&ONE_PREC).unwrap()
        );

        let scaled_sold = sold.checked_div(1_000_000).unwrap();

        msg!("SCALED SOLD: {:?}", scaled_sold);

        let r = match self.schedule {
            Schedule::LinearSchedule { r } => r,
            _ => unreachable!(),
        };

        let rt = ((now - self.vrgda_start_timestamp) as u64).saturating_mul(r);
        msg!("RT (ideal tokens to be sold): {:?}", rt);

        let precise_rt = PreciseNumber {
            value: InnerUint::from(rt as u128),
        }
        .signed();

        msg!("RT PRECISE: {:?}", precise_rt);
        let precise_n = PreciseNumber {
            value: InnerUint::from(scaled_sold as u128),
        }
        .signed();

        msg!("N PRECISE: {:?}", precise_n);
        let precise_rt_minus_n = precise_rt
            .checked_sub(&precise_n)
            .ok_or(VRGDAError::MathOverflow)?;

        msg!(
            "RT MINUS N PRECISE (ideal tokens to be sold): {:?}",
            precise_rt_minus_n
        );
        let rt_minus_n = precise_rt_minus_n.value.value.as_u64();

        msg!("RT MINUS N (token difference to be sold): {:?}", rt_minus_n);
        // target time for the very next token (sold+1), in wad

        let amount_scaled = amount.checked_div(1_000_000).unwrap();

        msg!("AMOUNT TO BE BOUGHT SCALED: {:?}", amount_scaled);
        let f_inv_wad = if sold == 0 {
            let n = amount_scaled.min(rt);
            self.get_target_sale_time_precise(n) // clamp to “one‐second’s worth” of tokens
        } else {
            self.get_target_sale_time_precise(scaled_sold + 1) // the usual “next token‐index”
        };

        // if sold == 0 && amount < self.schedule.get_r() {
        //     msg!("SOLD IS ZERO AND AMOUNT IS LESS THAN R");
        //     self.get_target_sale_time_precise(rt_minus_n) // for desired target price if sold == 0 and amount <= r
        // } else if sold == 0 && amount >= self.schedule.get_r() {
        //     msg!("SOLD IS ZERO AND AMOUNT IS GREATER THAN OR EQUAL TO R");
        //     self.get_target_sale_time_precise(scaled_sold + 1) // for desired target price if sold == 0 and amount > r
        // } else {
        // msg!("SOLD IS NOT ZERO");
        // self.get_target_sale_time_precise(scaled_sold + 1)
        // };
        msg!("f_inv_wad: {:?}", f_inv_wad);

        let t_minus_sr = elapsed_wad
            .signed()
            .checked_sub(&f_inv_wad.signed())
            .unwrap()
            .checked_div(&ONE_PREC.signed())
            .ok_or(VRGDAError::DivisionError)?;
        msg!("t_minus_sr: {:?}", t_minus_sr);

        // decay fraction k = (decay_constant_percent / 100) in wad
        let k_wad = PreciseNumber::new(self.decay_constant_percent as u128)
            .unwrap()
            // .checked_mul(&ONE_PREC).unwrap()
            .checked_div(&PreciseNumber::new(100).unwrap())
            .unwrap();
        msg!("k_wad: {:?}", k_wad);

        // one_minus_k = 1·10¹⁸ − k_wad, then normalized back to [0,1)
        let one_minus_k = ONE_PREC
            .checked_sub(&k_wad)
            .ok_or(VRGDAError::OneMinusKError)?;
        msg!("one_minus_k: {:?}", one_minus_k);

        // ln(1−k) — must be negative
        let ln1k = one_minus_k.log().ok_or(VRGDAError::LogError)?;
        if !ln1k.is_negative {
            return Err(VRGDAError::LogError);
        }

        msg!("ln1k: {:?}", ln1k);

        // price of the very next token: p₀·exp( ln(1−k)·(t − S/r) )
        let p0 = PreciseNumber {
            value: InnerUint::from(self.target_price as u128),
        };

        msg!("p0: {:?}", p0);

        let raw_exp = ln1k
            .checked_mul(&t_minus_sr)
            .ok_or(VRGDAError::ExponentError)?;

        msg!("RAW EXPONENT: {:?}", raw_exp);

        let next_mul = raw_exp.exp().ok_or(VRGDAError::ExponentTooLarge)?;

        msg!("next_mul: {:?}", next_mul);

        let p_s1 = p0.checked_mul(&next_mul).unwrap();
        msg!("p_s1: {:?}", p_s1);

        // geometric ratio q = (1−k)^(−1/r)
        let inv_r = PreciseNumber::one()
            .checked_div(&PreciseNumber::new(r as u128).unwrap())
            .unwrap()
            .signed();

        msg!("inv_r: {:?}", inv_r);
        let neg_ln1k = SignedPreciseNumber {
            value: ln1k.value.clone(),
            is_negative: !ln1k.is_negative,
        };

        msg!("neg_ln1k: {:?}", neg_ln1k);

        let q = neg_ln1k
            .checked_mul(&inv_r)
            .ok_or(VRGDAError::ExponentError)?
            .exp()
            .ok_or(VRGDAError::ExponentTooLarge)?;
        msg!("q: {:?}", q);

        let amount_precise = PreciseNumber::new(amount_scaled as u128).unwrap();
        msg!("amount_precise: {:?}", amount_precise);
        //sum of m terms: p_s1 * (q^m - 1) / (q - 1)
        let q_pow_m = q.pow(&amount_precise).unwrap();
        msg!("Q_POW_M: {:?}", q_pow_m);

        let numerator = p_s1
            .checked_mul(&q_pow_m.checked_sub(&PreciseNumber::one()).unwrap())
            .unwrap();
        let denom = q.checked_sub(&PreciseNumber::one()).unwrap();
        let total_cost = numerator
            .checked_div(&denom)
            .ok_or(VRGDAError::DivisionError)?;
        msg!("total_cost: {:?}", total_cost);

        Ok(total_cost)
    }

    /// Super experimental O(amount) cost for buying `amount` tokens starting from `sold`
    /// This is a chunked geometric series sum, so it should be O(1) in practice.
    /// It is not recommended to use this function in production, as it is not optimized.
    /// Use `vrgda_price_for_amount` instead.
    /// This function is only for testing purposes and may not be accurate.
    pub fn vrgda_price_for_amount_v1(
        &self,
        now: i64,
        sold: u64,
        amount: u64,
    ) -> VrgdaResult<PreciseNumber> {
        msg!("now: {:?}", now);
        msg!("start timestamp: {:?}", self.vrgda_start_timestamp);
        let elapsed_wad = PreciseNumber::new((now - self.vrgda_start_timestamp) as u128)
            .ok_or(VRGDAError::MathOverflow)?;

        msg!("ELAPSED TIME: {:?}", elapsed_wad);

        let scaled_sold = sold.checked_div(1_000_000).unwrap();

        let amount_scaled = amount.checked_div(1_000_000).unwrap();

        let f_inv_wad = self.get_target_sale_time_precise(scaled_sold + amount_scaled);
        msg!("f_inv_wad: {:?}", f_inv_wad);

        // normalized (t − S/r) = (elapsed_wad − f_inv_wad) / ONE_PREC
        let t_minus_sr = elapsed_wad
            .signed()
            .checked_sub(&f_inv_wad.signed())
            .unwrap()
            .checked_div(&ONE_PREC.signed())
            .ok_or(VRGDAError::DivisionError)?;
        msg!("t_minus_sr: {:?}", t_minus_sr);

        // decay fraction k = (decay_constant_percent / 100) in wad
        let k_wad = PreciseNumber::new(self.decay_constant_percent as u128)
            .unwrap()
            // .checked_mul(&ONE_PREC).unwrap()
            .checked_div(&PreciseNumber::new(100).unwrap())
            .unwrap();
        msg!("k_wad: {:?}", k_wad);

        let one_minus_k = ONE_PREC
            .checked_sub(&k_wad)
            .ok_or(VRGDAError::OneMinusKError)?;
        msg!("one_minus_k: {:?}", one_minus_k);

        //  // *** FIX: Normalize one_minus_k by dividing by ONE_PREC so that the log function gets a number < 1.
        // let normalized_one_minus_k = one_minus_k
        //     .checked_div(&PreciseNumber::new(ONE).unwrap())
        //     .unwrap();
        // msg!("Normalized ONE MINUS K: {:?}", normalized_one_minus_k);

        let ln1k = one_minus_k.log().ok_or(VRGDAError::LogError)?;
        if !ln1k.is_negative {
            return Err(VRGDAError::LogError);
        }

        msg!("ln1k: {:?}", ln1k);

        let p0 = PreciseNumber {
            value: InnerUint::from(self.target_price as u128),
        };

        msg!("p0: {:?}", p0);
        let next_mul = ln1k
            .checked_mul(&t_minus_sr)
            .ok_or(VRGDAError::ExponentError)?
            .exp()
            .ok_or(VRGDAError::ExponentTooLarge)?;
        let p_s1 = p0.checked_mul(&next_mul).unwrap();
        msg!("p_s1: {:?}", p_s1);

        let r = match self.schedule {
            Schedule::LinearSchedule { r } => r as u128,
            _ => unreachable!(),
        };
        let inv_r = PreciseNumber::one()
            .checked_div(&PreciseNumber::new(r).unwrap())
            .unwrap()
            .signed();

        msg!("inv_r: {:?}", inv_r);
        let neg_ln1k = SignedPreciseNumber {
            value: ln1k.value.clone(),
            is_negative: !ln1k.is_negative,
        };

        msg!("neg_ln1k: {:?}", neg_ln1k);

        let q = neg_ln1k
            .checked_mul(&inv_r)
            .ok_or(VRGDAError::ExponentError)?
            .exp()
            .ok_or(VRGDAError::ExponentTooLarge)?;
        msg!("q: {:?}", q);
        // ───────────────────────────────────────────────────────────────────────────
        // Chunked geometric‐series sum so q^m never overflows:
        //    sum_{i=0..amount−1} p_s1 * q^i
        let mut remaining = amount;
        let mut current_price = p_s1.clone();
        let mut total_cost = PreciseNumber::zero();
        let one = PreciseNumber::one();

        while remaining > 0 {
            // take at most r tokens per chunk
            let chunk = remaining.min(r.try_into().unwrap());
            remaining -= chunk;

            // convert chunk (u64) into your wad‐supply units:
            // PreciseNumber::precise_supply_amt(x, mint_decimals)
            // for a 6‐decimals mint this is x * 10^(18−6)
            let chunk_precise =
                PreciseNumber::precise_supply_amt(chunk, /* your mint.decimals */ 6);
            msg!("chunk_precise: {:?}", chunk_precise);

            // one exponentiation per chunk:
            let q_pow = q.pow(&chunk_precise).ok_or(VRGDAError::ExponentTooLarge)?;
            msg!("q_pow: {:?}", q_pow);

            // batch_cost = current_price * (q^chunk − 1) / (q − 1)
            let numerator = q_pow.checked_sub(&one).unwrap();
            let denominator = q.checked_sub(&one).unwrap();
            let batch_cost = current_price
                .checked_mul(&numerator)
                .unwrap()
                .checked_div(&denominator)
                .ok_or(VRGDAError::DivisionError)?;
            msg!("batch_cost: {:?}", batch_cost);

            total_cost = total_cost.checked_add(&batch_cost).unwrap();

            // advance current_price by chunk:
            current_price = current_price.checked_mul(&q_pow).unwrap();
        }

        msg!("total_cost: {:?}", total_cost);
        Ok(total_cost)
    }
}

pub fn get_target_sale_time_precise_for_test(n: u64, r: u64) -> PreciseNumber {
    // n_wad = n * 10^18
    let n_wad = PreciseNumber {
        value: InnerUint::from(n as u128),
    };
    // r_wad = r * 10^18
    let r_wad = PreciseNumber {
        value: InnerUint::from(r as u128),
    };
    // t* = n_wad / r_wad
    n_wad
        .checked_div(&r_wad)
        .expect("division by zero in get_target_sale_time_precise")
}

pub fn vrgda_price_for_amount_for_tests(
    now: i64,
    sold: u64,
    amount: u64,
    start_ts: i64,
    r: u64,
    decay_constant_percent: u8,
    target_price: u64,
) -> PreciseNumber {
    // elapsed = now - start_ts, in WAD
    let elapsed = PreciseNumber::new((now - start_ts) as u128)
        .expect("overflow in elapsed time")
        .checked_div(&ONE_PREC)
        .unwrap();

    // scale sold down if you used micro‐units originally
    let scaled_sold = (sold / 1_000_000) as u64;

    // rt = ideal tokens sold by now = (now - start_ts) * r
    let rt = ((now - start_ts) as u128).saturating_mul(r as u128) as u64;

    // f_inv_wad = t* for the next token index
    let f_inv_wad = if sold == 0 {
        get_target_sale_time_precise_for_test(scaled_sold.min(rt), r)
    } else {
        get_target_sale_time_precise_for_test(scaled_sold + 1, r)
    };

    // t_minus_sr = elapsed - f_inv_wad, back in seconds
    let t_minus_sr = elapsed
        .signed()
        .checked_sub(&f_inv_wad.signed())
        .unwrap()
        .checked_div(&ONE_PREC.signed())
        .unwrap();

    // k_wad = decay_constant_percent / 100, in WAD
    let k_wad = PreciseNumber::new(decay_constant_percent as u128)
        .unwrap()
        .checked_div(&PreciseNumber::new(100).unwrap())
        .unwrap();

    let one_minus_k = ONE_PREC.checked_sub(&k_wad).unwrap();
    let ln1k = one_minus_k.log().expect("log(1−k) failure");
    assert!(ln1k.is_negative, "ln(1−k) must be negative");

    // raw exponent = ln(1−k) * (t − S/r)
    let raw_exp = ln1k.checked_mul(&t_minus_sr).unwrap();

    // next_mul = exp(raw_exp)
    let next_mul = raw_exp.exp().expect("exp overflow");

    // p₀ in WAD
    let p0 = PreciseNumber {
        value: InnerUint::from(target_price as u128),
    };

    // price for the very next token
    let p_s1 = p0.checked_mul(&next_mul).unwrap();

    // q = (1−k)^(−1/r)
    let inv_r = PreciseNumber::one()
        .checked_div(&PreciseNumber::new(r as u128).unwrap())
        .unwrap()
        .signed();
    let neg_ln1k = SignedPreciseNumber {
        value: ln1k.value.clone(),
        is_negative: !ln1k.is_negative,
    };
    let q = neg_ln1k.checked_mul(&inv_r).unwrap().exp().unwrap();

    // sum of m terms: p_s1 * (q^m − 1) / (q − 1)
    let amt_wad = PreciseNumber::new((amount / 1_000_000) as u128).unwrap();
    let q_pow_m = q.pow(&amt_wad).unwrap();
    let numerator = p_s1
        .checked_mul(&q_pow_m.checked_sub(&PreciseNumber::one()).unwrap())
        .unwrap();
    let denominator = q.checked_sub(&PreciseNumber::one()).unwrap();

    numerator.checked_div(&denominator).unwrap()
}
