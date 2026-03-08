"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const AccountContext_1 = require("~/app/context/AccountContext");
const AccountsContext_1 = require("~/app/context/AccountsContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const Providers = (props) => {
    return ((0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(AccountContext_1.AccountProvider, { children: (0, jsx_runtime_1.jsx)(AccountsContext_1.AccountsProvider, { children: props.children }) }) }));
};
exports.default = Providers;
