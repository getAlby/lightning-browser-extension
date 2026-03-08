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
const CompanionDownloadInfo_1 = __importDefault(require("@components/CompanionDownloadInfo"));
const ConnectorForm_1 = __importDefault(require("@components/ConnectorForm"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const ConnectionErrorToast_1 = __importDefault(require("@components/toasts/ConnectionErrorToast"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const PasswordViewAdornment_1 = __importDefault(require("~/app/components/PasswordViewAdornment"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
const lnd_png_1 = __importDefault(require("/static/assets/icons/lnd.png"));
const initialFormData = {
    url: "",
    macaroon: "",
};
function ConnectLnd() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.lnd",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const [formData, setFormData] = (0, react_2.useState)(initialFormData);
    const [isDragging, setDragging] = (0, react_2.useState)(false);
    const hiddenFileInput = (0, react_2.useRef)(null);
    const [loading, setLoading] = (0, react_2.useState)(false);
    const [hasTorSupport, setHasTorSupport] = (0, react_2.useState)(false);
    const [macaroonVisible, setMacaroonVisible] = (0, react_2.useState)(false);
    function handleChange(event) {
        setFormData(Object.assign(Object.assign({}, formData), { [event.target.name]: event.target.value.trim() }));
    }
    function getConnectorType() {
        if (formData.url.match(/\.onion/i) && !hasTorSupport) {
            return "nativelnd";
        }
        // default to LND
        return "lnd";
    }
    function handleSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            setLoading(true);
            const { url, macaroon } = formData;
            const account = {
                name: "LND",
                config: {
                    macaroon,
                    url,
                },
                connector: getConnectorType(),
            };
            try {
                let validation;
                // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
                if (account.connector === "nativelnd") {
                    validation = { valid: true, error: "" };
                }
                else {
                    validation = yield msg_1.default.request("validateAccount", account);
                }
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
                    Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: validation.error, link: formData.url }), 
                    // Don't auto-close
                    { duration: 100000 });
                }
            }
            catch (e) {
                console.error(e);
                let message = "";
                if (e instanceof Error) {
                    message += `${e.message}`;
                }
                Toast_1.default.error((0, jsx_runtime_1.jsx)(ConnectionErrorToast_1.default, { message: message, link: `${formData.url}/v1/getinfo` }));
            }
            setLoading(false);
        });
    }
    function dropHandler(event) {
        event.preventDefault();
        if (event.dataTransfer.items &&
            event.dataTransfer.items[0].kind === "file") {
            const file = event.dataTransfer.items[0].getAsFile();
            if (file) {
                const extension = file.name.split(".").pop();
                if (extension === "macaroon")
                    readFile(file);
            }
        }
        if (isDragging)
            setDragging(false);
    }
    function readFile(file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            var _a;
            if ((_a = evt.target) === null || _a === void 0 ? void 0 : _a.result) {
                const macaroon = utils_1.default.bytesToHexString(new Uint8Array(evt.target.result));
                if (macaroon) {
                    setFormData(Object.assign(Object.assign({}, formData), { macaroon }));
                }
            }
        };
        reader.readAsArrayBuffer(file);
    }
    function dragOverHandler(event) {
        event.preventDefault();
        if (!isDragging)
            setDragging(true);
    }
    function dragLeaveHandler(event) {
        if (isDragging)
            setDragging(false);
    }
    return ((0, jsx_runtime_1.jsxs)(ConnectorForm_1.default, { title: t("page.title"), description: t("page.description"), logo: lnd_png_1.default, submitLoading: loading, submitDisabled: formData.url === "" || formData.macaroon === "", onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-6", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "url", label: t("url.label"), placeholder: t("url.placeholder"), pattern: "https?://.+", title: t("url.placeholder"), onChange: handleChange, required: true, autoFocus: true }) }), formData.url.match(/\.onion/i) && ((0, jsx_runtime_1.jsx)("div", { className: "mb-6", children: (0, jsx_runtime_1.jsx)(CompanionDownloadInfo_1.default, { hasTorCallback: (hasTor) => {
                        setHasTorSupport(hasTor);
                    } }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "macaroon", type: macaroonVisible ? "text" : "password", autoComplete: "new-password", label: t("macaroon.label"), value: formData.macaroon, onChange: handleChange, required: true, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                                    setMacaroonVisible(passwordView);
                                } }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-center my-6 dark:text-white", children: tCommon("or") }), (0, jsx_runtime_1.jsxs)("div", { className: `cursor-pointer flex flex-col items-center dark:bg-surface-02dp p-4 py-3 border-dashed border-2 border-gray-300 bg-gray-50 rounded-md text-center transition duration-200 ${isDragging ? "border-blue-600 bg-blue-50" : ""}`, onDrop: dropHandler, onDragOver: dragOverHandler, onDragLeave: dragLeaveHandler, onClick: () => {
                            if (hiddenFileInput === null || hiddenFileInput === void 0 ? void 0 : hiddenFileInput.current)
                                hiddenFileInput.current.click();
                        }, children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsShareLine, { className: "mb-3 h-6 w-6 text-blue-600 hover:text-blue-700" }), (0, jsx_runtime_1.jsx)("p", { className: "dark:text-white", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "drag_and_drop", t: t, 
                                    // eslint-disable-next-line react/jsx-key
                                    components: [(0, jsx_runtime_1.jsx)("span", { className: "underline" })] }) }), (0, jsx_runtime_1.jsx)("input", { ref: hiddenFileInput, onChange: (event) => {
                                    if (event.target.files) {
                                        const file = event.target.files[0];
                                        readFile(file);
                                    }
                                }, type: "file", accept: ".macaroon", hidden: true })] })] })] }));
}
exports.default = ConnectLnd;
