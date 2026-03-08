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
const db_1 = __importDefault(require("~/extension/background-script/db"));
const all_1 = __importDefault(require("../all"));
const mockPayments = [
    {
        accountId: "12345",
        allowanceId: "3",
        createdAt: "123456",
        description: "A blue bird?!",
        destination: "Space",
        host: "getalby.com",
        id: 4,
        location: "https://www.getalby.com",
        name: "Alby",
        paymentHash: "123",
        paymentRequest: "123",
        preimage: "123",
        totalAmount: 1000,
        totalFees: 111,
    },
    {
        accountId: "12345",
        allowanceId: "3",
        createdAt: "123456",
        description: "A yellow bird?!",
        destination: "Space",
        host: "getalby.com",
        id: 5,
        location: "https://www.getalby.com",
        name: "Alby",
        paymentHash: "123",
        paymentRequest: "123",
        preimage: "123",
        totalAmount: "2000",
        totalFees: 222,
    },
];
describe("payment all", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("get all payments", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            origin: { internal: true },
            prompt: true,
            action: "getPayments",
        };
        yield db_1.default.payments.bulkAdd(mockPayments);
        expect(yield (0, all_1.default)(message)).toStrictEqual({
            data: {
                payments: [...mockPayments.reverse()],
            },
        });
    }));
});
