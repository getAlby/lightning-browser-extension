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
jest.mock("~/app/hooks/useNavigationState", () => {
    return {
        useNavigationState: jest.fn(() => ({
            origin: mockOrigin,
            args: {
                amount: "21",
                destination: "Satoshi Nakamoto",
            },
        })),
    };
});
jest.mock("~/common/lib/api", () => {
    const original = jest.requireActual("~/common/lib/api");
    return Object.assign(Object.assign({}, original), { getSettings: jest.fn(() => Promise.resolve(settings_1.settingsFixture)), getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })) });
});
describe("Keysend", () => {
    test("renders with fiat", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }) }));
        }));
        expect(yield react_1.screen.findByText("Send payment to")).toBeInTheDocument();
        expect(yield react_1.screen.getByLabelText("Amount (Satoshi)")).toHaveValue(21);
    }));
});
