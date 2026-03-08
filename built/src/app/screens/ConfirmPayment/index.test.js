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
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const react_router_dom_1 = require("react-router-dom");
const settings_1 = require("~/../tests/fixtures/settings");
const index_1 = __importDefault(require("./index"));
const mockOrigin = {
    location: "https://getalby.com/demo",
    domain: "https://getalby.com",
    host: "getalby.com",
    pathname: "/demo",
    name: "Alby",
    description: "",
    icon: "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
    metaData: {
        title: "Alby Demo",
        url: "https://getalby.com/demo",
        provider: "Alby",
        image: "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
        icon: "https://getalby.com/favicon.ico",
    },
    external: true,
};
const paymentRequest = "lnbc250n1p3qzycupp58uc2wa29470f98wrxmy4xwuqt8cywjygf5t2cp0s376y7nwdyq3sdqhf35kw6r5de5kueeqg3jk6mccqzpgxqyz5vqsp5wfdmwtv5rmru00ajsnn3f8lzpxa4snug2tmqvc8zj8semr4kjjts9qyyssq83h74pte8nrkqs8sr2hscv5zcdmhwunwnd6xr3mskeayh96pu7ksswa6p7trknlpp6t3js4k6uytxutv5ecgcwaxz7fj4zfy5khjcjcpf66muy";
let parameters = {};
jest.mock("~/app/hooks/useNavigationState", () => {
    return {
        useNavigationState: jest.fn(() => parameters),
    };
});
let mockGetFiatValue = jest.fn();
let mockSettingsTmp = Object.assign({}, settings_1.settingsFixture);
jest.mock("~/app/context/SettingsContext", () => ({
    useSettings: () => ({
        settings: mockSettingsTmp,
        isLoading: false,
        updateSetting: jest.fn(),
        getFormattedFiat: mockGetFiatValue,
        getFormattedNumber: jest.fn(),
        getFormattedSats: jest.fn(() => "25 sats"),
    }),
}));
describe("ConfirmPayment", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("prompt: renders with fiat", () => __awaiter(void 0, void 0, void 0, function* () {
        parameters = {
            origin: mockOrigin,
            args: {
                paymentRequest,
            },
        };
        mockSettingsTmp = Object.assign({}, settings_1.settingsFixture);
        mockGetFiatValue = jest.fn(() => Promise.resolve("$0.01"));
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }));
        }));
        expect(yield react_1.screen.findByText("Amount")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("Description")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("~$0.01")).toBeInTheDocument();
        expect(yield react_1.screen.findByLabelText("Remember and set a budget")).toBeInTheDocument();
    }));
    test("prompt: toggles set budget, displays input with a default budget", () => __awaiter(void 0, void 0, void 0, function* () {
        parameters = {
            origin: mockOrigin,
            args: {
                paymentRequest,
            },
        };
        mockSettingsTmp = Object.assign(Object.assign({}, settings_1.settingsFixture), { showFiat: false });
        mockGetFiatValue = jest.fn(() => Promise.resolve("$0.01"));
        const user = user_event_1.default.setup();
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }));
        }));
        const satoshis = bolt11_signet_1.default.decode(paymentRequest).satoshis || 0;
        expect(yield react_1.screen.findByText(`${satoshis} sats`)).toBeInTheDocument();
        yield (0, react_1.act)(() => {
            user.click(react_1.screen.getByText("Remember and set a budget"));
        });
        const input = yield react_1.screen.findByLabelText("Budget");
        expect(input).toHaveValue(satoshis * 10);
    }));
    test("send: renders with fiat", () => __awaiter(void 0, void 0, void 0, function* () {
        parameters = {
            args: {
                paymentRequest,
            },
        };
        mockSettingsTmp = Object.assign({}, settings_1.settingsFixture);
        mockGetFiatValue = jest.fn(() => Promise.resolve("$0.01"));
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }));
        }));
        expect(yield react_1.screen.findByText("Amount")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("Description")).toBeInTheDocument();
        expect(react_1.screen.getByText("~$0.01")).toBeInTheDocument();
        expect(yield react_1.screen.queryByText("Remember and set a budget")).not.toBeInTheDocument();
    }));
});
