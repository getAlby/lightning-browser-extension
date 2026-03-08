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
const ConfirmOrCancel_1 = __importDefault(require("@components/ConfirmOrCancel"));
const Container_1 = __importDefault(require("@components/Container"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const constants_1 = require("~/common/constants");
const msg_1 = __importDefault(require("~/common/lib/msg"));
function LiquidEnableComponent(props) {
    const [loading, setLoading] = (0, react_2.useState)(false);
    const hasHttp = props.origin.domain.startsWith("http://");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "liquid_enable",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const enable = () => {
        try {
            setLoading(true);
            msg_1.default.reply({
                enabled: true,
                remember: true,
            });
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error)
                Toast_1.default.error(`${tCommon("error")}: ${e.message}`);
        }
        finally {
            setLoading(false);
        }
    };
    function reject(event) {
        event.preventDefault();
        msg_1.default.error(constants_1.USER_REJECTED_ERROR);
    }
    function block(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            yield msg_1.default.request("addBlocklist", {
                domain: props.origin.domain,
                host: props.origin.host,
            });
            alert(tCommon("enable.block_added", { host: props.origin.host }));
            msg_1.default.error(constants_1.USER_REJECTED_ERROR);
        });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: props.origin.name, image: props.origin.icon, url: props.origin.host, isSmall: false }), (0, jsx_runtime_1.jsx)("div", { className: "pt-3", children: hasHttp && ((0, jsx_runtime_1.jsx)(Alert_1.default, { type: "warn", children: tCommon("enable.insecure_domain_warn") })) }), (0, jsx_runtime_1.jsxs)("div", { className: "dark:text-white pt-6", children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-2", children: tCommon("enable.allow") }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-2 flex items-center", children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsCheckLine, { className: "w-5 h-5 mr-2" }), (0, jsx_runtime_1.jsx)("p", { className: "dark:text-white", children: tCommon("enable.request1") })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-2 flex items-center", children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsCheckLine, { className: "w-5 h-5 mr-2" }), (0, jsx_runtime_1.jsx)("p", { className: "dark:text-white", children: t("request2") })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col", children: [(0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, label: tCommon("actions.connect"), onConfirm: enable, onCancel: reject }), (0, jsx_runtime_1.jsx)("a", { className: "mt-4 underline text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap", href: "#", onClick: block, children: tCommon("enable.block_and_ignore", { host: props.origin.host }) })] })] })] }));
}
exports.default = LiquidEnableComponent;
