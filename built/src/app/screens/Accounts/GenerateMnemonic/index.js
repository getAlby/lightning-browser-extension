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
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const Button_1 = __importDefault(require("~/app/components/Button"));
const ContentBox_1 = require("~/app/components/ContentBox");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const MnemonicBackupDescription_1 = __importDefault(require("~/app/components/mnemonic/MnemonicBackupDescription"));
const MnemonicInputs_1 = __importDefault(require("~/app/components/mnemonic/MnemonicInputs"));
const api_1 = __importDefault(require("~/common/lib/api"));
function GenerateMnemonic() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { id } = (0, react_router_dom_1.useParams)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts.account_view.mnemonic",
    });
    const [hasConfirmedBackup, setHasConfirmedBackup] = (0, react_1.useState)(false);
    const [hasNostrPrivateKey, setHasNostrPrivateKey] = (0, react_1.useState)(false);
    const [mnemonic, setMnemonic] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const account = yield api_1.default.getAccount(id);
                setHasNostrPrivateKey(account.nostrEnabled);
                if (account.hasMnemonic) {
                    // do not allow user to generate a mnemonic if they already have one for the current account
                    // go to account settings
                    navigate(`/accounts/${id}`);
                }
                const newMnemonic = yield api_1.default.generateMnemonic();
                setMnemonic(newMnemonic);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(`Error: ${e.message}`);
            }
        }))();
    }, [id, navigate]);
    function saveGeneratedSecretKey() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!hasConfirmedBackup) {
                    throw new Error(t("error_confirm"));
                }
                if (!mnemonic) {
                    throw new Error("No mnemonic available");
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
    return !mnemonic ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mt-5", children: (0, jsx_runtime_1.jsx)(Loading_1.default, {}) })) : ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Container_1.default, { maxWidth: "md", children: (0, jsx_runtime_1.jsxs)(ContentBox_1.ContentBox, { children: [(0, jsx_runtime_1.jsx)("h1", { className: "font-bold text-2xl dark:text-white", children: t("generate.title") }), (0, jsx_runtime_1.jsx)(MnemonicBackupDescription_1.default, {}), hasNostrPrivateKey && ((0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", children: t("existing_nostr_key_notice") })), (0, jsx_runtime_1.jsx)(MnemonicInputs_1.default, { mnemonic: mnemonic, readOnly: true, isConfirmed: (hasConfirmedBackup) => {
                            setHasConfirmedBackup(hasConfirmedBackup);
                        } }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("backup.save"), primary: true, onClick: saveGeneratedSecretKey }) })] }) }) }));
}
exports.default = GenerateMnemonic;
