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
exports.useSettings = exports.SettingsProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const dayjs_1 = __importDefault(require("dayjs"));
const i18next_1 = __importDefault(require("i18next"));
const react_1 = require("react");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const utils_1 = require("~/app/utils");
const api_1 = __importDefault(require("~/common/lib/api"));
const settings_1 = require("~/common/settings");
const currencyConvert_1 = require("~/common/utils/currencyConvert");
const SettingsContext = (0, react_1.createContext)({});
const SettingsProvider = ({ children, }) => {
    const [settings, setSettings] = (0, react_1.useState)(settings_1.DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // store latest currency and currency rate in ref to prevent a re-render
    const currencyRate = (0, react_1.useRef)(null);
    // call this to trigger a re-render on all occassions
    const updateSetting = (setting) => __awaiter(void 0, void 0, void 0, function* () {
        setSettings((prevState) => (Object.assign(Object.assign({}, prevState), setting)));
        yield api_1.default.setSetting(setting); // updates browser storage as well
    });
    // Invoked only on on mount.
    (0, react_1.useEffect)(() => {
        api_1.default
            .getSettings()
            .then((settings) => {
            setSettings(settings);
        })
            .catch((e) => {
            Toast_1.default.error(`An unexpected error occurred (${e.message})`);
            console.error(`SettingsProvider: An unexpected error occurred (${e.message})`);
        })
            .finally(() => {
            setIsLoading(false);
        });
    }, []);
    const getCurrencyRate = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // ensure to get the correct rate for current currency in state
        if (settings.currency !== ((_a = currencyRate.current) === null || _a === void 0 ? void 0 : _a.currency)) {
            const response = yield api_1.default.getCurrencyRate(); // gets rate from browser.storage or API
            // update local ref
            const rate = typeof response === "number" ? response : response.rate;
            currencyRate.current = {
                rate,
                currency: settings.currency,
            };
        }
        return currencyRate.current.rate;
    }), [settings.currency]);
    const getFormattedFiat = (0, react_1.useCallback)((amount) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rate = yield getCurrencyRate();
            const value = (0, currencyConvert_1.getFormattedFiat)({
                amount,
                rate,
                currency: settings.currency,
                locale: settings.locale,
            });
            return value;
        }
        catch (e) {
            console.error(e);
            return "??"; // show the user that something went wrong
        }
    }), [getCurrencyRate, settings.currency, settings.locale]);
    const getFormattedSats = (0, react_1.useCallback)((amount) => {
        return (0, currencyConvert_1.getFormattedSats)({ amount, locale: settings.locale });
    }, [settings.locale]);
    const getFormattedNumber = (0, react_1.useCallback)((amount) => {
        return (0, currencyConvert_1.getFormattedNumber)({ amount, locale: settings.locale });
    }, [settings.locale]);
    const getFormattedInCurrency = (0, react_1.useCallback)((amount, currency = "BTC") => {
        if (currency === "BTC") {
            return getFormattedSats(amount);
        }
        return (0, currencyConvert_1.getFormattedCurrency)({
            amount,
            locale: settings.locale,
            currency,
        });
    }, [getFormattedSats, settings.locale]);
    // update locale on every change
    (0, react_1.useEffect)(() => {
        i18next_1.default.changeLanguage(settings.locale);
        // need to switch i.e. `pt_BR` to `pt-br`
        const daysjsLocaleFormatted = settings.locale
            .toLowerCase()
            .replace("_", "-");
        dayjs_1.default.locale(daysjsLocaleFormatted);
    }, [settings.locale]);
    // update theme on every change
    (0, react_1.useEffect)(() => {
        (0, utils_1.setTheme)(); // Get the active theme and apply corresponding Tailwind classes to the document
    }, [settings.theme]);
    const value = (0, react_1.useMemo)(() => ({
        getCurrencyRate,
        getFormattedFiat,
        getFormattedSats,
        getFormattedNumber,
        getFormattedInCurrency,
        settings,
        updateSetting,
        isLoading,
    }), [
        getCurrencyRate,
        getFormattedFiat,
        getFormattedSats,
        getFormattedNumber,
        getFormattedInCurrency,
        settings,
        isLoading,
    ]);
    return ((0, jsx_runtime_1.jsx)(SettingsContext.Provider, { value: value, children: children }));
};
exports.SettingsProvider = SettingsProvider;
const useSettings = () => (0, react_1.useContext)(SettingsContext);
exports.useSettings = useSettings;
