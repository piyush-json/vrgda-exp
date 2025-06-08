// Assume 18-decimal fixed-point arithmetic ("wad" math)
pub type Wad = i128;
pub const WAD: Wad = 1_000_000_000_000_000_000;
/// ln(2) in WAD: ~0.6931471805599453 * 1e18
pub const LN2_WAD: i128 = 693_147_180_559_945_309;

pub const MAX_EXP_ABS_WAD: i128 = 88_000_000_000_000_000_000; // "88" in WAD units

/// For negative x < -MAX_EXP_ABS_WAD, e^x is practically 0 in i128 WAD scale.
#[inline(always)]
fn is_too_large_positive(x: i128) -> bool {
    x > MAX_EXP_ABS_WAD
}

#[inline(always)]
fn is_too_large_negative(x: i128) -> bool {
    x < -MAX_EXP_ABS_WAD
}

/// Multiplies two wad numbers, returning a wad.
#[inline(always)]
pub fn wad_mul(a: Wad, b: Wad) -> Wad {
    // (a * b) / WAD
    a.saturating_mul(b)
        .checked_div(WAD)
        .expect("ERROR OCCURED IN WAD MUL")
}

/// An "unsafe" variant that does no overflow checks.
/// Use only when you know inputs are safe.
#[inline(always)]
pub fn unsafe_wad_mul(a: Wad, b: Wad) -> Wad {
    (a * b) / WAD
}

/// Converts a u64 (or any small integer) into a wad.
#[inline(always)]
pub fn to_wad(x: u64) -> Wad {
    (x as Wad) * WAD
}

/// A (naïve) wad exponentiation function.
/// This implementation converts to f64, uses the standard library exp,
/// then converts back to Wad. In a production on-chain context you would
/// want a fully deterministic fixed-point implementation.
#[inline(always)]
pub fn wad_exp(x: Wad) -> Wad {
    // Convert fixed-point (wad) to f64.
    let x_f64 = (x as f64) / (WAD as f64);
    // Compute exp(x)
    let result = x_f64.exp();
    // Convert back to fixed-point
    (result * (WAD as f64)) as Wad
}

#[inline(always)]
pub fn wad_ln(mut x: Wad) -> Wad {
    // x must be positive
    assert!(x > 0, "ln undefined for non-positive numbers");

    // ln(2) in wad: ln(2) ≈ 0.693147180559945309 * 1e18
    let ln2: Wad = 693147180559945309;

    // Normalize: adjust x so that it falls in [WAD, 2*WAD).
    // For x >= 2*WAD, repeatedly divide by 2, and add ln(2) each time.
    // For x < WAD, multiply by 2 and subtract ln(2).
    let mut k: i32 = 0;
    while x >= 2 * WAD {
        x /= 2;
        k += 1;
    }
    while x < WAD {
        x *= 2;
        k -= 1;
    }

    // At this point, x is in [WAD, 2*WAD).
    // Let z = x - WAD so that x = WAD + z and z is in [0, WAD).
    let z = x - WAD;

    // Compute ln(1 + z/WAD) using the Taylor series:
    // ln(1+u) = u - u^2/2 + u^3/3 - u^4/4 + ...  where u = z/WAD.
    // Since our arithmetic is in wad, we work directly with z.
    let mut term = z; // first term: u = z (in wad units, representing z/WAD)
    let mut series: Wad = term; // start with u
                                // We'll sum 9 additional terms (total 10 terms).
                                // Each term is computed in wad math.
    for i in 2..=10 {
        // Multiply by (-z) each time (note: this implicitly computes (-u)^(i-1) scaled by wad).
        term = unsafe_wad_mul(term, -z);
        // Divide by i (integer division; since i is small, this is acceptable).
        series += term / (i as i128);
    }

    // Now, ln(x) = ln(WAD + z) = ln(1 + z/WAD) + ln(WAD)
    // But ln(WAD) is 0 since WAD represents 1.0.
    // Then add the normalization factor: k * ln(2)
    series + (k as i128) * ln2
}

/// Multiply two WAD-scaled values: (a * b) / WAD, with i128 intermediate.
/// Here we do a simple check to detect possible overflow if abs(a*b) > i128::MAX.
#[inline(always)]
pub fn checked_wad_mul(a: i128, b: i128) -> Option<i128> {
    // Convert to i256 if you have that type, or do some manual checks.
    // For demonstration, let's do a simple boundary check before multiply:
    const HALF_MAX: i128 = i128::MAX / 2;
    if a > HALF_MAX || a < -HALF_MAX || b > HALF_MAX || b < -HALF_MAX {
        // This is a super naive check:
        // if a*b could exceed ~ (1<<127), we do a safer approach or return None.
        // A more precise check could be done with an i256 library or wide multiply.
        None
    } else {
        let prod = a.checked_mul(b)?;
        // Now divide by WAD
        let result = prod.checked_div(WAD)?;
        Some(result)
    }
}

#[inline(always)]
pub fn wad_exp_checked(mut x: i128) -> Option<i128> {
    // 0) Basic short-circuit if exponent is extremely large or extremely negative
    if is_too_large_positive(x) {
        // e^x is huge => return None or clamp to i128::MAX
        return Some(i128::MAX);
    }
    if is_too_large_negative(x) {
        // e^x is ~0 => underflow
        return Some(0);
    }

    // If x == 0, e^0 = 1.0 in WAD
    if x == 0 {
        return Some(WAD);
    }

    // 1) Factor out integer k so leftover x is in [-LN2_WAD, LN2_WAD].
    let mut k: i64 = 0;
    while x > LN2_WAD {
        x -= LN2_WAD;
        // Check k overflow in i64
        if k == i64::MAX {
            // Too big
            return Some(i128::MAX);
        }
        k += 1;
    }
    while x < -LN2_WAD {
        x += LN2_WAD;
        if k == i64::MIN {
            // Too small
            return Some(0);
        }
        k -= 1;
    }
    // Now x is "leftover" in [-LN2_WAD, LN2_WAD].

    // 2) Maclaurin series for e^(x/WAD). We'll do ~10 terms.
    let max_iter = 10;
    let mut sum = WAD; // first term: 1.0 in WAD
    let mut term = WAD; // also 1.0 in WAD for n=0

    for i in 1..=max_iter {
        // term = (term * x)/WAD, then divide by i
        term = checked_wad_mul(term, x).unwrap_or_else(|| {
            // On overflow, short-circuit
            i128::MAX
        });
        // Now integer divide by i
        term = match term.checked_div(i as i128) {
            Some(v) => v,
            None => {
                // If dividing by i fails (not likely unless i=0, but let's be safe)
                return None;
            }
        };
        // sum += term
        let tmp = sum.checked_add(term);
        sum = match tmp {
            Some(v) => v,
            None => {
                // sum overflow
                return Some(i128::MAX);
            }
        };
    }
    // sum ~ e^( leftover ), in WAD scale.

    // 3) Multiply by 2^k
    let mut result = sum;
    if k > 0 {
        // multiply by 2^k
        // watch for overflow if k is large
        if k > 127 {
            // Doubling more than 127 times definitely overflows i128
            return Some(i128::MAX);
        }
        // Now do repeated doubling (or you can do shift << k,
        // but check that result fits in i128).
        for _ in 0..k {
            let doubled = result.checked_mul(2);
            match doubled {
                Some(v) => result = v,
                None => return Some(i128::MAX),
            }
        }
    } else if k < 0 {
        // divide by 2^(-k)
        let n = -k;
        // If n > 127, the result is definitely underflow => 0
        if n > 127 {
            return Some(0);
        }
        for _ in 0..n {
            result /= 2;
        }
    }

    Some(result)
}

/// Trait for VRGDA schedules. This lets you define how to compute the target sale time
/// for a given number of tokens sold (converted to wad).
pub trait VrgdaSchedule {
    /// Given a token number (in wad units), return the target sale time (wad).
    /// For example, for a linear schedule f(t) = r * t, this would be n / r.
    fn get_target_sale_time(&self, sold: Wad) -> Wad;
}

/// An example implementation of a linear schedule.
/// If r is the desired tokens per time unit, then the target sale time for token n is n / r.
pub struct LinearSchedule {
    pub r: Wad, // tokens per time unit (wad)
}

impl VrgdaSchedule for LinearSchedule {
    fn get_target_sale_time(&self, sold: Wad) -> Wad {
        // For a linear schedule: target_time = sold / r.
        // We use wad_div implicitly by doing: (sold * WAD) / r.
        // Here, both sold and r are in wad form.
        sold.saturating_mul(WAD)
            .checked_div(self.r)
            .expect("ERROR OCCURED IN GET TARGET SALE TIME")
    }
}

/// The VRGDA structure holds the fixed parameters:
/// - target_price (p0): the ideal price (wad) if tokens are sold exactly on schedule.
/// - decay_constant: precomputed ln(1 - price_decay_percent) (wad); must be negative.
pub struct VRGDACore {
    pub target_price: Wad,
    pub decay_constant: Wad,
}

impl VRGDACore {
    /// Creates a new VRGDA.
    /// _target_price: ideal token price (wad)
    /// _price_decay_percent: percent decay per unit time (wad), e.g. 0.2e18 for 20%
    pub fn new(_target_price: Wad, _price_decay_percent: Wad) -> Self {
        // Compute decay_constant = ln(1 - _price_decay_percent)
        // For demonstration, we use our naive wad_ln. In practice, this should be optimized.
        let one_wad = WAD;
        let decay_constant = wad_ln(one_wad - _price_decay_percent);
        assert!(decay_constant < 0, "NON_NEGATIVE_DECAY_CONSTANT");
        Self {
            target_price: _target_price,
            decay_constant,
        }
    }

    // Returns the VRGDA price for a token sale at the given time.
    // - time_since_start: current time elapsed (wad)
    // - sold: the number of tokens already sold (u64)
    // - schedule: the VRGDA issuance schedule (implements VrgdaSchedule)
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
    //     let exponent = wad_mul(self.decay_constant, time_deviation);
    //     // Compute the multiplier using our wad exponentiation function.
    //     let multiplier = wad_exp_checked(exponent).unwrap();
    //     // Final price: target_price * multiplier.
    //     wad_mul(self.target_price, multiplier)
    // }
}

// --- Example usage ---
//
// Suppose we want to issue tokens with a target price of 0.1 (in wad) and a 20% decay per time unit.
// And we have a linear schedule with r = 10_000_000 tokens per time unit.
//
// let target_price: Wad = 100_000_000_000_000_000; // 0.1 in wad (0.1 * 1e18)
// let price_decay_percent: Wad = 200_000_000_000_000_000; // 0.2 in wad (20% decay)
// let vrgda = VRGDA::new(target_price, price_decay_percent);
//
// let linear_schedule = LinearSchedule { r: to_wad(10_000_000) };
//
// // time_since_start, e.g., 1 hour in wad if we assume 1 unit = 1 hour (converted appropriately)
// let time_since_start: Wad = to_wad(1);
// let tokens_sold: u64 = 5_000_000;
//
// let price = vrgda.get_vrgda_price(time_since_start, tokens_sold, &linear_schedule);
//
// println!("VRGDA price (wad): {}", price);
//
// In this example, the functions compute the price based on the current time, the number of tokens sold,
// and the target sale time derived from the linear schedule. Adjust the units (and conversion factors)
// to match your desired time scale and token supply.
