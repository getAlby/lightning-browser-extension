"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const bip39 = __importStar(require("@scure/bip39"));
const english_1 = require("@scure/bip39/wordlists/english");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const Button_1 = __importDefault(require("~/app/components/Button"));
const ContentBox_1 = require("~/app/components/ContentBox");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const MnemonicInputs_1 = __importDefault(require("~/app/components/mnemonic/MnemonicInputs"));
const CircleInfoLine_1 = __importDefault(require("~/app/icons/popicons/CircleInfoLine"));
const api_1 = __importDefault(require("~/common/lib/api"));
function ImportMnemonic() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts.account_view.mnemonic",
    });
    const [mnemonic, setMnemonic] = (0, react_1.useState)("");
    const [hasFetchedData, setHasFetchedData] = (0, react_1.useState)(false);
    const [hasNostrPrivateKey, setHasNostrPrivateKey] = (0, react_1.useState)(false);
    const { id } = (0, react_router_dom_1.useParams)();
    (0, react_1.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const account = yield api_1.default.getAccount(id);
                if (account.hasMnemonic) {
                    // do not allow user to import a mnemonic if they already have one for the current account
                    // go to account settings
                    navigate(`/accounts/${id}`);
                }
                setHasNostrPrivateKey(account.nostrEnabled);
                setHasFetchedData(true);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(`Error: ${e.message}`);
            }
        }))();
    }, [id, navigate]);
    function importKey() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mnemonic.split(" ").length !== 12 ||
                    !bip39.validateMnemonic(mnemonic, english_1.wordlist)) {
                    throw new Error("Invalid mnemonic");
                }
                yield api_1.default.setMnemonic(id, mnemonic);
                yield api_1.default.editAccount(id, {
                    useMnemonicForLnurlAuth: true,
                    isMnemonicBackupDone: true,
                });
                Toast_1.default.success(t("saved"));
                // go to account settings
                navigate(`/accounts/${id}`);
            }
            catch (e) {
                if (e instanceof Error)
                    Toast_1.default.error(e.message);
            }
        });
    }
    return !hasFetchedData ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mt-5", children: (0, jsx_runtime_1.jsx)(Loading_1.default, {}) })) : ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Container_1.default, { maxWidth: "md", children: (0, jsx_runtime_1.jsx)(ContentBox_1.ContentBox, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)("h1", { className: "font-bold text-2xl dark:text-white", children: t("import.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-neutral-400", children: t("import.description") })] }), hasNostrPrivateKey && ((0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(CircleInfoLine_1.default, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: t("existing_nostr_key_notice") })] }) })), (0, jsx_runtime_1.jsx)(MnemonicInputs_1.default, { mnemonic: mnemonic, setMnemonic: setMnemonic }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("import.button"), primary: true, onClick: importKey }) })] }) }) }) }));
}
exports.default = ImportMnemonic;
