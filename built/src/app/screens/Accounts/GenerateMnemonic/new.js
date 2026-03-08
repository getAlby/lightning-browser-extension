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
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Button_1 = __importDefault(require("~/app/components/Button"));
const CardButton_1 = __importDefault(require("~/app/components/CardButton"));
const Group_1 = __importDefault(require("~/app/components/CardButton/Group"));
const ContentBox_1 = require("~/app/components/ContentBox");
const MnemonicDescription_1 = __importDefault(require("~/app/components/mnemonic/MnemonicDescription"));
const utils_1 = require("~/app/utils");
const api_1 = __importDefault(require("~/common/lib/api"));
function MnemonicExplanation() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const theme = (0, utils_1.useTheme)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts.account_view.mnemonic.new",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const [selectedCard, setSelectedCard] = (0, react_2.useState)(null);
    const [hasMnemonic, setHasMnemonic] = (0, react_2.useState)(false);
    (0, react_2.useEffect)(() => {
        function fetchAccountInfo() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const fetchedAccount = yield api_1.default.getAccount();
                    if (fetchedAccount.hasMnemonic) {
                        setHasMnemonic(true);
                    }
                    else {
                        setHasMnemonic(false);
                    }
                }
                catch (e) {
                    console.error(e);
                }
            });
        }
        fetchAccountInfo();
    }, []);
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex max-w-3xl mx-auto", children: (0, jsx_runtime_1.jsxs)(ContentBox_1.ContentBox, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)("h1", { className: "font-bold text-2xl dark:text-white", children: t("title") }), (0, jsx_runtime_1.jsx)(MnemonicDescription_1.default, {}), (0, jsx_runtime_1.jsx)("img", { src: `assets/images/master_key_${theme}.png`, alt: "Master Key", className: "max-w-[412px] mx-auto w-full" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-row justify-between gap-x-6", children: (0, jsx_runtime_1.jsxs)(Group_1.default, { children: [(0, jsx_runtime_1.jsx)(CardButton_1.default, { title: hasMnemonic ? t("secure.title") : t("create.title"), description: hasMnemonic ? t("secure.description") : t("create.description"), icon: react_1.PopiconsKeyLine, active: selectedCard === "backup", onClick: () => setSelectedCard("backup") }), (0, jsx_runtime_1.jsx)(CardButton_1.default, { title: t("import.title"), description: t("import.description"), icon: react_1.PopiconsDownloadLine, active: selectedCard === "import", onClick: () => setSelectedCard("import") }), (0, jsx_runtime_1.jsx)(CardButton_1.default, { title: t("import_nostr.title"), description: t("import_nostr.description"), icon: react_1.PopiconsOstrichLine, active: selectedCard === "importNostr", onClick: () => setSelectedCard("importNostr") })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center w-64 mx-auto", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: tCommon("actions.next"), primary: true, flex: true, disabled: !selectedCard, onClick: () => {
                            if (selectedCard === "backup") {
                                hasMnemonic
                                    ? navigate("../secret-key/backup")
                                    : navigate("../secret-key/generate");
                            }
                            else if (selectedCard === "import") {
                                navigate("../secret-key/import");
                            }
                            else if (selectedCard === "importNostr") {
                                navigate("../nostr/settings");
                            }
                        } }) })] }) }));
}
exports.default = MnemonicExplanation;
