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
const helpers_1 = require("~/common/utils/helpers");
const db_1 = __importDefault(require("~/extension/background-script/db"));
const state_1 = __importDefault(require("../../state"));
const setIcon_1 = require("../setup/setIcon");
const enable = (message, sender) => __awaiter(void 0, void 0, void 0, function* () {
    const host = (0, helpers_1.getHostFromSender)(sender);
    if (!host)
        return;
    let isUnlocked = yield state_1.default.getState().isUnlocked();
    const allowance = yield db_1.default.allowances
        .where("host")
        .equalsIgnoreCase(host)
        .first();
    const enabledFor = new Set(allowance === null || allowance === void 0 ? void 0 : allowance.enabledFor);
    if (!isUnlocked) {
        try {
            const response = yield utils_1.default.openPrompt({
                args: {},
                origin: { internal: true },
                action: "unlock",
            });
            isUnlocked = response.data.unlocked;
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error) {
                return { error: e.message };
            }
            else {
                return { error: "Failed to unlock" };
            }
        }
    }
    if (isUnlocked && allowance && allowance.enabled && enabledFor.has("alby")) {
        return {
            data: { enabled: true },
        };
    }
    else {
        try {
            const response = yield utils_1.default.openPrompt(message);
            if (response.data.enabled && sender.tab) {
                yield (0, setIcon_1.setIcon)(setIcon_1.ExtensionIcon.Active, sender.tab.id); // highlight the icon when enabled
            }
            // if the response should be saved/remembered we update the allowance for the domain
            // as this returns a promise we must wait until it resolves
            if (response.data.enabled && response.data.remember) {
                if (allowance) {
                    if (!allowance.id) {
                        return { data: { error: "id is missing" } };
                    }
                    enabledFor.add("alby");
                    yield db_1.default.allowances.update(allowance.id, {
                        enabled: true,
                        enabledFor: Array.from(enabledFor),
                        name: message.origin.name,
                        imageURL: message.origin.icon,
                    });
                }
                else {
                    yield db_1.default.allowances.add({
                        host: host,
                        name: message.origin.name,
                        imageURL: message.origin.icon,
                        enabled: true,
                        enabledFor: ["alby"],
                        lastPaymentAt: 0,
                        totalBudget: 0,
                        remainingBudget: 0,
                        createdAt: Date.now().toString(),
                        lnurlAuth: false,
                        tag: "",
                    });
                }
                yield db_1.default.saveToStorage();
            }
            return {
                data: {
                    enabled: response.data.enabled,
                    remember: response.data.remember,
                },
            };
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error) {
                return { error: e.message };
            }
        }
    }
});
exports.default = enable;
