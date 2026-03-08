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
const Button_1 = __importDefault(require("~/app/components/Button"));
const ContentBox_1 = require("~/app/components/ContentBox");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const MnemonicBackupDescription_1 = __importDefault(require("~/app/components/mnemonic/MnemonicBackupDescription"));
const MnemonicInputs_1 = __importDefault(require("~/app/components/mnemonic/MnemonicInputs"));
const api_1 = __importDefault(require("~/common/lib/api"));
function BackupMnemonic() {
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts.account_view.mnemonic",
    });
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [mnemonic, setMnemonic] = (0, react_1.useState)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [hasConfirmedBackup, setHasConfirmedBackup] = (0, react_1.useState)(false);
    const { id } = (0, react_router_dom_1.useParams)();
    const fetchData = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        try {
            setLoading(true);
            const accountMnemonic = yield api_1.default.getMnemonic(id);
            setMnemonic(accountMnemonic);
            setLoading(false);
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error)
                Toast_1.default.error(`Error: ${e.message}`);
        }
    }), [id]);
    (0, react_1.useEffect)(() => {
        fetchData();
    }, [fetchData]);
    function completeBackupProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!hasConfirmedBackup) {
                Toast_1.default.error(t("error_confirm"));
                return false;
            }
            yield api_1.default.editAccount(id, {
                isMnemonicBackupDone: true,
            });
            navigate(`/accounts/${id}`);
        });
    }
    return loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mt-5", children: (0, jsx_runtime_1.jsx)(Loading_1.default, {}) })) : ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Container_1.default, { maxWidth: "md", children: (0, jsx_runtime_1.jsxs)(ContentBox_1.ContentBox, { children: [(0, jsx_runtime_1.jsx)("h1", { className: "font-bold text-2xl dark:text-white", children: t("backup.title") }), (0, jsx_runtime_1.jsx)(MnemonicBackupDescription_1.default, {}), (0, jsx_runtime_1.jsx)(MnemonicInputs_1.default, { mnemonic: mnemonic, readOnly: true, isConfirmed: (hasConfirmedBackup) => {
                            setHasConfirmedBackup(hasConfirmedBackup);
                        } }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center w-64 mx-auto", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: tCommon("actions.finish"), primary: true, flex: true, onClick: completeBackupProcess }) })] }) }) }));
}
exports.default = BackupMnemonic;
