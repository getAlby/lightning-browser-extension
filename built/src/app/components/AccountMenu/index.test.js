"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const user_event_1 = __importDefault(require("@testing-library/user-event"));
const test_utils_1 = require("react-dom/test-utils");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const i18n_1 = __importDefault(require("~/../tests/unit/helpers/i18n"));
const _1 = __importDefault(require("."));
const defaultProps = {
    showOptions: true,
};
const mockAccounts = {
    "1": { id: "1", connector: "lnd", config: "", name: "LND account" },
    "2": { id: "2", connector: "galoy", config: "", name: "Galoy account" },
};
jest.mock("~/app/context/AccountsContext", () => ({
    useAccounts: () => ({
        accounts: mockAccounts,
        getAccounts: jest.fn(),
    }),
}));
jest.mock("~/app/context/AccountContext", () => ({
    useAccount: () => ({
        account: { id: "1", name: "LND account" },
        loading: false,
        unlock: jest.fn(),
        lock: jest.fn(),
        setAccountId: jest.fn(),
        fetchAccountInfo: jest.fn(),
        balancesDecorated: {
            accountBalance: "123 sats",
        },
    }),
}));
describe("AccountMenu", () => {
    test("renders the toggle button", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(_1.default, Object.assign({}, defaultProps)) }) }));
        expect(react_1.screen.getByRole("button")).toHaveTextContent("Toggle Dropdown");
    }));
    test("displays accounts and options", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = user_event_1.default.setup();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(_1.default, Object.assign({}, defaultProps)) }) }));
        yield (0, test_utils_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.click(react_1.screen.getByText("Toggle Dropdown"));
        }));
        // Title of active account is rendered as dropdown title + first active item in dropdown
        expect(react_1.screen.getAllByText("LND account").length).toEqual(2);
        expect(react_1.screen.getByText("123 sats")).toBeInTheDocument();
        expect(react_1.screen.getByText("Galoy account")).toBeInTheDocument();
        expect(react_1.screen.getByText("Connect Wallet")).toBeInTheDocument();
    }));
});
