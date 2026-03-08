"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
function QrcodeAdornment({ route }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "qrcode_scanner",
    });
    return ((0, jsx_runtime_1.jsx)("button", { "aria-label": t("title"), type: "button", className: "flex justify-center items-center p-2", onClick: () => {
            navigate("/scanQRCode", { state: { route: route }, replace: true });
        }, children: (0, jsx_runtime_1.jsx)(react_1.PopiconsQrCodeMinimalLine, { className: "h-5 w-5 text-blue-600" }) }));
}
exports.default = QrcodeAdornment;
