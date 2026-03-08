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
const msg_1 = __importDefault(require("~/common/lib/msg"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const btc_1 = require("~/fixtures/btc");
const currencyConvert_1 = require("~/common/utils/currencyConvert");
const bitcoin_1 = __importDefault(require("~/extension/background-script/bitcoin"));
const mnemonic_1 = __importDefault(require("~/extension/background-script/mnemonic"));
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
                psbt: btc_1.btcFixture.regtestTaprootPsbt,
            },
        })),
    };
});
const passwordMock = jest.fn;
const mockState = {
    password: passwordMock,
    currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
    getAccount: () => ({
        mnemonic: btc_1.btcFixture.mnemonic,
        bitcoinNetwork: "regtest",
    }),
    getMnemonic: () => new mnemonic_1.default(btc_1.btcFixture.mnemonic),
    getBitcoin: () => new bitcoin_1.default(new mnemonic_1.default(btc_1.btcFixture.mnemonic), "regtest"),
    getConnector: jest.fn(),
};
state_1.default.getState = jest.fn().mockReturnValue(mockState);
jest.mock("~/app/context/SettingsContext", () => ({
    useSettings: () => ({
        getFormattedSats: (amount) => (0, currencyConvert_1.getFormattedSats)({
            amount,
            locale: "en",
        }),
    }),
}));
// mock getPsbtPreview request
msg_1.default.request = jest
    .fn()
    .mockReturnValue(new bitcoin_1.default(new mnemonic_1.default(btc_1.btcFixture.mnemonic), "regtest").getPsbtPreview(btc_1.btcFixture.regtestTaprootPsbt));
describe("ConfirmSignPsbt", () => {
    test("render", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(index_1.default, {}) }));
        }));
        const user = user_event_1.default.setup();
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.click(react_1.screen.getByText("Details"));
        }));
        expect(yield react_1.screen.findByText("This website asks you to sign a bitcoin transaction")).toBeInTheDocument();
        // Check inputs
        const inputsContainer = (yield react_1.screen.getByText("Inputs")
            .parentElement);
        expect(inputsContainer).toBeInTheDocument();
        const inputsRef = (0, react_1.within)(inputsContainer);
        expect(yield inputsRef.findByText("bcrt1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqjeprhg")).toBeInTheDocument();
        // Check outputs
        const outputsContainer = react_1.screen.getByText("Outputs")
            .parentElement;
        expect(outputsContainer).toBeInTheDocument();
        const outputsRef = (0, react_1.within)(outputsContainer);
        expect(yield outputsRef.findByText("bcrt1p6uav7en8k7zsumsqugdmg5j6930zmzy4dg7jcddshsr0fvxlqx7qnc7l22")).toBeInTheDocument();
        expect(yield outputsRef.findByText("bcrt1p90h6z3p36n9hrzy7580h5l429uwchyg8uc9sz4jwzhdtuhqdl5eqkcyx0f")).toBeInTheDocument();
        // Check fee
        const feeContainer = react_1.screen.getByText("Fee").parentElement;
        expect(feeContainer).toBeInTheDocument();
        const feeRef = (0, react_1.within)(feeContainer);
        expect(yield feeRef.findByText("155 sats")).toBeInTheDocument();
        yield (0, react_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user.click(react_1.screen.getByText("View raw transaction (Hex)"));
        }));
        expect(yield react_1.screen.findByText(btc_1.btcFixture.regtestTaprootPsbt)).toBeInTheDocument();
    }));
});
