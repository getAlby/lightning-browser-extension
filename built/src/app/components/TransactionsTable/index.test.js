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
const _1 = __importDefault(require("."));
jest.mock("~/common/lib/api", () => {
    const original = jest.requireActual("~/common/lib/api");
    return Object.assign(Object.assign({}, original), { getSettings: jest.fn(() => Promise.resolve(settings_1.settingsFixture)), getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })) });
});
const transactions = {
    transactions: [
        {
            timestamp: 1656573909064,
            createdAt: "1656573909064",
            timeAgo: "5 days ago",
            description: "Polar Invoice for bob",
            host: "https://openai.com/dall-e-2/",
            id: "1",
            location: "https://openai.com/dall-e-2/",
            name: "Alby",
            preimage: "ecc5784b0834f7fcb244f789fe16356eb1121c301c7fc0aa5a7859285c1d1289",
            title: "Alby",
            totalAmount: "1234000",
            totalAmountFiat: "$241.02",
            totalFees: 0,
            type: "sent",
        },
    ],
};
const invoices = {
    transactions: [
        {
            id: "lnbcrt666660n1p3tad0hpp5kkguywerj5lqspc4p2a7f53yfnkuywxmxnuawe3lu4gdg0ezc2tqdqjd3sk6cn0ypkxzmtzducqzpgxqyz5vqsp529wvk52ckjkrfkll9q3w6ep6lrsg35se66jjpm5ssmumck7xxy6s9qyyssqzq3zsstfs7gzklgkdnxy2hsp4jfavw8xj4hv5300yww3053jx76h57e3ypsuvg36zwd49xm2nfr2lrfvylwrxs7yhpckjytvlaju0hsq7p9wna",
            timestamp: 1656573909064,
            type: "received",
            totalAmount: "66666",
            totalAmountFiat: "$13.02",
            preimage: "",
            title: "lambo lambo",
            timeAgo: "4 days ago",
        },
        {
            id: "lnbcrt6543210n1p3tadjepp5rv6ufq4vumg66l9gcyxqhy89n6w90mx0mh6gcj0sawrf6xuep5ssdq5g9kxy7fqd9h8vmmfvdjscqzpgxqyz5vqsp5f9yzxeqjw33ule4rffuh0py32gjjsx8z48cd4xjl8ej3rn7zdtdq9qyyssqe6qvkfe260myc9ypgs5n63xzwcx82fderg8p5ysh6c2fvpz5xu4ksvhs5av0wwestk5pmucmhk8lpjhmy7wqyq9c29xgm9na2q5xv5spy5kukj",
            timestamp: 1656573909064,
            type: "received",
            totalAmount: "654321",
            totalAmountFiat: "$127.80",
            preimage: "",
            title: "Alby invoice",
            timeAgo: "6 days ago",
        },
    ],
};
const invoicesWithBoostagram = {
    transactions: [
        {
            id: "lnbcrt666660n1p3tad0hpp5kkguywerj5lqspc4p2a7f53yfnkuywxmxnuawe3lu4gdg0ezc2tqdqjd3sk6cn0ypkxzmtzducqzpgxqyz5vqsp529wvk52ckjkrfkll9q3w6ep6lrsg35se66jjpm5ssmumck7xxy6s9qyyssqzq3zsstfs7gzklgkdnxy2hsp4jfavw8xj4hv5300yww3053jx76h57e3ypsuvg36zwd49xm2nfr2lrfvylwrxs7yhpckjytvlaju0hsq7p9wna",
            timestamp: 1656573909064,
            type: "received",
            totalAmount: "66666",
            totalAmountFiat: "$13.02",
            preimage: "",
            title: "lambo lambo",
            timeAgo: "4 days ago",
        },
        {
            id: "lnbcrt888880n1p3tad30pp56j6g34wctydrfx4wwdwj3schell8uqug6jnlehlkpw02mdfd9wlqdq0v36k6urvd9hxwuccqzpgxqyz5vqsp5995q4egstsvnyetwvpax6jw8q0fnn4tyz3gp35k3yex29emhsylq9qyyssq0yxpx6peyn4vsepwj3l68w9sc5dqnkt07zff6aw4kqvcfs0fpu4jpfh929w6vqrgtjfkmrlwghq4s9t4mnwrh4dlkm6wjem5uq8eu4gpwqln0j",
            timestamp: 1656573909064,
            type: "received",
            totalAmount: "88888",
            totalAmountFiat: "$17.36",
            preimage: "",
            title: "dumplings",
            timeAgo: "5 days ago",
            boostagram: {
                app_name: "Fountain",
                name: "Friedemann",
                podcast: "Honigdachs",
                url: "https://coinspondent.de/honigdachs-der-bitcoin-podcast-aus-leipzig",
                episode: undefined,
                itemID: undefined,
                ts: undefined,
                message: "Du bist so 1 geiles podcast 100%",
                sender_id: "123456",
                sender_name: "bumi@getalby.com",
                time: "00:00",
                action: "boost",
                value_msat_total: 123456,
            },
        },
    ],
};
describe("TransactionsTable", () => {
    test("renders transactions", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(_1.default, Object.assign({}, transactions)) }) }) }));
        expect(react_1.screen.getByText("Sent")).toBeInTheDocument();
        expect(react_1.screen.getByText(/5 days ago/)).toBeInTheDocument();
        expect(yield react_1.screen.findByText(/- 1,234,000 sats/)).toBeInTheDocument();
        expect(yield react_1.screen.findByText(/~\$241.02/)).toBeInTheDocument();
    }));
    test("renders invoice without boostagram", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(_1.default, Object.assign({}, invoices)) }) }) }));
        expect(yield react_1.screen.getAllByText("Received")[0]).toBeInTheDocument();
        expect(yield react_1.screen.findByText(/4 days ago/)).toBeInTheDocument();
        expect(yield react_1.screen.findByText(/\+ 66,666 sats/)).toBeInTheDocument();
        expect(yield react_1.screen.findByText(/~\$13.02/)).toBeInTheDocument();
        const disclosureButtons = react_1.screen.queryByRole("button");
        expect(disclosureButtons).not.toBeInTheDocument();
    }));
    test("renders invoice with boostagram", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(SettingsContext_1.SettingsProvider, { children: (0, jsx_runtime_1.jsx)(_1.default, Object.assign({}, invoicesWithBoostagram)) }) }) }));
        expect(react_1.screen.getAllByText("Received")[0]).toBeInTheDocument();
        expect(react_1.screen.getByText(/5 days ago/)).toBeInTheDocument();
        expect(yield react_1.screen.findByText(/\+ 88,888 sats/)).toBeInTheDocument();
        expect(yield react_1.screen.findByText(/~\$17.36/)).toBeInTheDocument();
    }));
});
