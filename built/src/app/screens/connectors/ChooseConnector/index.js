"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const LinkButton_1 = __importDefault(require("@components/LinkButton"));
function ChooseConnector({ title, description, connectorRoutes, }) {
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "mt-14 mb-4 lg:mb-14 lg:grid lg:gap-8 text-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6 flex flex-col items-center w-full", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold dark:text-white max-md:w-64", children: title }), description && ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 mt-6 dark:text-neutral-400", children: description }))] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-row flex-wrap justify-center -mb-4 -mx-2", children: connectorRoutes.map(({ path, title, logo }) => ((0, jsx_runtime_1.jsx)("div", { className: "w-full sm:w-1/2 md:w-1/3 lg:w-1/5 mb-4 px-2", children: (0, jsx_runtime_1.jsx)(LinkButton_1.default, { to: path, title: title, logo: logo }) }, path))) })] }) }));
}
exports.default = ChooseConnector;
