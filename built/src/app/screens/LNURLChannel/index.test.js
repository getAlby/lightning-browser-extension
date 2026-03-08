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
const SettingsContext_1 = require("~/app/context/SettingsContext");
const index_1 = __importDefault(require("./index"));
jest.mock("~/common/lib/api", () => {
    const original = jest.requireActual("~/common/lib/api");
    return Object.assign(Object.assign({}, original), { getSettings: jest.fn(() => Promise.resolve(settings_1.settingsFixture)), getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })) });
});
const mockDetails = {
    tag: "channelRequest",
    k1: "6d123a115100e035afa8735c2c45bbb42bedc9cb43284e8e9d4fdd70c76a08e1",
    callback: "https://lnurl.fiatjaf.com/lnurl-channel/callback/cec8746fb6fd88f79e97faecdcfe95701aeb8deac5c16f6e0453db79e0215a35",
    uri: "0331f80652fb840239df8dc99205792bba2e559a05469915804c08420230e23c7c@74.108.13.152:9735",
    domain: "lnurl.fiatjaf.com",
    url: "https://lnurl.fiatjaf.com/lnurl-channel?session=cec8746fb6fd88f79e97faecdcfe95701aeb8deac5c16f6e0453db79e0215a35",
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
describe("LNURLChannel", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("renders via Send (popup)", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }) }));
        expect(yield react_1.screen.findByText("Channel Request")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("Request a channel from the node:")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("0331f80652fb840239df8dc99205792bba2e559a05469915804c08420230e23c7c@74.108.13.152:9735")).toBeInTheDocument();
    }));
});
