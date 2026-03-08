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
const utils_1 = require("~/app/utils");
const constants_1 = require("~/common/constants");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const types_1 = require("~/types");
function NostrEnableComponent(props) {
    const [loading, setLoading] = (0, react_2.useState)(false);
    const [selectedPreset, setSelectedPreset] = (0, react_2.useState)(types_1.NostrPermissionPreset.REASONABLE);
    const hasHttp = props.origin.domain.startsWith("http://");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "nostr_enable",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const enable = () => {
        try {
            setLoading(true);
            msg_1.default.reply({
                enabled: true,
                remember: true,
                preset: selectedPreset,
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: props.origin.name, image: props.origin.icon, url: props.origin.host }), hasHttp && ((0, jsx_runtime_1.jsx)("div", { className: "pt-3 text-sm", children: (0, jsx_runtime_1.jsx)(Alert_1.default, { type: "warn", children: tCommon("enable.insecure_domain_warn") }) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2 dark:text-white my-5", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-base font-medium", children: t("description") }), (0, jsx_runtime_1.jsx)(PermissionPreset, { title: t("presets.trust_fully.title"), description: t("presets.trust_fully.description"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsHeartLine, { className: "w-6 h-6" }), onClick: () => setSelectedPreset(types_1.NostrPermissionPreset.TRUST_FULLY), isSelected: selectedPreset === types_1.NostrPermissionPreset.TRUST_FULLY }), (0, jsx_runtime_1.jsx)(PermissionPreset, { title: t("presets.reasonable.title"), description: t("presets.reasonable.description"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsLikeLine, { className: "w-6 h-6" }), onClick: () => setSelectedPreset(types_1.NostrPermissionPreset.REASONABLE), isSelected: selectedPreset === types_1.NostrPermissionPreset.REASONABLE }), (0, jsx_runtime_1.jsx)(PermissionPreset, { title: t("presets.paranoid.title"), description: t("presets.paranoid.description"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsGlassesSolid, { className: "w-6 h-6" }), onClick: () => setSelectedPreset(types_1.NostrPermissionPreset.PARANOID), isSelected: selectedPreset === types_1.NostrPermissionPreset.PARANOID })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col", children: [(0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, label: tCommon("actions.connect"), onConfirm: enable, onCancel: reject }), (0, jsx_runtime_1.jsx)("a", { className: "mt-4 underline text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap", href: "#", onClick: block, children: tCommon("enable.block_and_ignore", { host: props.origin.host }) })] })] })] }));
}
function PermissionPreset({ icon, title, description, onClick, isSelected, }) {
    return ((0, jsx_runtime_1.jsxs)("button", { className: (0, utils_1.classNames)("text-left border border-gray-200 dark:border-neutral-800 rounded-xl p-4  text-gray-800 dark:text-neutral-200 cursor-pointer flex flex-row items-center gap-3", isSelected
            ? "bg-amber-50 dark:bg-surface-02dp ring-primary border-primary dark:border-primary ring-1"
            : "bg-white dark:bg-surface-01dp hover:bg-gray-50 dark:hover:bg-surface-02dp"), onClick: onClick, children: [(0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.classNames)("flex-shrink-0 flex justify-center md:px-3", isSelected ? "text-amber-400" : "text-gray-400 dark:text-neutral-600"), children: icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-grow space-y-0.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium leading-5 text-sm md:text-base", children: title }), (0, jsx_runtime_1.jsx)("div", { className: "text-gray-600 dark:text-neutral-400 text-xs leading-4 md:text-sm", children: description })] }), (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.classNames)("flex-shrink-0 flex justify-end text-gray-400 dark:text-neutral-600", isSelected ? "" : "hidden"), children: (0, jsx_runtime_1.jsx)(react_1.PopiconsCheckLine, { className: "w-5" }) })] }));
}
exports.default = NostrEnableComponent;
