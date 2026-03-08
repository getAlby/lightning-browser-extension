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
const react_1 = require("@testing-library/react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const i18n_1 = __importDefault(require("~/../tests/unit/helpers/i18n"));
const index_1 = __importDefault(require("./index"));
const props = {
    label: "Confirm Test",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
};
describe("ConfirmOrCancel", () => {
    test("render", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.MemoryRouter, { children: (0, jsx_runtime_1.jsx)(react_i18next_1.I18nextProvider, { i18n: i18n_1.default, children: (0, jsx_runtime_1.jsx)(index_1.default, Object.assign({}, props)) }) }));
        expect(yield react_1.screen.getByText("Confirm Test")).toBeInTheDocument();
        expect(yield react_1.screen.getByText("Cancel")).toBeInTheDocument();
    }));
});
