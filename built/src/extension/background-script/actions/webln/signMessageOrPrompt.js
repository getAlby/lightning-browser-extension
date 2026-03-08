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
const utils_1 = __importDefault(require("~/common/lib/utils"));
//import db from "../../db";
//import signMessage from "../ln/signMessage";
//import { getHostFromSender } from "~/common/utils/helpers";
const signMessageOrPrompt = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const messageToSign = message.args.message;
    if (typeof messageToSign !== "string") {
        return {
            error: "Message missing.",
        };
    }
    return signWithPrompt(message);
    /*
    const host = getHostFromSender(sender);
    if (!host) return;
  
      const allowance = await db.allowances
          .where("host")
          .equalsIgnoreCase(host)
          .first();
  
  
    // TODO: check allowance.autoSign
      if (allowance && false) {
          return signMessage(message);
      } else {
          return signWithPrompt(message);
      }
      */
});
function signWithPrompt(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield utils_1.default.openPrompt(Object.assign(Object.assign({}, message), { action: "confirmSignMessage" }));
            return response;
        }
        catch (e) {
            console.error("SignMessage cancelled", e);
            if (e instanceof Error) {
                return { error: e.message };
            }
        }
    });
}
exports.default = signMessageOrPrompt;
