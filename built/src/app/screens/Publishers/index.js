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
const Container_1 = __importDefault(require("@components/Container"));
const Loading_1 = __importDefault(require("@components/Loading"));
const PublishersTable_1 = __importDefault(require("@components/PublishersTable"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Button_1 = __importDefault(require("~/app/components/Button"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function Publishers() {
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "publishers",
    });
    const [allowances, setAllowances] = (0, react_1.useState)([]);
    const [publishersLoading, setPublishersLoading] = (0, react_1.useState)(true);
    const navigate = (0, react_router_dom_1.useNavigate)();
    function navigateToPublisher(id) {
        navigate(`/publishers/${id}`);
    }
    function fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allowanceResponse = yield msg_1.default.request("listAllowances");
                const allowances = allowanceResponse.allowances.filter((a) => a.id && a.enabled);
                setAllowances(allowances);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(`Error: ${e.message}`);
            }
            finally {
                setPublishersLoading(false);
            }
        });
    }
    (0, react_1.useEffect)(() => {
        fetchData();
    }, []);
    return ((0, jsx_runtime_1.jsxs)(Container_1.default, { children: [(0, jsx_runtime_1.jsx)("h2", { className: "mt-12 mb-2 text-2xl font-bold dark:text-white", children: t("title") }), (0, jsx_runtime_1.jsx)("p", { className: "mb-6 text-gray-500 dark:text-neutral-500", children: t("description") }), publishersLoading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mt-12", children: (0, jsx_runtime_1.jsx)(Loading_1.default, {}) })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: allowances.length > 0 ? ((0, jsx_runtime_1.jsx)(PublishersTable_1.default, { allowances: allowances, navigateToPublisher: navigateToPublisher })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("p", { className: "dark:text-white mb-4", children: [" ", t("no_info")] }), (0, jsx_runtime_1.jsx)(Button_1.default, { primary: true, label: t("discover"), onClick: () => window.open(`https://getalby.com/discover`, "_blank") })] })) }))] }));
}
exports.default = Publishers;
