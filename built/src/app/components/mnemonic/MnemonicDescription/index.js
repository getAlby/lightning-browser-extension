"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const react_i18next_1 = require("react-i18next");
const FaceSurpriseIcon_1 = __importDefault(require("~/app/icons/FaceSurpriseIcon"));
const NostrIcon_1 = __importDefault(require("~/app/icons/NostrIcon"));
function MnemonicDescription() {
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts.account_view.mnemonic",
    });
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)(ListItem, { icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsKeyLine, {}), title: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "new.items.keys", t: t, components: [
                            //eslint-disable-next-line react/jsx-key
                            (0, jsx_runtime_1.jsx)("span", { className: "font-semibold" }),
                        ] }) }), (0, jsx_runtime_1.jsx)(ListItem, { icon: (0, jsx_runtime_1.jsx)(FaceSurpriseIcon_1.default, {}), title: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "new.items.usage", t: t, components: [
                            // eslint-disable-next-line react/jsx-key
                            (0, jsx_runtime_1.jsx)("span", { className: "font-semibold" }),
                        ] }) }), (0, jsx_runtime_1.jsx)(ListItem, { icon: (0, jsx_runtime_1.jsx)(NostrIcon_1.default, {}), title: t("new.items.nostr_key") })] }) }));
}
exports.default = MnemonicDescription;
function ListItem({ icon, title }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 items-center text-gray-600 dark:text-neutral-400 text-sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: icon }), (0, jsx_runtime_1.jsx)("span", { children: title })] }));
}
