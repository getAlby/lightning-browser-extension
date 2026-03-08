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
const SettingsContext_1 = require("~/app/context/SettingsContext");
const api_1 = __importDefault(require("~/common/lib/api"));
const ReceiveInvoice_1 = __importDefault(require("../ReceiveInvoice"));
jest.mock("~/common/lib/api", () => {
    const original = jest.requireActual("~/common/lib/api");
    return Object.assign(Object.assign({}, original), { getSettings: jest.fn(() => Promise.resolve(settings_1.settingsFixture)), getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })), makeInvoice: jest.fn(), getAccountInfo: jest.fn(() => Promise.resolve({ info: { lightning_address: "hello@getalby.com" } })) });
});
describe("Receive", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("call createInvoice if form is filled and submitted", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = user_event_1.default.setup();
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(ReceiveInvoice_1.default, {}) }) }));
        }));
        const makeInvoiceSpy = jest.spyOn(api_1.default, "makeInvoice");
        const amountField = yield react_1.screen.getByLabelText("Amount");
        expect(amountField).toBeInTheDocument();
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.type(amountField, "250");
        }));
        const descriptionField = yield react_1.screen.getByLabelText("Description");
        expect(descriptionField).toBeInTheDocument();
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.type(descriptionField, "It's a description");
        }));
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.click(yield react_1.screen.getByRole("button", { name: "Create Invoice" }));
        }));
        expect(makeInvoiceSpy).toHaveBeenCalledWith({
            amount: "250",
            memo: "It's a description",
        });
    }));
});
