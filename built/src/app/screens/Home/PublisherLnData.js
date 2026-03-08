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
exports.PublisherLnData = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = __importDefault(require("@components/Button"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const lnurl_1 = __importDefault(require("~/common/lib/lnurl"));
const typeHelpers_1 = require("~/common/utils/typeHelpers");
const PublisherLnData = ({ lnData }) => {
    const [loadingSendSats, setLoadingSendSats] = (0, react_1.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "home" });
    const sendSatoshis = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoadingSendSats(true);
            const originData = {
                external: true,
                name: lnData.name,
                host: lnData.host,
                description: lnData.description,
                icon: lnData.icon,
            };
            if (lnData.method === "lnurl") {
                const lnurl = lnData.address;
                const lnurlDetails = yield lnurl_1.default.getDetails(lnurl);
                if ((0, typeHelpers_1.isLNURLDetailsError)(lnurlDetails)) {
                    Toast_1.default.error(lnurlDetails.reason);
                    return;
                }
                if (lnurlDetails.tag === "payRequest") {
                    navigate("/lnurlPay", {
                        state: {
                            origin: originData,
                            args: {
                                lnurlDetails,
                            },
                        },
                    });
                }
            }
            else if (lnData.method === "keysend") {
                navigate("/keysend", {
                    state: {
                        origin: originData,
                        args: {
                            destination: lnData.address,
                            customRecords: lnData.customKey && lnData.customValue
                                ? {
                                    [lnData.customKey]: lnData.customValue,
                                }
                                : {},
                        },
                    },
                });
            }
        }
        catch (e) {
            if (e instanceof Error)
                Toast_1.default.error(e.message);
        }
        finally {
            setLoadingSendSats(false);
        }
    });
    return ((0, jsx_runtime_1.jsx)("div", { className: "border-b border-gray-200 dark:border-neutral-700", children: (0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: lnData.name, description: lnData.description, image: lnData.icon, isCard: false, isSmall: false, children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: sendSatoshis, label: t("actions.send_satoshis"), primary: true, loading: loadingSendSats }) }) }));
};
exports.PublisherLnData = PublisherLnData;
