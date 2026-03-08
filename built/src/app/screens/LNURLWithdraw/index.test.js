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
const react_router_dom_1 = require("react-router-dom");
const settings_1 = require("~/../tests/fixtures/settings");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const api_1 = require("~/common/lib/api");
const Toaster_1 = __importDefault(require("~/app/components/Toast/Toaster"));
const index_1 = __importDefault(require("./index"));
const mockDetailsFiatJef = {
    tag: "withdrawRequest",
    k1: "ee61ff078b637aaed980706aeb55c9385b9287f651e52f79dd91fe20835cb771",
    callback: "https://lnurl.fiatjaf.com/lnurl-withdraw/callback/d883e4392c3f836a484c724ab07243a2c130f047294474198063d3b748a82c8e",
    maxWithdrawable: 8000,
    minWithdrawable: 2000,
    defaultDescription: "sample withdraw",
    balanceCheck: "https://lnurl.fiatjaf.com/lnurl-withdraw?session=d883e4392c3f836a484c724ab07243a2c130f047294474198063d3b748a82c8e",
    payLink: "https://lnurl.fiatjaf.com/lnurl-pay",
    domain: "lnurl.fiatjaf.com",
    url: "https://lnurl.fiatjaf.com/lnurl-withdraw?session=123",
};
const mockDetailsLnBits = {
    tag: "withdrawRequest",
    callback: "https://legend.lnbits.com/withdraw/api/v1/lnurl/cb/D7paixQdqcsm3VJrstczsQ?id_unique_hash=123",
    k1: "diC83D9MSTCWKtmyNXgBoi",
    minWithdrawable: 10000,
    maxWithdrawable: 10000,
    defaultDescription: "vouchers",
    domain: "legend.lnbits.com",
    url: "https://legend.lnbits.com/withdraw/api/v1/lnurl/D7paixQdqcsm3VJrstczsQ/123",
};
const mockOrigin = {
    location: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/popup.html#/send",
    domain: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan",
    host: "fbdjdcapmecooemonpmfohgeipnbcgan",
    pathname: "/popup.html",
    name: "Alby",
    description: "",
    icon: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/assets/icons/alby_icon_yellow_128x128.png",
    metaData: {
        title: "Alby",
        url: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/popup.html#/send",
        provider: "Alby",
        image: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/assets/icons/alby_icon_yellow_128x128.png",
    },
    external: true,
};
jest.mock("~/app/hooks/useNavigationState", () => ({
    useNavigationState: jest.fn(() => ({
        origin: mockOrigin,
        args: {
            lnurlDetails: mockDetailsFiatJef,
        },
    })),
}));
jest.mock("~/common/lib/api", () => {
    const original = jest.requireActual("~/common/lib/api");
    return Object.assign(Object.assign({}, original), { getSettings: jest.fn(() => Promise.resolve(settings_1.settingsFixture)), getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })), makeInvoice: jest.fn() });
});
describe("LNURLWithdraw", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("renders via Withdraw (popup)", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, test_utils_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }) }));
        }));
        expect(yield react_1.screen.getByText("lnurl.fiatjaf.com")).toBeInTheDocument();
        expect(yield react_1.screen.getByLabelText("Amount")).toHaveValue(8);
    }));
    test("doesn't render input component when minWithdrawable === maxWithdrawable", () => __awaiter(void 0, void 0, void 0, function* () {
        mockDetailsFiatJef.minWithdrawable = 8000;
        yield (0, test_utils_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }) }));
        }));
        expect(yield react_1.screen.findByText("Amount")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("8 sats")).toBeInTheDocument();
    }));
    test("show error-reason on error-status", () => __awaiter(void 0, void 0, void 0, function* () {
        useNavigationState_1.useNavigationState.mockReturnValue({
            origin: mockOrigin,
            args: {
                lnurlDetails: mockDetailsLnBits,
            },
        });
        api_1.makeInvoice.mockReturnValue({
            invoice: {
                paymentRequest: "lnbc100n1p3s975dpp508vpywcj857rxc78mrwpurhulzxe7slkdqdxsjzyrs3wv9jvsaksdqdwehh2cmgv4e8xcqzpgxqyz5vqsp5vpdqeutqqrwn4eq62a6agmnp3t7rru0asfgy23kcsr6k0tftfxfs9qyyssqf8zxtm0hm5veepjk4kz2ejegkg9449k4e9g5jz25mne096x6k4ajav0afdyx4uw883nv5jdy95w4ltfrfs4hes83j7zh50ygl8w3xxcqf0nhz8",
                rHash: "79d8123b123d3c3363c7d8dc1e0efcf88d9f43f6681a6848441c22e6164c876d",
            },
        });
        const user = user_event_1.default.setup();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsxs)(SettingsContext_1.SettingsProvider, { children: [(0, jsx_runtime_1.jsx)(Toaster_1.default, {}), (0, jsx_runtime_1.jsx)(index_1.default, {})] }) }));
        yield (0, test_utils_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.click(react_1.screen.getByText("Confirm"));
        }));
        expect(yield react_1.screen.findByText("Link not working")).toBeInTheDocument();
    }));
});
