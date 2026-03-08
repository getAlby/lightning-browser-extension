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
const utils_1 = __importDefault(require("~/common/lib/utils"));
const permissions_1 = require("~/extension/background-script/permissions");
const db_1 = __importDefault(require("../../db"));
const state_1 = __importDefault(require("../../state"));
const WEBLN_PREFIX = "webln/";
const request = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const connector = yield state_1.default.getState().getConnector();
    const accountId = state_1.default.getState().currentAccountId;
    const { origin, args } = message;
    try {
        // // check first if method exists, otherwise toLowerCase() will fail with a TypeError
        if (!args.method || typeof args.method !== "string") {
            throw new Error("Request method is missing or not correct");
        }
        const methodInLowerCase = args.method.toLowerCase();
        const requestMethodName = `request.${methodInLowerCase}`;
        // Check if the current connector support the call
        // connectors maybe do not support `requestMethod` at all
        // connectors also specify a whitelist of supported methods that can be called
        //
        // important: this must throw to exit and return an error
        const supportedMethods = connector.supportedMethods || []; // allow the connector to control which methods can be called
        if (!connector.requestMethod ||
            !supportedMethods.includes(requestMethodName)) {
            throw new Error(`${methodInLowerCase} is not supported by your account`);
        }
        const allowance = yield db_1.default.allowances
            .where("host")
            .equalsIgnoreCase(origin.host)
            .first();
        if (!(allowance === null || allowance === void 0 ? void 0 : allowance.id)) {
            throw new Error("Could not find an allowance for this host");
        }
        if (!accountId) {
            // type guard
            throw new Error("Could not find a selected account");
        }
        const connectorName = connector.constructor.name.toLowerCase();
        // prefix method with webln to prevent potential naming conflicts (e.g. with nostr calls that also use the permissions)
        const weblnMethod = `${WEBLN_PREFIX}${connectorName}/${methodInLowerCase}`;
        const hasPermission = yield (0, permissions_1.hasPermissionFor)(weblnMethod, origin.host);
        // request method is allowed to be called
        if (hasPermission) {
            const response = yield connector.requestMethod(methodInLowerCase, args.params);
            return response;
        }
        else {
            // throws an error if the user rejects
            const promptResponse = yield utils_1.default.openPrompt({
                args: {
                    requestPermission: {
                        method: methodInLowerCase,
                        description: `${connectorName}.${methodInLowerCase}`,
                    },
                },
                origin,
                action: "public/confirmRequestPermission",
            });
            const response = yield connector.requestMethod(methodInLowerCase, args.params);
            // add permission to db only if user decided to always allow this request
            if (promptResponse.data.enabled) {
                yield (0, permissions_1.addPermissionFor)(weblnMethod, origin.host, promptResponse.data.blocked);
            }
            return response;
        }
    }
    catch (e) {
        console.error(e);
        return {
            error: e instanceof Error
                ? e.message
                : `Something went wrong with request ${args === null || args === void 0 ? void 0 : args.method}`,
        };
    }
});
exports.default = request;
