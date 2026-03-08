"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAccounts = exports.AccountsProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = __importDefault(require("~/common/lib/api"));
const AccountsContext = (0, react_1.createContext)({});
function AccountsProvider({ children }) {
    const [accounts, setAccounts] = (0, react_1.useState)({});
    function getAccounts() {
        api_1.default.getAccounts().then(setAccounts);
    }
    return ((0, jsx_runtime_1.jsx)(AccountsContext.Provider, { value: { accounts, getAccounts }, children: children }));
}
exports.AccountsProvider = AccountsProvider;
function useAccounts() {
    return (0, react_1.useContext)(AccountsContext);
}
exports.useAccounts = useAccounts;
