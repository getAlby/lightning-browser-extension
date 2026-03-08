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
const react_1 = require("react");
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const api_1 = __importDefault(require("~/common/lib/api"));
const AllowanceView_1 = __importDefault(require("./AllowanceView"));
const DefaultView_1 = __importDefault(require("./DefaultView"));
const Home = () => {
    const [allowance, setAllowance] = (0, react_1.useState)(null);
    const [currentUrl, setCurrentUrl] = (0, react_1.useState)(null);
    const [loadingAllowance, setLoadingAllowance] = (0, react_1.useState)(true);
    const [lnData, setLnData] = (0, react_1.useState)([]);
    const [renderDefaultView, setRenderDefaultView] = (0, react_1.useState)(false);
    const loadAllowance = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoadingAllowance(true);
            // typeguard, currentUrl should exist at this point
            if (!currentUrl)
                throw new Error("No established browser connection");
            const result = yield api_1.default.getAllowance(currentUrl.host);
            if (result.enabled) {
                setAllowance(result);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoadingAllowance(false);
        }
    }), [currentUrl]);
    const handleLightningDataMessage = (response) => {
        if (response.action === "lightningData") {
            setLnData(response.args);
        }
    };
    // loadAllowance as soon as currentURL is set
    (0, react_1.useEffect)(() => {
        if (currentUrl) {
            loadAllowance();
        }
    }, [currentUrl, loadAllowance]);
    // Get current URL data on mount
    // and start listeners
    (0, react_1.useEffect)(() => {
        const getCurrentURL = () => __awaiter(void 0, void 0, void 0, function* () {
            const tabs = yield webextension_polyfill_1.default.tabs.query({
                active: true,
                currentWindow: true,
            });
            const currentUrl = tabs.length && tabs[0].url;
            if (currentUrl) {
                const url = new URL(currentUrl);
                setCurrentUrl(url);
                if (currentUrl.startsWith("http")) {
                    webextension_polyfill_1.default.tabs.sendMessage(tabs[0].id, {
                        action: "extractLightningData",
                    });
                }
            }
            else {
                setLoadingAllowance(false);
            }
        });
        getCurrentURL();
        // Enhancement data is loaded asynchronously (for example because we need to fetch additional data).
        webextension_polyfill_1.default.runtime.onMessage.addListener(handleLightningDataMessage);
        return () => {
            webextension_polyfill_1.default.runtime.onMessage.removeListener(handleLightningDataMessage);
        };
    }, []);
    if (loadingAllowance) {
        return null;
    }
    if (allowance && !renderDefaultView) {
        return ((0, jsx_runtime_1.jsx)(AllowanceView_1.default, { allowance: allowance, lnDataFromCurrentTab: lnData, onGoBack: () => setRenderDefaultView(true), onEditComplete: loadAllowance, onDeleteComplete: () => setAllowance(null) }));
    }
    return ((0, jsx_runtime_1.jsx)(DefaultView_1.default, { renderPublisherWidget: !allowance, currentUrl: currentUrl, lnDataFromCurrentTab: lnData }));
};
exports.default = Home;
