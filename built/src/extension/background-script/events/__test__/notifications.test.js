"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const constants_1 = require("~/common/constants");
const state_1 = __importDefault(require("~/extension/background-script/state"));
const helpers = __importStar(require("../helpers"));
const notifications = __importStar(require("../notifications"));
jest.mock("../helpers");
jest.mock("~/extension/background-script/actions/cache/getCurrencyRate", () => {
    return {
        getCurrencyRateWithCache: jest.fn(() => Promise.resolve(0.00019233)),
    };
});
const settings = {
    browserNotifications: true,
    currency: constants_1.CURRENCIES["USD"],
    exchange: "coindesk",
    locale: "en",
    showFiat: true,
    theme: "",
    userEmail: "",
    userName: "",
    websiteEnhancements: true,
    nostrEnabled: false,
};
const mockState = {
    settings,
};
describe("Payment notifications", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const data = {
        accountId: "12345",
        response: {
            data: {
                preimage: "3463336437663532393963353537396361623734643365663039386565346335",
                paymentHash: "979ab075ebd4b0be49df380ec7fadd14751c33afa1ffa0a6a22499aa819cb153",
                route: {
                    total_amt: 1,
                    total_fees: 0,
                },
            },
        },
        details: {
            destination: "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3",
        },
        paymentRequestDetails: {
            complete: true,
            millisatoshis: "1000",
            network: {
                bech32: "bc",
                pubKeyHash: 0,
                scriptHash: 5,
                validWitnessVersions: [0, 1],
            },
            payeeNodeKey: "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3",
            paymentRequest: "lnbc10n1p3st44mpp5j7dtqa0t6jctujwl8q8v07kaz363cva058l6pf4zyjv64qvuk9fshp5rdh2y59nhv3va0xqg7fmevcmypfw0e3pjq4p6yy52nu4jv76wmqqcqzpgxqyz5vqsp5lal7ervygjs3qpfvglzn472ag2e3w939mfckctpawsjyl3sslc6q9qyyssqvdjlxvgc0zrcn4ze44479x24w7r2svqv8zsp3ezemd55pdkxzwrjeeql0hvuy3d9klsmqzf8rwar8x4cplpxccnaj667p537g46txtqpxkyeuu",
            prefix: "lnbc10n",
            recoveryFlag: 1,
            satoshis: 1,
            signature: "123",
            tags: [
                {
                    tagName: "payment_hash",
                    data: "979ab075ebd4b0be49df380ec7fadd14751c33afa1ffa0a6a22499aa819cb153",
                },
                {
                    tagName: "purpose_commit_hash",
                    data: "1b6ea250b3bb22cebcc04793bcb31b2052e7e621902a1d109454f95933da76c0",
                },
                {
                    tagName: "min_final_cltv_expiry",
                    data: 40,
                },
                {
                    tagName: "expire_time",
                    data: 86400,
                },
                {
                    tagName: "payment_secret",
                    data: "ff7fec8d8444a110052c47c53af95d42b3171625da716c2c3d74244fc610fe34",
                },
            ],
            timeExpireDate: 1661413435,
            timeExpireDateString: "2022-08-25T07:43:55.000Z",
            timestamp: 1661327035,
            timestampString: "2022-08-24T07:43:55.000Z",
            wordsTemp: "123",
        },
        origin: {
            location: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/options.html#/send",
            domain: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan",
            host: "fbdjdcapmecooemonpmfohgeipnbcgan",
            pathname: "/options.html",
            name: "escapedcat@getalby.com",
            description: "",
            icon: "",
            metaData: {
                title: "Alby",
                url: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/options.html#/send",
            },
            external: true,
        },
    };
    test("success via lnaddress from popup", () => __awaiter(void 0, void 0, void 0, function* () {
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        const notifySpy = jest.spyOn(helpers, "notify");
        yield notifications.paymentSuccessNotification("ln.sendPayment.success", data);
        expect(notifySpy).toHaveBeenCalledWith({
            message: "Amount: 1 sat ($0.00)\nFee: 0 sats",
            title: "✅ Successfully paid to »escapedcat@getalby.com«",
        });
    }));
    test("success via lnaddress from popup without fiat-conversion turned off", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockStateNoFiat = {
            settings: Object.assign(Object.assign({}, settings), { showFiat: false }),
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockStateNoFiat);
        const notifySpy = jest.spyOn(helpers, "notify");
        yield notifications.paymentSuccessNotification("ln.sendPayment.success", data);
        expect(notifySpy).toHaveBeenCalledWith({
            message: "Amount: 1 sat\nFee: 0 sats",
            title: "✅ Successfully paid to »escapedcat@getalby.com«",
        });
    }));
    test("success via lnaddress from popup without fiat-conversion turned on", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockStateNoFiat = {
            settings: Object.assign({}, settings),
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockStateNoFiat);
        const notifySpy = jest.spyOn(helpers, "notify");
        yield notifications.paymentSuccessNotification("ln.sendPayment.success", data);
        expect(notifySpy).toHaveBeenCalledWith({
            message: "Amount: 1 sat ($0.00)\nFee: 0 sats",
            title: "✅ Successfully paid to »escapedcat@getalby.com«",
        });
    }));
    test("success without origin skips receiver", () => __awaiter(void 0, void 0, void 0, function* () {
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        const notifySpy = jest.spyOn(helpers, "notify");
        const dataWitouthOrigin = Object.assign({}, data);
        delete dataWitouthOrigin.origin;
        yield notifications.paymentSuccessNotification("ln.sendPayment.success", dataWitouthOrigin);
        expect(notifySpy).toHaveBeenCalledWith({
            message: "Amount: 1 sat ($0.00)\nFee: 0 sats",
            title: "✅ Successfully paid",
        });
    }));
});
describe("Auth notifications", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const data = {
        authResponse: {
            status: "OK",
        },
        lnurlDetails: {
            tag: "login",
            k1: "42033a863825a495feed197ae2c9c3777b771695e7f2251983b323e5354246d6",
            domain: "lnurl.fiatjaf.com",
            url: "https://lnurl.fiatjaf.com/lnurl-login?tag=login&k1=42033a863825a495feed197ae2c9c3777b771695e7f2251983b323e5354246d6",
        },
    };
    test("success via login from popup", () => __awaiter(void 0, void 0, void 0, function* () {
        const notifySpy = jest.spyOn(helpers, "notify");
        notifications.lnurlAuthSuccessNotification("lnurl.auth.success", data);
        expect(notifySpy).toHaveBeenCalledWith({
            title: "✅ Login",
            message: "Successfully logged in to lnurl.fiatjaf.com",
        });
    }));
    test("success via login from prompt with origin", () => __awaiter(void 0, void 0, void 0, function* () {
        const notifySpy = jest.spyOn(helpers, "notify");
        notifications.lnurlAuthSuccessNotification("lnurl.auth.success", Object.assign(Object.assign({}, data), { origin: {
                location: "https://lnurl.fiatjaf.com/",
                domain: "https://lnurl.fiatjaf.com",
                host: "lnurl.fiatjaf.com",
                pathname: "/",
                name: "lnurl fiatjaf",
                description: "",
                icon: "",
                metaData: {
                    title: "lnurl playground",
                    url: "https://lnurl.fiatjaf.com/",
                    provider: "lnurl fiatjaf",
                },
                external: true,
            } }));
        expect(notifySpy).toHaveBeenCalledWith({
            title: "✅ Login to lnurl fiatjaf",
            message: "Successfully logged in to lnurl.fiatjaf.com",
        });
    }));
});
