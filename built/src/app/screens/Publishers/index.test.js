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
const SettingsContext_1 = require("~/app/context/SettingsContext");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const AccountsContext_1 = require("../../context/AccountsContext");
const index_1 = __importDefault(require("./index"));
jest.mock("~/common/lib/api", () => {
    const original = jest.requireActual("~/common/lib/api");
    return Object.assign(Object.assign({}, original), { getSettings: jest.fn(() => Promise.resolve(settings_1.settingsFixture)), getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })) });
});
jest.mock("~/common/lib/msg");
describe("Publishers", () => {
    test("renders active allowance", () => __awaiter(void 0, void 0, void 0, function* () {
        msg_1.default.request.mockImplementation(() => ({
            allowances: [
                {
                    host: "https://openai.com/dall-e-2/",
                    name: "DALL·E 2",
                    imageURL: "",
                    enabled: true,
                    lastPaymentAt: 1656408772800,
                    totalBudget: 98756,
                    remainingBudget: 98656,
                    id: 1,
                    usedBudget: 100,
                    percentage: "0",
                    paymentsCount: 1,
                    paymentsAmount: 3000,
                    lnurlAuth: true,
                },
            ],
        }));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(AccountsContext_1.AccountsProvider, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }) }) }) }));
        expect(yield react_1.screen.findByText("Your ⚡ Websites")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("DALL·E 2")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("BUDGET")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("LOGIN")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("budget 100 / 98,756 sats")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("total 3,000 sats")).toBeInTheDocument();
    }));
    test("no publishers shows discover button", () => __awaiter(void 0, void 0, void 0, function* () {
        msg_1.default.request.mockImplementation(() => ({
            allowances: [],
        }));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(AccountsContext_1.AccountsProvider, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }) }) }) }));
        expect(yield react_1.screen.findByText("Your ⚡ Websites")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("It looks like you haven't used Alby in any websites yet.")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("Discover Websites")).toBeInTheDocument();
    }));
});
