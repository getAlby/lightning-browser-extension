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
const Header_1 = __importDefault(require("@components/Header"));
const IconButton_1 = __importDefault(require("@components/IconButton"));
const Progressbar_1 = __importDefault(require("@components/Progressbar"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const SitePreferences_1 = __importDefault(require("@components/SitePreferences"));
const TransactionsTable_1 = __importDefault(require("@components/TransactionsTable"));
const react_1 = require("@popicons/react");
const dayjs_1 = __importDefault(require("dayjs"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const PublisherLnData_1 = require("~/app/screens/Home/PublisherLnData");
const payments_1 = require("~/app/utils/payments");
dayjs_1.default.extend(relativeTime_1.default);
const AllowanceView = (props) => {
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, getFormattedNumber, } = (0, SettingsContext_1.useSettings)();
    const [transactions, setTransactions] = (0, react_2.useState)(null);
    const [isLoadingTransactions, setIsLoadingTransactions] = (0, react_2.useState)(true);
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "home" });
    const showFiat = !isLoadingSettings && settings.showFiat;
    // get array of payments if not done yet
    (0, react_2.useEffect)(() => {
        const getTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
            const transactions = yield (0, payments_1.convertPaymentsToTransactions)(props.allowance.payments, `options.html#/publishers/${props.allowance.id}`);
            try {
                // attach fiatAmount if enabled
                for (const transaction of transactions) {
                    transaction.totalAmountFiat = showFiat
                        ? yield getFormattedFiat(transaction.totalAmount)
                        : "";
                }
                setTransactions(transactions);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(e.message);
            }
            finally {
                setIsLoadingTransactions(false);
            }
        });
        !transactions && !isLoadingSettings && getTransactions();
    }, [
        props.allowance,
        isLoadingSettings,
        transactions,
        getFormattedFiat,
        showFiat,
    ]);
    const hasBudget = +props.allowance.totalBudget > 0;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "overflow-y-auto no-scrollbar h-full", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: props.onGoBack, icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: props.allowance.host }), props.allowance ? ((0, jsx_runtime_1.jsxs)("div", { className: "relative mx-4", children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: props.allowance.name, image: props.allowance.imageURL, isCard: true, isSmall: false }), (0, jsx_runtime_1.jsx)("div", { className: "absolute top-1.5 right-1.5", children: (0, jsx_runtime_1.jsx)(SitePreferences_1.default, { launcherType: "icon", allowance: props.allowance, onEdit: props.onEditComplete, onDelete: props.onDeleteComplete }) })] })) : (props.lnDataFromCurrentTab && ((0, jsx_runtime_1.jsx)(PublisherLnData_1.PublisherLnData, { lnData: props.lnDataFromCurrentTab[0] }))), (0, jsx_runtime_1.jsxs)("div", { className: "px-4 pb-5", children: [hasBudget ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col py-4", children: [(0, jsx_runtime_1.jsxs)("dl", { className: "mb-1 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("dt", { className: "text-black font-medium dark:text-neutral-400", children: t("allowance_view.budget_spent") }), (0, jsx_runtime_1.jsxs)("dd", { className: "text-sm text-gray-600", children: [hasBudget
                                                ? `${getFormattedNumber(props.allowance.usedBudget)} / ${getFormattedNumber(props.allowance.totalBudget)} `
                                                : "0 / 0 ", t("allowance_view.sats")] })] }), (0, jsx_runtime_1.jsx)(Progressbar_1.default, { percentage: props.allowance.percentage })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "my-6 text-center text-sm", children: (0, jsx_runtime_1.jsx)(SitePreferences_1.default, { launcherType: "hyperlink", allowance: props.allowance, onEdit: props.onEditComplete, onDelete: props.onDeleteComplete }) })), (0, jsx_runtime_1.jsx)(TransactionsTable_1.default, { loading: isLoadingTransactions, transactions: transactions })] })] }));
};
exports.default = AllowanceView;
