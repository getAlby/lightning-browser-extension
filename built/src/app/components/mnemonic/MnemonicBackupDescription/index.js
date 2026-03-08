"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const react_i18next_1 = require("react-i18next");
const utils_1 = require("~/app/utils");
function MnemonicInstructions() {
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts.account_view.mnemonic",
    });
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)(ListItem, { icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsLifebuoyLine, {}), title: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "description.recovery_phrase", t: t, components: [
                            // eslint-disable-next-line react/jsx-key
                            (0, jsx_runtime_1.jsx)("b", {}),
                        ] }), type: "info" }), (0, jsx_runtime_1.jsx)(ListItem, { icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsShieldLine, {}), title: t("description.secure_recovery_phrase"), type: "info" }), (0, jsx_runtime_1.jsx)(ListItem, { icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsTriangleExclamationLine, {}), title: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "description.warning", t: t, components: [
                            // eslint-disable-next-line react/jsx-key
                            (0, jsx_runtime_1.jsx)("b", {}),
                        ] }), type: "warn" })] }) }));
}
exports.default = MnemonicInstructions;
function ListItem({ icon, title, type }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.classNames)(type == "warn" && "text-orange-700 dark:text-orange-300", type == "info" && "text-gray-600 dark:text-neutral-400", "flex gap-2 items-center text-sm"), children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: icon }), (0, jsx_runtime_1.jsx)("span", { children: title })] }));
}
