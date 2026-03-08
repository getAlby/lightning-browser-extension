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
const state_1 = __importDefault(require("~/extension/background-script/state"));
const remove_1 = __importDefault(require("../remove"));
jest.mock("~/extension/background-script/state");
const defaultMockState = {
    currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
    saveToStorage: jest.fn,
    accounts: {
        "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e": {
            config: "U2FsdGVkX1+tXOG9qx3u4SC7zeEGB0bN7eI1YTJtxGGsit3qrjJTLaYe1eGnjN+sPFv1C0iPxJWKJps/pT76Nux/OZVXZAvfQvRnvCI0iHoIgvcCeGGb2eKGQyYYevt9bw/Uu1fzN2dq+uDlUkHRkQhJIhoqnQBdjdTv14s4QqGshF5dT9OrKkUWq1MUbUCpsfMnYu9i4nQj1i3Hve0oA/4OEAn36J05MfKQcxp8yNJjTPu2yGH9edGh8iwvcI2dnFw90YmSu/stLsF5739aTaPLUV0dYz+fje8s6n5dcHcnIK5x3GuGylSGQkteN2UUh0gjMtX6Ih4WmTbwhJBmLAhmDwM+2k/lLd13bbOoYbLCusvoKUDl8pdLkvYZr8qM7GcuCYfmr8+R/5JN0CCs6jbsg3GvF9h0SqdPDzaJf5xGWIOll2yHcPbCV/Xpe096BEN/Ehh3L8xFeS4i9+t8YNtFDo+d+1R0xPPNplf3/P4PZy5uHbKSKNkCp/MMs42cOdS4qKCGMwTN/lPNbzkTzw3Krh/m6m2sRO7RVBl+SQlv/wODPr05Pd+D1kmRn/FMgZkDKI0O8ShapWP7YEJCqzR3Rya6ChlaO+UDMuahBJmprXylrTCpeyRI8xw9m5ifwkgi2Rgi61dll31d8rQljOxJQZeSpXVnluwMG6eGiyUN+Kd6IGGFaPc0PBWQuUDDkIApbYGuK1tA6Gkd3MWqzxACj0w+2hGR5JKbydtSTIrBMdQ1dRNXZ0tVGyjvvNWwHm+oeH2qEBpqqzCVGVOxXQlbx3qp/9LliOxLQxQDpkOttP5QtjKyPNVOC+5w8kscZR/0W+jD11zn/rt9oFoIGOj5VpDV069PFS+52cmTngQhe0w7lLKvUbRt6h3bqIAx",
            connector: "lnd",
            name: "BLUE",
        },
        "d892e2d7-ac72-49b7-94c2-9fa024c5c1d3": {
            config: "U2FsdGVkX18x4cUObldNt1lc6lzbd2jPsAncQPuTli6m4liYUnkwY3K++2Mq6pI1aNygxdBKwx7eOYiSK9D5TmHiDyUGHG7RBX5S+ZNNa2G5UeWNsIe36M3mJ8AESRpCH7c4vjjR/V5shnECf/uUTYZjLx1ExrcUaB6uN6TEMoUfCoHVQ80FUZQO17z/gDaVF2D0DXeRBwUofAL2tgo0IGmYaL8YomLijSPVqiC0Iuj7kt48ogFJaHcxtPYg607FQRSjKn1MjE5qp8uSuB2qKZc2r4MH8Yjnqnru0IBwqr0g81wKVTsyFdHA+udgYdVByMvxsOVzLz1yJx9aE4GQfHjkU9qbP+FuqlxU5IlSjIsE2OWukLBOo+3mK3l2lN7hxoKTv+Puciy7n5InL6FkRf5DPRuKfAKXsFKmyjoaariDOofVfy+Eo3Fp24EByJ3/0WCepQYonJtE8HfoZuf+GcAeT6OErGPoBZJmtOZFf/GSL+Y/xlMztGdzKHNN1AhrjuaKsCo+Fqie6+03gdJQwiHC2tQo3pykJdJZOTKQ58ES6E0OEmlfnbq6/g2EIexXYQq1LrsxH9Uhv5QrRwYebTPpdN7cG0IEuqEXJo5G9hf/XIjiZ+zNCu2kKOlqg8r7aHYloyUei+sGsoezzWIvQMPveo9LWKc1VxmfX0XAYI6SaHA5yjOkvQF8PEkcu9DqG6yjmY1lqnsG7rAt9cOBEWjwGVEAFhv/cPhUJpBPZ3EtrdQHAdZSEZKiRn0uE8lYY1Yc4bG2WUcjKMlJP1jhai/25NtVTe0rtawG2iiOkvzojgKo/XcsuJWkBSa56ZWFycO11OOcqYYyIegh08P5FYkOW3763pAmdJ0oVcTEE6AlLE6uZgG8FXlLY+rrB6tr",
            connector: "lnd",
            name: "GREEN",
        },
    },
};
const message = {
    application: "LBE",
    args: { id: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e" },
    origin: { internal: true },
    prompt: true,
    action: "removeAccount",
};
describe("remove account", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("current account is being removed first existing account will be set as current", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockState = defaultMockState;
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        state_1.default.setState = () => jest.fn;
        const spy = jest.spyOn(state_1.default, "setState");
        expect(yield (0, remove_1.default)(message)).toStrictEqual({
            data: { removed: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e" },
        });
        expect(spy).toHaveBeenNthCalledWith(2, {
            currentAccountId: "d892e2d7-ac72-49b7-94c2-9fa024c5c1d3",
        });
        expect(spy).toHaveBeenCalledTimes(2);
    }));
    test("other account is being removed the current account is not updated", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockState = defaultMockState;
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        state_1.default.setState = () => jest.fn;
        const spy = jest.spyOn(state_1.default, "setState");
        expect(yield (0, remove_1.default)(Object.assign(Object.assign({}, message), { args: { id: "d892e2d7-ac72-49b7-94c2-9fa024c5c1d3" } }))).toStrictEqual({
            data: { removed: "d892e2d7-ac72-49b7-94c2-9fa024c5c1d3" },
        });
        expect(spy).toHaveBeenCalledTimes(1);
    }));
    test("account is being removed if test-connection fails during on-boarding", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockState = Object.assign(Object.assign({}, defaultMockState), { accounts: {
                "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e": {
                    config: "U2FsdGVkX1+tXOG9qx3u4SC7zeEGB0bN7eI1YTJtxGGsit3qrjJTLaYe1eGnjN+sPFv1C0iPxJWKJps/pT76Nux/OZVXZAvfQvRnvCI0iHoIgvcCeGGb2eKGQyYYevt9bw/Uu1fzN2dq+uDlUkHRkQhJIhoqnQBdjdTv14s4QqGshF5dT9OrKkUWq1MUbUCpsfMnYu9i4nQj1i3Hve0oA/4OEAn36J05MfKQcxp8yNJjTPu2yGH9edGh8iwvcI2dnFw90YmSu/stLsF5739aTaPLUV0dYz+fje8s6n5dcHcnIK5x3GuGylSGQkteN2UUh0gjMtX6Ih4WmTbwhJBmLAhmDwM+2k/lLd13bbOoYbLCusvoKUDl8pdLkvYZr8qM7GcuCYfmr8+R/5JN0CCs6jbsg3GvF9h0SqdPDzaJf5xGWIOll2yHcPbCV/Xpe096BEN/Ehh3L8xFeS4i9+t8YNtFDo+d+1R0xPPNplf3/P4PZy5uHbKSKNkCp/MMs42cOdS4qKCGMwTN/lPNbzkTzw3Krh/m6m2sRO7RVBl+SQlv/wODPr05Pd+D1kmRn/FMgZkDKI0O8ShapWP7YEJCqzR3Rya6ChlaO+UDMuahBJmprXylrTCpeyRI8xw9m5ifwkgi2Rgi61dll31d8rQljOxJQZeSpXVnluwMG6eGiyUN+Kd6IGGFaPc0PBWQuUDDkIApbYGuK1tA6Gkd3MWqzxACj0w+2hGR5JKbydtSTIrBMdQ1dRNXZ0tVGyjvvNWwHm+oeH2qEBpqqzCVGVOxXQlbx3qp/9LliOxLQxQDpkOttP5QtjKyPNVOC+5w8kscZR/0W+jD11zn/rt9oFoIGOj5VpDV069PFS+52cmTngQhe0w7lLKvUbRt6h3bqIAx",
                    connector: "lnd",
                    name: "BLUE",
                },
            } });
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        state_1.default.setState = () => jest.fn;
        const spy = jest.spyOn(state_1.default, "setState");
        const messageTestConnection = message;
        delete messageTestConnection["args"];
        expect(yield (0, remove_1.default)(messageTestConnection)).toStrictEqual({
            data: { removed: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e" },
        });
        expect(spy).toHaveBeenNthCalledWith(1, {
            accounts: {},
        });
    }));
});
