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
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const settings_1 = require("~/../tests/fixtures/settings");
const i18n_1 = __importDefault(require("~/../tests/unit/helpers/i18n"));
const battery_1 = require("~/fixtures/battery");
const AccountsContext_1 = require("../../../context/AccountsContext");
const index_1 = __importDefault(require("./index"));
jest.mock("~/common/lib/api", () => ({
    getPayments: () => {
        return {
            payments: [],
        };
    },
    getAccountInfo: () => {
        return {
            connectorType: "alby",
            balance: { balance: 0, currency: "BTC" },
            currentAccountId: "1234",
            info: {
                alias: "🐝 getalby.com",
                pubkey: undefined,
                lightning_address: "hello@getalby.com",
            },
            name: "hello",
            avatarUrl: undefined,
        };
    },
    getBlocklist: () => {
        return {};
    },
    getInvoices: () => {
        return { invoices: [] };
    },
}));
const mockGetFiatValue = jest
    .fn()
    .mockImplementation(() => Promise.resolve("$0.00"));
jest.mock("~/app/context/AccountContext", () => ({
    useAccount: () => ({
        account: { id: "1", name: "LND account" },
        loading: false,
        unlock: jest.fn(),
        lock: jest.fn(),
        setAccountId: jest.fn(),
        fetchAccountInfo: jest.fn(),
        balancesDecorated: {
            fiatBalance: "",
            accountBalance: "",
        },
    }),
}));
jest.mock("~/app/context/SettingsContext", () => ({
    useSettings: () => ({
        settings: settings_1.settingsFixture,
        isLoading: false,
        updateSetting: jest.fn(),
        getFormattedNumber: jest.fn(),
        getFormattedSats: jest.fn(() => "21 sats"),
        getFormattedFiat: mockGetFiatValue,
    }),
}));
describe("DefaultView", () => {
    test("render DefaultView", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(AccountsContext_1.AccountsProvider, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, { currentUrl: new URL("https://github.com/") }) }) }) }));
        expect(yield react_1.screen.findByText("Send")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("Receive")).toBeInTheDocument();
    }));
    test("render DefaultView with publisher widget if enabled", () => __awaiter(void 0, void 0, void 0, function* () {
        const battery = battery_1.BatteryFixture[0];
        (0, react_1.render)((0, jsx_runtime_1.jsx)(AccountsContext_1.AccountsProvider, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, { currentUrl: new URL("https://github.com/"), renderPublisherWidget: true, lnDataFromCurrentTab: [battery] }) }) }) }));
        expect(yield react_1.screen.findByText("⚡️ Send Satoshis ⚡️")).toBeInTheDocument();
        expect(yield react_1.screen.findByText(battery.name)).toBeInTheDocument();
        expect(yield react_1.screen.findByText(battery.description)).toBeInTheDocument();
    }));
    test("render DefaultView without PublisherWidget if disabled", () => __awaiter(void 0, void 0, void 0, function* () {
        const battery = battery_1.BatteryFixture[0];
        (0, react_1.render)((0, jsx_runtime_1.jsx)(AccountsContext_1.AccountsProvider, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, { currentUrl: new URL("https://github.com/"), renderPublisherWidget: false, lnDataFromCurrentTab: [battery] }) }) }) }));
        expect(yield react_1.screen.queryByText("⚡️ Send Satoshis ⚡️")).not.toBeInTheDocument();
        expect(yield react_1.screen.queryByText(battery.name)).not.toBeInTheDocument();
        expect(yield react_1.screen.queryByText(battery.description)).not.toBeInTheDocument();
    }));
});
