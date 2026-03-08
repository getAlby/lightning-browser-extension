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
const providerBase_1 = __importDefault(require("~/extension/providers/providerBase"));
class NostrProvider extends providerBase_1.default {
    constructor() {
        super("nostr");
        this.nip04 = new Nip04(this);
        this.nip44 = new Nip44(this);
    }
    getPublicKey() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.enable();
            return yield this.execute("getPublicKeyOrPrompt");
        });
    }
    signEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.enable();
            return this.execute("signEventOrPrompt", { event });
        });
    }
    signSchnorr(sigHash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.enable();
            return this.execute("signSchnorrOrPrompt", { sigHash });
        });
    }
    //override method from base class, we don't want to throw error if not enabled
    on(...args) {
        const _super = Object.create(null, {
            on: { get: () => super.on }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield this.enable();
            _super.on.call(this, ...args);
        });
    }
    off(...args) {
        const _super = Object.create(null, {
            off: { get: () => super.off }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield this.enable();
            _super.off.call(this, ...args);
        });
    }
}
exports.default = NostrProvider;
class Nip04 {
    constructor(provider) {
        this.provider = provider;
    }
    encrypt(peer, plaintext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.provider.enable();
            return this.provider.execute("encryptOrPrompt", {
                peer,
                plaintext,
            });
        });
    }
    decrypt(peer, ciphertext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.provider.enable();
            return this.provider.execute("decryptOrPrompt", {
                peer,
                ciphertext,
            });
        });
    }
}
class Nip44 {
    constructor(provider) {
        this.provider = provider;
    }
    encrypt(peer, plaintext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.provider.enable();
            return this.provider.execute("nip44EncryptOrPrompt", {
                peer,
                plaintext,
            });
        });
    }
    decrypt(peer, ciphertext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.provider.enable();
            return this.provider.execute("nip44DecryptOrPrompt", {
                peer,
                ciphertext,
            });
        });
    }
}
