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
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Button_1 = __importDefault(require("~/app/components/Button"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const utils_1 = require("~/app/utils");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function ConnectAlby() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_path.alby",
    });
    function connectAlby() {
        return __awaiter(this, void 0, void 0, function* () {
            setLoading(true);
            const name = "Alby";
            const initialAccount = {
                name,
                config: {},
                connector: "alby",
            };
            try {
                const validation = yield api_1.default.validateAccount(initialAccount);
                if (validation.valid) {
                    if (!validation.oAuthToken) {
                        throw new Error("No oAuthToken returned");
                    }
                    const accountInfo = validation.info.data;
                    const account = Object.assign(Object.assign({}, initialAccount), { 
                        // NOTE: name and avatarUrl will be overwritten each time the account info is reloaded
                        // but also saved here so the correct information is cached
                        name: (0, utils_1.getAlbyAccountName)(accountInfo), avatarUrl: accountInfo.avatar, config: Object.assign(Object.assign({}, initialAccount.config), { oAuthToken: validation.oAuthToken }) });
                    const addResult = yield msg_1.default.request("addAccount", account);
                    if (addResult.accountId) {
                        // TODO: update all connectors to use api instead of msg.request
                        yield msg_1.default.request("selectAccount", {
                            id: addResult.accountId,
                        });
                        navigate("/test-connection");
                    }
                    else {
                        console.error("Failed to add account", addResult);
                        throw new Error(addResult.error);
                    }
                }
                else {
                    console.error("Failed to validate account", validation);
                    throw new Error(validation.error);
                }
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    Toast_1.default.error(`${tCommon("errors.connection_failed")} (${e.message})`);
                }
            }
            finally {
                setLoading(false);
            }
        });
    }
    return ((0, jsx_runtime_1.jsx)(Button_1.default, { type: "button", label: t("connect"), loading: loading, disabled: loading, flex: true, onClick: connectAlby, primary: true }));
}
exports.default = ConnectAlby;
