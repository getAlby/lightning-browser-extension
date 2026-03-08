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
jest.mock("~/common/lib/msg");
const mockOnEdit = jest.fn();
const defaultProps = {
    launcherType: "button",
    allowance: {
        id: 1,
        totalBudget: 2000,
        lnurlAuth: false,
    },
    onEdit: mockOnEdit,
};
describe("SitePreferences", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const renderComponent = (props) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, Object.assign({}, defaultProps, props)) }));
        }));
    });
    test("set new budget", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = user_event_1.default.setup();
        yield renderComponent();
        expect(mockGetFiatValue).not.toHaveBeenCalled();
        const settingsButton = yield react_1.screen.getByRole("button");
        yield (0, react_1.act)(() => {
            user.click(settingsButton); // click settings-button
        });
        yield react_1.screen.findByText("Site settings");
        const saveButton = yield react_1.screen.findByRole("button", {
            name: "Save",
        });
        // update fiat value when modal is open
        expect(mockGetFiatValue).toHaveBeenCalledWith(defaultProps.allowance.totalBudget.toString());
        expect(mockGetFiatValue).toHaveBeenCalledTimes(1);
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.clear(react_1.screen.getByLabelText("One-click payments budget"));
            yield user.type(react_1.screen.getByLabelText("One-click payments budget"), "250");
        }));
        expect(react_1.screen.getByLabelText("One-click payments budget")).toHaveValue(250);
        // update fiat value
        expect(mockGetFiatValue).toHaveBeenCalledWith("250");
        expect(mockGetFiatValue).toHaveBeenCalledTimes(4); // plus 3 times for each input value 2, 5, 0
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.click(saveButton);
        }));
        expect(mockOnEdit).toHaveBeenCalledTimes(1);
    }));
    test("enable website login", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = user_event_1.default.setup();
        yield renderComponent();
        const settingsButton = yield react_1.screen.getByRole("button");
        yield (0, react_1.act)(() => {
            user.click(settingsButton); // click settings-button
        });
        const saveButton = yield react_1.screen.findByRole("button", {
            name: "Save",
        });
        const toggleButton = yield react_1.screen.findByRole("switch");
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.click(toggleButton);
        }));
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.click(saveButton);
        }));
        yield (0, react_1.waitFor)(() => expect(mockOnEdit).toHaveBeenCalled());
    }));
});
