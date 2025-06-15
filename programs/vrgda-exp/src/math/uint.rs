// Stolen from Strata protocol's program library
//! Large uint types

// required for clippy
#![allow(clippy::assign_op_pattern)]
#![allow(clippy::ptr_offset_with_cast)]
#![allow(clippy::manual_range_contains)]
#![allow(clippy::reversed_empty_ranges)]

use std::io::{Read, Write};

use anchor_lang::{AnchorDeserialize, AnchorSerialize, Space};
use uint::construct_uint;

construct_uint! {
    pub struct U256(4);
}
construct_uint! {
    pub struct U192(3);
}

construct_uint! {
    pub struct U128(2);
}

impl AnchorSerialize for U192 {
    fn serialize<W: Write>(&self, writer: &mut W) -> std::io::Result<()> {
        // Serialize each u64 in the array in order.
        self.0[0].serialize(writer)?;
        self.0[1].serialize(writer)?;
        self.0[2].serialize(writer)?;
        Ok(())
    }
}

impl AnchorDeserialize for U192 {
    fn deserialize(buf: &mut &[u8]) -> std::io::Result<Self> {
        // Deserialize three u64 values from the buffer.
        let a = u64::deserialize(buf)?;
        let b = u64::deserialize(buf)?;
        let c = u64::deserialize(buf)?;
        Ok(U192([a, b, c]))
    }

    fn deserialize_reader<R: Read>(reader: &mut R) -> std::io::Result<Self> {
        // Deserialize three u64 values from the reader.
        let a = u64::deserialize_reader(reader)?;
        let b = u64::deserialize_reader(reader)?;
        let c = u64::deserialize_reader(reader)?;
        Ok(U192([a, b, c]))
    }
}

impl Space for U192 {
    const INIT_SPACE: usize = 24; // 3 u64 values, each 8 bytes
}
