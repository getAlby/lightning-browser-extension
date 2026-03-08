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
const WebbtcEnable_1 = __importDefault(require("~/app/components/Enable/WebbtcEnable"));
const onboard_1 = __importDefault(require("~/app/components/onboard"));
const AccountContext_1 = require("~/app/context/AccountContext");
const api_1 = __importDefault(require("~/common/lib/api"));
function WebbtcEnable(props) {
    const { account } = (0, AccountContext_1.useAccount)();
    const [hasMnemonic, setHasMnemonic] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
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
    }, [props.origin, account]);
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: hasMnemonic ? ((0, jsx_runtime_1.jsx)(WebbtcEnable_1.default, { origin: props.origin })) : ((0, jsx_runtime_1.jsx)(onboard_1.default, {})) }));
}
exports.default = WebbtcEnable;
