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
const react_router_dom_1 = require("react-router-dom");
const settings_1 = require("~/../tests/fixtures/settings");
const index_1 = __importDefault(require("./index"));
const mockGetFiatValue = jest
    .fn()
    .mockImplementationOnce(() => Promise.resolve("$0.00"))
    .mockImplementationOnce(() => Promise.resolve("$0.00"))
    .mockImplementationOnce(() => Promise.resolve("$0.01"))
    .mockImplementationOnce(() => Promise.resolve("$0.05"));
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
const amount = 21;
jest.mock("~/app/hooks/useNavigationState", () => {
    return {
        useNavigationState: jest.fn(() => ({
            origin: mockOrigin,
            args: {
                destination: "Satoshi Nakamoto",
                amount,
            },
        })),
    };
});
describe("ConfirmKeysend", () => {
    test("render", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }));
        }));
        expect(yield react_1.screen.findByText("Amount")).toBeInTheDocument();
        expect(yield react_1.screen.findByText("Description")).toBeInTheDocument();
        expect(yield react_1.screen.findByLabelText("Remember and set a budget")).toBeInTheDocument();
    }));
    test("toggles set budget, displays input with a default budget", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = user_event_1.default.setup();
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }));
        }));
        expect(react_1.screen.getByText("21 sats")).toBeInTheDocument();
        expect(react_1.screen.getByText("~$0.01")).toBeInTheDocument();
        expect(react_1.screen.queryByText("~$0.05")).not.toBeInTheDocument();
        yield (0, react_1.act)(() => {
            user.click(react_1.screen.getByText("Remember and set a budget"));
        });
        const input = yield react_1.screen.findByLabelText("Budget");
        expect(input).toHaveValue(amount * 10);
        expect(react_1.screen.getByText("~$0.05")).toBeInTheDocument();
    }));
});
