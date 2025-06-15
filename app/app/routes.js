"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("@react-router/dev/routes");
exports.default = [
    (0, routes_1.layout)('layouts/layout.tsx', [
        (0, routes_1.index)('routes/home.tsx'),
        (0, routes_1.route)('launch-token/', 'routes/launch-token/index.tsx'),
        (0, routes_1.route)('token/:id', 'routes/token-details/index.tsx'),
        (0, routes_1.route)('explore/', 'routes/explore.tsx'),
        // route('wallet/', 'routes/wallet.tsx'),
        // route('transactions/', 'routes/transactions.tsx')
        (0, routes_1.route)('*', 'routes/404.tsx')
    ])
];
