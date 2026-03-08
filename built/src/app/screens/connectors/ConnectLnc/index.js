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
const ConnectorForm_1 = __importDefault(require("@components/ConnectorForm"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const ConnectionErrorToast_1 = __importDefault(require("@components/toasts/ConnectionErrorToast"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const PasswordViewAdornment_1 = __importDefault(require("~/app/components/PasswordViewAdornment"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const lightning_terminal_png_1 = __importDefault(require("/static/assets/icons/lightning_terminal.png"));
const initialFormData = Object.freeze({
    pairingPhrase: "",
});
function ConnectLnd() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.lnc",
    });
    const [formData, setFormData] = (0, react_1.useState)(initialFormData);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [pairingPhraseVisible, setPairingPhraseVisible] = (0, react_1.useState)(false);
    function handleChange(event) {
        setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: event.target.value.trim() }));
    }
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            setLoading(true);
            const { pairingPhrase } = formData;
            const account = {
                name: "LND",
                config: {
                    pairingPhrase,
                },
                connector: "lnc",
            };
            try {
                const validation = { valid: true, error: "" }; // opening and closing a connection to fast causes some problems. I've seen "channel occupied errors" await utils.call("validateAccount", account);
                if (validation.valid) {
                    const addResult = yield msg_1.default.request("addAccount", account);
                    if (addResult.accountId) {
                        yield msg_1.default.request("selectAccount", {
                            id: addResult.accountId,
                        });
                        navigate("/test-connection");
                    }
                }
                else {
                    console.error(validation);
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: validation.error }));
                }
            }
            catch (e) {
                console.error(e);
                let message = "LNC connection failed";
                if (e instanceof Error) {
                    message += `\n\n${e.message}`;
                }
                Toast_1.default.error(message);
            }
            setLoading(false);
        });
    }
    return ((0, jsx_runtime_1.jsx)(ConnectorForm_1.default, { title: t("page.title"), description: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "page.description", t: t, components: [
                // eslint-disable-next-line react/jsx-key
                (0, jsx_runtime_1.jsx)("strong", {}),
                // eslint-disable-next-line react/jsx-key
                (0, jsx_runtime_1.jsx)("br", {}),
            ] }), logo: lightning_terminal_png_1.default, submitLoading: loading, submitDisabled: formData.pairingPhrase === "", onSubmit: handleSubmit, image: "https://cdn.getalby-assets.com/connector-guides/lnc.png", children: (0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "pairingPhrase", autoComplete: "new-password", type: pairingPhraseVisible ? "text" : "password", label: t("pairing_phrase.label"), placeholder: t("pairing_phrase.placeholder"), onChange: handleChange, required: true, autoFocus: true, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                        setPairingPhraseVisible(passwordView);
                    } }) }) }) }));
}
exports.default = ConnectLnd;
