"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactQueryProvider = ReactQueryProvider;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
function ReactQueryProvider({ children }) {
    const [client] = (0, react_1.useState)(new react_query_1.QueryClient());
    return <react_query_1.QueryClientProvider client={client}>{children}</react_query_1.QueryClientProvider>;
}
