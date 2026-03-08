"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const english_1 = require("@scure/bip39/wordlists/english");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const PasswordViewAdornment_1 = __importDefault(require("~/app/components/PasswordViewAdornment"));
const Checkbox_1 = __importDefault(require("~/app/components/form/Checkbox"));
const Input_1 = __importDefault(require("~/app/components/form/Input"));
function MnemonicInputs({ mnemonic, setMnemonic, readOnly, children, isConfirmed, }) {
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts.account_view.mnemonic",
    });
    const [revealedIndex, setRevealedIndex] = (0, react_1.useState)(undefined);
    const [hasConfirmedBackup, setHasConfirmedBackup] = (0, react_1.useState)(false);
    const words = (mnemonic === null || mnemonic === void 0 ? void 0 : mnemonic.split(" ")) || [];
    while (words.length < 12) {
        words.push("");
    }
    while (words.length > 12) {
        words.pop();
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "border border-gray-200 dark:border-neutral-800 rounded-lg p-6 flex flex-col gap-4 items-center justify-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold dark:text-white", children: t("inputs.title") }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 justify-center", children: words.map((word, i) => {
                    const isRevealed = revealedIndex === i;
                    const inputId = `mnemonic-word-${i}`;
                    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center items-center gap-0.5", children: [(0, jsx_runtime_1.jsxs)("span", { className: "w-7 text-gray-600 dark:text-neutral-400", children: [i + 1, "."] }), (0, jsx_runtime_1.jsx)("div", { className: "w-full", children: (0, jsx_runtime_1.jsx)(Input_1.default, { id: inputId, autoFocus: !readOnly && i === 0, onFocus: () => setRevealedIndex(i), onBlur: () => setRevealedIndex(undefined), readOnly: readOnly, block: false, className: "w-full text-center", list: readOnly ? undefined : "wordlist", value: isRevealed ? word : word.length ? "••••" : "", onChange: (e) => {
                                        if (revealedIndex !== i) {
                                            return;
                                        }
                                        words[i] = e.target.value;
                                        setMnemonic === null || setMnemonic === void 0 ? void 0 : setMnemonic(words
                                            .map((word) => word.trim())
                                            .join(" ")
                                            .trim());
                                    }, endAdornment: (0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { isRevealed: isRevealed, onChange: (passwordView) => {
                                            var _a;
                                            if (passwordView) {
                                                (_a = document.getElementById(inputId)) === null || _a === void 0 ? void 0 : _a.focus();
                                            }
                                        } }) }) })] }, i));
                }) }), !readOnly && ((0, jsx_runtime_1.jsx)("datalist", { id: "wordlist", children: english_1.wordlist.map((word) => ((0, jsx_runtime_1.jsx)("option", { value: word }, word))) })), children, isConfirmed && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center mt-4", children: [(0, jsx_runtime_1.jsx)(Checkbox_1.default, { id: "has_backed_up", name: "Backup confirmation checkbox", checked: hasConfirmedBackup, onChange: (event) => {
                            setHasConfirmedBackup(event.target.checked);
                            if (isConfirmed)
                                isConfirmed(event.target.checked);
                        } }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "has_backed_up", className: "cursor-pointer ml-2 block text-sm text-gray-600 dark:text-neutral-400 font-medium", children: t("confirm") })] }))] }));
}
exports.default = MnemonicInputs;
