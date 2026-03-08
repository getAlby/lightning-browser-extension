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
const state_1 = __importDefault(require("~/extension/background-script/state"));
const fetchAssetRegistry = ({ args: { psetPreview }, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const liquid = yield state_1.default.getState().getLiquid();
        const registry = yield liquid.fetchAssetRegistry(psetPreview);
        return {
            data: registry,
        };
    }
    catch (e) {
        console.error(e);
        return {
            error: "fetchAssetRegistry failed: " + e,
        };
    }
});
exports.default = fetchAssetRegistry;
