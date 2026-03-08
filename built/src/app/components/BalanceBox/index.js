"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const SkeletonLoader_1 = __importDefault(require("@components/SkeletonLoader"));
const AccountContext_1 = require("~/app/context/AccountContext");
const utils_1 = require("~/app/utils");
function BalanceBox({ className }) {
    const { balancesDecorated, accountLoading } = (0, AccountContext_1.useAccount)();
    const balanceParts = balancesDecorated.accountBalance.split(" ");
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.classNames)("w-full flex flex-col items-center justify-center dark:text-white mt-4", className !== null && className !== void 0 ? className : ""), children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl", children: accountLoading ? ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { containerClassName: "inline-block", className: "w-32" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: balanceParts[0] }), (0, jsx_runtime_1.jsxs)("span", { children: ["\u00A0", balanceParts[1]] })] })) }), accountLoading ? ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { containerClassName: "mt-1", className: "w-16" })) : ((0, jsx_runtime_1.jsx)("div", { className: "text-gray-500 mt-1", children: balancesDecorated.fiatBalance && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["~", balancesDecorated.fiatBalance] })) }))] }));
}
exports.default = BalanceBox;
