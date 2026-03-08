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
const react_router_dom_1 = require("react-router-dom");
const settings_1 = require("~/../tests/fixtures/settings");
const index_1 = __importDefault(require("./index"));
const mockGetFiatValue = jest.fn(() => Promise.resolve("$1,22"));
jest.mock("~/app/context/SettingsContext", () => ({
    useSettings: () => ({
        settings: settings_1.settingsFixture,
        isLoading: false,
        updateSetting: jest.fn(),
        getFormattedFiat: mockGetFiatValue,
        getFormattedNumber: jest.fn(),
        getFormattedSats: jest.fn(),
    }),
}));
const mockDetails = {
    callback: "https://lnurlcallback.example.com",
    tag: "payRequest",
    maxSendable: 8000,
    minSendable: 2000,
    metadata: '[["text/plain","blocktime 748949"],["text/long-desc","16sat/vB & empty"]]',
    commentAllowed: 11,
    payerData: {
        name: {
            mandatory: false,
        },
        pubkey: {
            mandatory: false,
        },
        identifier: {
            mandatory: false,
        },
        email: {
            mandatory: false,
        },
        auth: {
            mandatory: false,
            k1: "027f16dee6284649a71b23161b2104be2f33e42133e8ed7999f99d9d35086a0f",
        },
    },
    domain: "lnurl.fiatjaf.com",
    url: "https://lnurl.fiatjaf.com/lnurl-pay?session=a798c63b416e02a33685b51d7a32cf8d5dea14f5b5fd734c5d26d246606a3521",
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
jest.mock("~/app/hooks/useNavigationState", () => {
    return {
        useNavigationState: jest.fn(() => ({
            origin: mockOrigin,
            args: {
                lnurlDetails: mockDetails,
            },
        })),
    };
});
// calculated satValue from passed props
const satValue = Math.floor(+mockDetails.minSendable / 1000);
describe("LNURLPay", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("renders via Send (popup)", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }));
        // get fiat on mount
        yield (0, react_1.waitFor)(() => expect(mockGetFiatValue).toHaveBeenCalledWith(satValue.toString()));
        yield (0, react_1.waitFor)(() => expect(mockGetFiatValue).toHaveBeenCalledTimes(1));
        expect(yield react_1.screen.getByText("blocktime 748949")).toBeInTheDocument();
        expect(yield react_1.screen.getByText("16sat/vB & empty")).toBeInTheDocument();
        expect(yield react_1.screen.getByLabelText("Amount")).toHaveValue(satValue);
    }));
});
