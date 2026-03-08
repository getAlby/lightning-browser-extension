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
const state_1 = __importDefault(require("../../state"));
const set = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const { settings } = state_1.default.getState();
    const { setting } = message.args;
    if (typeof setting === "object") {
        const newSettings = Object.assign(Object.assign({}, settings), setting);
        state_1.default.setState({
            settings: newSettings,
        });
        // make sure we immediately persist the new settings
        yield state_1.default.getState().saveToStorage();
        return Promise.resolve({ data: newSettings });
    }
    else {
        return Promise.reject(new Error("Incorrect setting"));
    }
});
exports.default = set;
