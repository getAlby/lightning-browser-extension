"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Container_1 = __importDefault(require("~/app/components/Container"));
const Header_1 = __importDefault(require("~/app/components/Header"));
const IconButton_1 = __importDefault(require("~/app/components/IconButton"));
const QrcodeScanner_1 = __importDefault(require("~/app/components/QrcodeScanner"));
function ScanQRCode() {
    var _a;
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "scan_qrcode" });
    const navigate = (0, react_router_dom_1.useNavigate)();
    const location = (0, react_router_dom_1.useLocation)();
    const route = (_a = location.state) === null || _a === void 0 ? void 0 : _a.route;
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerRight: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: () => navigate(`/${route}`, { replace: true }), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsXLine, { className: "w-4 h-4" }) }), children: t("title") }), (0, jsx_runtime_1.jsx)(Container_1.default, { maxWidth: "sm", children: (0, jsx_runtime_1.jsx)(QrcodeScanner_1.default, { qrbox: 200, qrCodeSuccessCallback: (decodedText) => {
                        if (decodedText) {
                            navigate(`/${route}`, { state: { decodedQR: decodedText }, replace: true });
                        }
                    }, qrCodeErrorCallback: console.error }) })] }));
}
exports.default = ScanQRCode;
