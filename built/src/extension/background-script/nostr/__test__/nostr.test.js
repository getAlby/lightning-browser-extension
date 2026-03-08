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
const nostr_1 = __importDefault(require("~/extension/background-script/nostr"));
const alice = {
    privateKey: "9ab5b12ade1d9c27207ff0264e9fb155c77c9361c9b6a27c865fce1b2c0ddf0e",
    publicKey: "0bf50e2fdc927853c12b64c06f6a703cfad8086e79b18b1eb864f3fab7fc6f74",
};
const bob = {
    privateKey: "b7eab8ab34aac491217a31059ec017e51c63d09c828e39ee3a40a016bc9d0cbf",
    publicKey: "519f5ae2cd7d4b970c4edadb2efc947c9b803838de918d1c5bfd4b9c1a143b72",
};
const carol = {
    privateKey: "43a2d71f40dde6fb7588e7962a54b8bbd8dd4bd617a9a5c58b7bf0d8f3482f11",
    publicKey: "a8c7d70a7d2e2826ce519a0a490fb953464c9d130235c321282983cd73be333f",
};
describe("nostr.nip04", () => {
    test("encrypt & decrypt", () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceNostr = new nostr_1.default(alice.privateKey);
        const message = "Secret message that is sent from Alice to Bob";
        const encrypted = aliceNostr.nip04Encrypt(bob.publicKey, message);
        const bobNostr = new nostr_1.default(bob.privateKey);
        const decrypted = yield bobNostr.nip04Decrypt(alice.publicKey, encrypted);
        expect(decrypted).toMatch(message);
    }));
    test("Carol can't decrypt Alice's message for Bob", () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceNostr = new nostr_1.default(alice.privateKey);
        const message = "Secret message that is sent from Alice to Bob";
        const encrypted = aliceNostr.nip04Encrypt(bob.publicKey, message);
        const carolNostr = new nostr_1.default(carol.privateKey);
        let decrypted;
        try {
            decrypted = yield carolNostr.nip04Decrypt(alice.publicKey, encrypted);
        }
        catch (e) {
            decrypted = "error decrypting message";
        }
        expect(decrypted).not.toMatch(message);
    }));
});
describe("nostr.nip44", () => {
    test("encrypt & decrypt", () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceNostr = new nostr_1.default(alice.privateKey);
        const message = "Secret message that is sent from Alice to Bob";
        const encrypted = aliceNostr.nip44Encrypt(bob.publicKey, message);
        const bobNostr = new nostr_1.default(bob.privateKey);
        const decrypted = yield bobNostr.nip44Decrypt(alice.publicKey, encrypted);
        expect(decrypted).toMatch(message);
    }));
    test("Carol can't decrypt Alice's message for Bob", () => __awaiter(void 0, void 0, void 0, function* () {
        const aliceNostr = new nostr_1.default(alice.privateKey);
        const message = "Secret message that is sent from Alice to Bob";
        const encrypted = aliceNostr.nip44Encrypt(bob.publicKey, message);
        const carolNostr = new nostr_1.default(carol.privateKey);
        let decrypted;
        try {
            decrypted = yield carolNostr.nip44Decrypt(alice.publicKey, encrypted);
        }
        catch (e) {
            decrypted = "error decrypting message";
        }
        expect(decrypted).not.toMatch(message);
    }));
});
