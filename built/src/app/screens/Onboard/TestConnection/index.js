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
const Button_1 = __importDefault(require("@components/Button"));
const Loading_1 = __importDefault(require("@components/Loading"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function TestConnection() {
    const [errorMessage, setErrorMessage] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "welcome.test_connection",
    });
    const navigate = (0, react_router_dom_1.useNavigate)();
    function handleEdit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield msg_1.default.request("removeAccount");
            navigate(-1);
        });
    }
    function loadAccountInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            setLoading(true);
            const timer = setTimeout(() => {
                setErrorMessage(t("connection_taking_long"));
            }, 45000);
            try {
                const response = yield api_1.default.getAccountInfo();
                if (response.name) {
                    navigate("/pin-extension");
                }
                else {
                    setErrorMessage(t("connection_error"));
                }
            }
            catch (e) {
                const message = e instanceof Error ? `(${e.message})` : "";
                console.error(message);
                setErrorMessage(message);
            }
            finally {
                setLoading(false);
                clearTimeout(timer);
            }
        });
    }
    (0, react_1.useEffect)(() => {
        loadAccountInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative mt-14 lg:grid lg:grid-cols-2 gap-8 bg-white dark:bg-surface-02dp p-10 shadow rounded-lg", children: [(0, jsx_runtime_1.jsx)("div", { className: "relative", children: (0, jsx_runtime_1.jsxs)("div", { children: [errorMessage && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold dark:text-white", children: t("connection_error") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-white", children: t("review_connection_details") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-grey-500 mt-4 mb-4", children: (0, jsx_runtime_1.jsx)("i", { children: errorMessage }) }), (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("actions.delete_edit_account"), onClick: handleEdit, primary: true }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-white", children: t("contact_support") })] })), loading && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Loading_1.default, {}), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-white mt-6", children: t("initializing") })] }))] }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-10 -mx-4 relative lg:mt-0 lg:flex lg:items-center", "aria-hidden": "true" })] }));
}
exports.default = TestConnection;
