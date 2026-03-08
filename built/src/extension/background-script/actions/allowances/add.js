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
const db_1 = __importDefault(require("../../db"));
const add = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const host = message.args.host;
    const name = message.args.name;
    const imageURL = message.args.imageURL;
    const totalBudget = message.args.totalBudget;
    const allowance = yield db_1.default.allowances
        .where("host")
        .equalsIgnoreCase(host)
        .first();
    if (allowance) {
        if (!allowance.id)
            return { error: "id is missing" };
        yield db_1.default.allowances.update(allowance.id, {
            enabled: true,
            imageURL: imageURL,
            name: name,
            remainingBudget: totalBudget,
            totalBudget: totalBudget,
        });
    }
    else {
        const dbAllowance = {
            createdAt: Date.now().toString(),
            enabled: true,
            host: host,
            imageURL: imageURL,
            lastPaymentAt: 0,
            lnurlAuth: false,
            name: name,
            remainingBudget: totalBudget,
            tag: "",
            totalBudget: totalBudget,
        };
        yield db_1.default.allowances.add(dbAllowance);
    }
    yield db_1.default.saveToStorage();
    return { data: { allowance } };
});
exports.default = add;
