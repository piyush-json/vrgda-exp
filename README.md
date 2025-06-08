# Variable Rate Gradual Dutch Auctions (VRGDAs) on Solana
VRGDAs are kind of a novel token issuance mechanism, conceived by Paradigm Research
in this [blogpost](https://www.paradigm.xyz/2022/08/vrgda). This repository contains
an anchor solana program and typescript test and implements a linear token issuance
schedule as mentioned in their original blogpost (highly recommended read).

To test, do:
`anchor b && anchor deploy`

and,

`npx tsc --project tsconfig.json &&  npx mocha --reporter spec -t 1000000 -r ts-node/register tests/`

Feel free to modify the test values and params.


## Note
The precise number library and functions are borrowed from Strata protocol's math 
library which can be found [here](https://github.com/StrataFoundation/strata/tree/master/programs/spl-token-bonding/src).
## Warning
Unaudited code. 
The formula needs upper and lower bounds since exponential functions can easily overflow.



