"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1 = __importStar(require("@noble/secp256k1"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const ecpair_1 = __importDefault(require("ecpair"));
const networks_1 = require("~/extension/background-script/bitcoin/networks");
const BTC_TAPROOT_DERIVATION_PATH = "m/86'/0'/0'/0";
const BTC_TAPROOT_DERIVATION_PATH_REGTEST = "m/86'/1'/0'/0";
const ecc = __importStar(require("@bitcoinerlab/secp256k1"));
class Bitcoin {
    constructor(mnemonic, networkType) {
        this.mnemonic = mnemonic;
        this.networkType = networkType;
        this.network = networks_1.networks[this.networkType];
        bitcoin.initEccLib(ecc);
    }
    signPsbt(psbt) {
        const index = 0;
        const derivationPathWithoutIndex = this.networkType === "bitcoin"
            ? BTC_TAPROOT_DERIVATION_PATH
            : BTC_TAPROOT_DERIVATION_PATH_REGTEST;
        const derivationPath = `${derivationPathWithoutIndex}/${index}`;
        const derivedKey = this.mnemonic.deriveKey(derivationPath);
        const taprootPsbt = bitcoin.Psbt.fromHex(psbt, {
            network: this.network,
        });
        const ECPair = (0, ecpair_1.default)(ecc);
        const keyPair = tweakSigner(ECPair, ECPair.fromPrivateKey(Buffer.from(derivedKey.privateKey), {
            network: this.network,
        }), {
            network: this.network,
        });
        // Step 1: Sign the Taproot PSBT inputs
        taprootPsbt.data.inputs.forEach((input, index) => {
            taprootPsbt.signTaprootInput(index, keyPair);
        });
        // Step 2: Finalize the Taproot PSBT
        taprootPsbt.finalizeAllInputs();
        // Step 3: Get the finalized transaction
        const signedTransaction = taprootPsbt.extractTransaction().toHex();
        return signedTransaction;
    }
    getTaprootAddress() {
        const index = 0;
        const derivationPathWithoutIndex = this.networkType === "bitcoin"
            ? BTC_TAPROOT_DERIVATION_PATH
            : BTC_TAPROOT_DERIVATION_PATH_REGTEST;
        const derivationPath = `${derivationPathWithoutIndex}/${index}`;
        const derivedKey = this.mnemonic.deriveKey(derivationPath);
        const { address } = bitcoin.payments.p2tr({
            internalPubkey: toXOnly(Buffer.from(derivedKey.publicKey)),
            network: this.network,
        });
        if (!address) {
            throw new Error("No taproot address found from private key");
        }
        return {
            address,
            derivationPath,
            index,
            publicKey: secp256k1.etc.bytesToHex(derivedKey.publicKey),
        };
    }
    getPsbtPreview(psbt) {
        var _a, _b, _c;
        const unsignedPsbt = bitcoin.Psbt.fromHex(psbt, {
            network: this.network,
        });
        const preview = {
            inputs: [],
            outputs: [],
            fee: 0,
        };
        for (let i = 0; i < unsignedPsbt.data.inputs.length; i++) {
            const pubkey = unsignedPsbt.data.inputs[i].tapInternalKey ||
                ((_b = (_a = unsignedPsbt.data.inputs[i].tapBip32Derivation) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.pubkey);
            let address = "UNKNOWN";
            if (pubkey) {
                const pubkeyAddress = bitcoin.payments.p2tr({
                    internalPubkey: pubkey,
                    network: this.network,
                }).address;
                if (pubkeyAddress) {
                    address = pubkeyAddress;
                }
            }
            const witnessUtxo = unsignedPsbt.data.inputs[i].witnessUtxo;
            if (!witnessUtxo) {
                throw new Error("No witnessUtxo in input " + i);
            }
            preview.inputs.push({
                amount: ((_c = unsignedPsbt.data.inputs[i].witnessUtxo) === null || _c === void 0 ? void 0 : _c.value) || 0,
                address,
            });
        }
        for (let i = 0; i < unsignedPsbt.data.outputs.length; i++) {
            const txOutput = unsignedPsbt.txOutputs[i];
            const address = txOutput.address ||
                (txOutput.script &&
                    (() => {
                        try {
                            return bitcoin.address.fromOutputScript(txOutput.script, this.network);
                        }
                        catch (error) {
                            console.error(error);
                        }
                        return undefined;
                    })()) ||
                "UNKNOWN";
            const previewOutput = {
                amount: txOutput.value,
                address,
            };
            preview.outputs.push(previewOutput);
        }
        for (const input of preview.inputs) {
            preview.fee += input.amount;
        }
        for (const output of preview.outputs) {
            preview.fee -= output.amount;
        }
        return preview;
    }
}
exports.default = Bitcoin;
// Below code taken from https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/taproot.spec.ts#L636
const toXOnly = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
function tweakSigner(ECPair, signer, opts) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let privateKey = signer.privateKey;
    if (!privateKey) {
        throw new Error("Private key is required for tweaking signer!");
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc.privateNegate(privateKey);
    }
    const tweakedPrivateKey = ecc.privateAdd(privateKey, tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash));
    if (!tweakedPrivateKey) {
        throw new Error("Invalid tweaked private key!");
    }
    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}
function tapTweakHash(pubKey, h) {
    return bitcoin.crypto.taggedHash("TapTweak", Buffer.concat(h ? [pubKey, h] : [pubKey]));
}
