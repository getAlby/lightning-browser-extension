"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isManifestV3 = void 0;
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
exports.isManifestV3 = webextension_polyfill_1.default.runtime.getManifest().manifest_version === 3;
