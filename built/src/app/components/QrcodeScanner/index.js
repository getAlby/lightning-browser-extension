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
const html5_qrcode_1 = require("html5-qrcode");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const Button_1 = __importDefault(require("../Button"));
function QrcodeScanner({ fps = 10, qrbox = 250, qrCodeSuccessCallback, qrCodeErrorCallback, }) {
    const [isScanning, setScanning] = (0, react_2.useState)(false);
    const [cameras, setCameras] = (0, react_2.useState)([]);
    const [selectedCamera, setSelectedCamera] = (0, react_2.useState)("");
    const html5QrCodeRef = (0, react_2.useRef)();
    const { t } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "qrcode_scanner",
    });
    (0, react_2.useEffect)(() => {
        return () => {
            handleStopScanning(false);
        };
    }, []);
    function handleRequestCameraPermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const devices = yield html5_qrcode_1.Html5Qrcode.getCameras(); // Request camera permissions.
                if (devices && devices.length) {
                    setCameras(devices);
                    html5QrCodeRef.current = new html5_qrcode_1.Html5Qrcode("reader", false);
                    handleStartScanning(devices[0].id);
                }
            }
            catch (error) {
                Toast_1.default.error(t("errors.allow_camera_access"));
            }
        });
    }
    function handleStartScanning(id) {
        return __awaiter(this, void 0, void 0, function* () {
            setScanning(true);
            setSelectedCamera(id);
            try {
                if (html5QrCodeRef.current) {
                    // Stop if there's already a scanner active.
                    try {
                        const scannerState = html5QrCodeRef.current.getState();
                        if ([
                            html5_qrcode_1.Html5QrcodeScannerState.PAUSED,
                            html5_qrcode_1.Html5QrcodeScannerState.SCANNING,
                        ].includes(scannerState)) {
                            yield html5QrCodeRef.current.stop();
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                    html5QrCodeRef.current
                        .start(id, {
                        fps,
                        qrbox,
                    }, (decodedText) => {
                        handleStopScanning();
                        qrCodeSuccessCallback && qrCodeSuccessCallback(decodedText);
                    }, (errorMessage) => {
                        qrCodeErrorCallback && qrCodeErrorCallback(errorMessage);
                    })
                        .catch(() => {
                        // Start failed.
                    });
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    function handleStopScanning(isMounted = true) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (html5QrCodeRef.current) {
                    const scannerState = html5QrCodeRef.current.getState();
                    if ([
                        html5_qrcode_1.Html5QrcodeScannerState.PAUSED,
                        html5_qrcode_1.Html5QrcodeScannerState.SCANNING,
                    ].includes(scannerState)) {
                        yield html5QrCodeRef.current.stop();
                    }
                    html5QrCodeRef.current.clear();
                    if (isMounted)
                        setScanning(false);
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mt-5 shadow-sm bg-white rounded-md flex flex-col items-center dark:bg-surface-02dp p-3", children: [!isScanning && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center text-center items-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-lg font-bold mb-2 dark:text-white", children: t("title") }), (0, jsx_runtime_1.jsx)(Button_1.default, { primary: true, label: t("actions.start_scanning"), onClick: handleRequestCameraPermissions })] }), (0, jsx_runtime_1.jsx)(react_1.PopiconsQrCodeMinimalLine, { className: "h-28 w-28 ml-4 -mr-8 text-blue-600" })] }) })), (0, jsx_runtime_1.jsx)("div", { className: "bg-black w-full", id: "reader" }), isScanning && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-6 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-4", children: (0, jsx_runtime_1.jsx)("select", { className: "w-72 border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50", name: "cameras", id: "cameras", value: selectedCamera, onChange: (e) => handleStartScanning(e.target.value), children: cameras.map((camera) => ((0, jsx_runtime_1.jsx)("option", { value: camera.id, children: camera.label }, camera.id))) }) }), (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("actions.stop_scanning"), onClick: () => handleStopScanning() })] }))] }));
}
exports.default = QrcodeScanner;
