"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const react_2 = require("react");
const EyeCrossedIcon_1 = __importDefault(require("~/app/icons/EyeCrossedIcon"));
function PasswordViewAdornment({ onChange, isRevealed }) {
    const [_isRevealed, setRevealed] = (0, react_2.useState)(false);
    // toggle the button if password view is handled by component itself
    (0, react_2.useEffect)(() => {
        if (typeof isRevealed !== "undefined") {
            setRevealed(isRevealed);
        }
    }, [isRevealed]);
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", tabIndex: -1, className: "flex justify-center items-center w-10 h-8 text-gray-400 dark:text-neutral-600 hover:text-gray-600 hover:dark:text-neutral-400", onClick: () => {
            setRevealed(!_isRevealed);
            onChange(!_isRevealed);
        }, children: _isRevealed ? ((0, jsx_runtime_1.jsx)(EyeCrossedIcon_1.default, { className: "h-6 w-6" })) : ((0, jsx_runtime_1.jsx)(react_1.PopiconsEyeLine, { className: "h-6 w-6" })) }));
}
exports.default = PasswordViewAdornment;
