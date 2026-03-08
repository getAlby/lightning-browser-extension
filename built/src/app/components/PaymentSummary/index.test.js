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
const PaymentSummary_1 = __importDefault(require("@components/PaymentSummary"));
const react_1 = require("@testing-library/react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const settings_1 = require("~/../tests/fixtures/settings");
const i18n_1 = __importDefault(require("~/../tests/unit/helpers/i18n"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
// calls in SettingsProvider
jest.mock("~/common/lib/api", () => {
    const original = jest.requireActual("~/common/lib/api");
    return Object.assign(Object.assign({}, original), { getSettings: jest.fn(() => Promise.resolve(settings_1.settingsFixture)), getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })) });
});
const defaultProps = {
    amount: "1234",
    fiatAmount: "",
};
describe("PaymentSummary", () => {
    const renderComponent = (props) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(PaymentSummary_1.default, Object.assign({}, defaultProps, props)) }) }) }));
        }));
    });
    test("renders correctly with default props", () => __awaiter(void 0, void 0, void 0, function* () {
        yield renderComponent();
        expect(react_1.screen.getByText("1,234 sats")).toBeDefined();
        expect(react_1.screen.queryByText("Description")).toBeNull();
        expect(react_1.screen.queryByTestId("fiat_amount")).toBeNull();
    }));
    test("renders with description", () => __awaiter(void 0, void 0, void 0, function* () {
        yield renderComponent({
            description: "The lovely description",
        });
        expect(react_1.screen.getByText("1,234 sats")).toBeDefined();
        expect(react_1.screen.getByText("Description")).toBeDefined();
        expect(react_1.screen.getByText("The lovely description")).toBeDefined();
    }));
    test("renders with fiat amount", () => __awaiter(void 0, void 0, void 0, function* () {
        yield renderComponent({
            fiatAmount: "$0,02",
        });
        expect(react_1.screen.getByTestId("fiat_amount")).toBeDefined();
        expect(react_1.screen.getByText(/(~\$0,02)/)).toBeInTheDocument();
    }));
});
