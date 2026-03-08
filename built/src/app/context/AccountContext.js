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
exports.useAccount = exports.AccountProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
const AccountContext = (0, react_1.createContext)({});
function AccountProvider({ children }) {
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, getFormattedInCurrency, } = (0, SettingsContext_1.useSettings)();
    const [account, setAccount] = (0, react_1.useState)(null);
    const [statusLoading, setStatusLoading] = (0, react_1.useState)(true);
    const [accountLoading, setAccountLoading] = (0, react_1.useState)(true);
    const [accountBalance, setAccountBalance] = (0, react_1.useState)("");
    const [fiatBalance, setFiatBalance] = (0, react_1.useState)("");
    const isSatsAccount = (account === null || account === void 0 ? void 0 : account.currency) === "BTC"; // show fiatValue only if the base currency is not already fiat
    const showFiat = !isLoadingSettings && settings.showFiat && isSatsAccount;
    const unlock = (password, callback) => {
        return api_1.default.unlock(password).then((response) => {
            selectAccount(response.currentAccountId, true);
            // callback - e.g. navigate to the requested route after unlocking
            callback();
        });
    };
    const lock = (callback) => {
        return msg_1.default.request("lock").then(() => {
            setAccount(null);
            callback();
        });
    };
    const setAccountId = (id) => setAccount({ id });
    const updateFiatValue = (0, react_1.useCallback)((balance) => __awaiter(this, void 0, void 0, function* () {
        const fiat = yield getFormattedFiat(balance);
        setFiatBalance(fiat);
    }), [getFormattedFiat]);
    const updateAccountBalance = (amount, currency) => {
        const balance = getFormattedInCurrency(amount, currency);
        setAccountBalance(balance);
    };
    const fetchAccountInfo = (options) => __awaiter(this, void 0, void 0, function* () {
        const id = (options === null || options === void 0 ? void 0 : options.accountId) || (account === null || account === void 0 ? void 0 : account.id);
        if (!id)
            return;
        const callback = (accountRes) => {
            setAccount(accountRes);
            updateAccountBalance(accountRes.balance, accountRes.currency);
        };
        const accountInfo = yield api_1.default.swr.getAccountInfo(id, callback);
        return Object.assign(Object.assign({}, accountInfo), { fiatBalance, accountBalance });
    });
    const selectAccount = (accountId, skipRequestSelectAccount = false) => __awaiter(this, void 0, void 0, function* () {
        setAccountLoading(true);
        try {
            if (!skipRequestSelectAccount) {
                yield msg_1.default.request("selectAccount", { id: accountId });
            }
            setAccountId(accountId);
            yield fetchAccountInfo({ accountId });
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error)
                Toast_1.default.error(`Error: ${e.message}`);
        }
        finally {
            setAccountLoading(false);
        }
    });
    // Invoked only on on mount.
    (0, react_1.useEffect)(() => {
        api_1.default
            .getStatus()
            .then((response) => {
            const onWelcomePage = window.location.pathname.indexOf("welcome.html") >= 0;
            if (!response.configured && !onWelcomePage) {
                utils_1.default.openPage("welcome.html");
                window.close();
            }
            else if (response.configured && onWelcomePage) {
                utils_1.default.redirectPage("options.html");
            }
            else if (response.unlocked) {
                selectAccount(response.currentAccountId, true);
            }
            else {
                setAccount(null);
            }
        })
            .catch((e) => {
            Toast_1.default.error(`An unexpected error occurred (${e.message})`);
            console.error(`AccountContext: An unexpected error occurred (${e.message})`);
        })
            .finally(() => {
            setStatusLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Listen to showFiat
    (0, react_1.useEffect)(() => {
        if (showFiat && typeof (account === null || account === void 0 ? void 0 : account.balance) === "number") {
            updateFiatValue(account.balance);
        }
        else {
            setFiatBalance("");
        }
    }, [showFiat, account === null || account === void 0 ? void 0 : account.balance, updateFiatValue]);
    // Listen to language change
    (0, react_1.useEffect)(() => {
        !!(account === null || account === void 0 ? void 0 : account.balance) &&
            updateAccountBalance(account.balance, account.currency);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.locale]);
    const value = {
        account,
        balancesDecorated: {
            accountBalance,
            fiatBalance,
        },
        fetchAccountInfo,
        statusLoading,
        accountLoading,
        lock,
        selectAccount,
        setAccountId,
        unlock,
    };
    return ((0, jsx_runtime_1.jsx)(AccountContext.Provider, { value: value, children: children }));
}
exports.AccountProvider = AccountProvider;
function useAccount() {
    return (0, react_1.useContext)(AccountContext);
}
exports.useAccount = useAccount;
