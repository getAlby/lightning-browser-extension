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
const PublisherPanel_1 = __importDefault(require("@components/PublisherPanel"));
const TransactionsTable_1 = __importDefault(require("@components/TransactionsTable"));
const dayjs_1 = __importDefault(require("dayjs"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const payments_1 = require("~/app/utils/payments");
const msg_1 = __importDefault(require("~/common/lib/msg"));
dayjs_1.default.extend(relativeTime_1.default);
function PublisherDetail() {
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, } = (0, SettingsContext_1.useSettings)();
    const hasFetchedData = (0, react_1.useRef)(false);
    const [allowance, setAllowance] = (0, react_1.useState)();
    const [transactions, setTransactions] = (0, react_1.useState)();
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const fetchData = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        try {
            if (id) {
                const response = yield msg_1.default.request("getAllowanceById", {
                    id: parseInt(id),
                });
                setAllowance(response);
                const _transactions = (0, payments_1.convertPaymentsToTransactions)(response.payments);
                for (const payment of _transactions) {
                    if (payment.displayAmount &&
                        payment.displayAmount[1] === settings.currency)
                        continue;
                    payment.totalAmountFiat = settings.showFiat
                        ? yield getFormattedFiat(payment.totalAmount)
                        : "";
                }
                setTransactions(_transactions);
            }
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error)
                Toast_1.default.error(`Error: ${e.message}`);
        }
    }), [id, settings.showFiat, getFormattedFiat, settings.currency]);
    (0, react_1.useEffect)(() => {
        // Run once.
        if (!isLoadingSettings && !hasFetchedData.current) {
            fetchData();
            hasFetchedData.current = true;
        }
    }, [fetchData, isLoadingSettings]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [allowance && ((0, jsx_runtime_1.jsx)(PublisherPanel_1.default, { allowance: allowance, onEdit: fetchData, onDelete: () => {
                    navigate("/publishers", { replace: true });
                }, title: (allowance === null || allowance === void 0 ? void 0 : allowance.name) || "", image: (allowance === null || allowance === void 0 ? void 0 : allowance.imageURL) || "", url: allowance === null || allowance === void 0 ? void 0 : allowance.host, isCard: false, isSmall: false })), allowance && ((0, jsx_runtime_1.jsx)(Container_1.default, { children: (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(TransactionsTable_1.default, { transactions: transactions }) }) }))] }));
}
exports.default = PublisherDetail;
