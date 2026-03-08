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
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1 = __importStar(require("@noble/secp256k1"));
const bip39 = __importStar(require("@scure/bip39"));
const liquidjs_lib_1 = require("liquidjs-lib");
const slip77_1 = require("slip77");
const esplora_1 = require("~/extension/background-script/liquid/esplora");
const pset_1 = require("~/extension/background-script/liquid/pset");
const tinysecp256k1Adapter = __importStar(require("./secp256k1"));
const LIQUID_DERIVATION_PATH = "m/84'/1776'/0'/0/0";
const LIQUID_DERIVATION_PATH_REGTEST = "m/84'/1'/0'/0/0";
function tapTweakHash(pubkey, h) {
    return liquidjs_lib_1.crypto.taggedHash("TapTweak/elements", Buffer.concat(h ? [pubkey, h] : [pubkey]));
}
function tweakPrivateKey(privKey, tweak) {
    let privateKey = privKey;
    const publicKey = Buffer.from(secp256k1.getPublicKey(privateKey, true));
    if (publicKey[0] === 3) {
        privateKey = Buffer.from(tinysecp256k1Adapter.privateNegate(privKey));
    }
    const tweakedPrivateKey = tinysecp256k1Adapter.privateAdd(privateKey, tapTweakHash(publicKey.subarray(1), tweak));
    if (!tweakedPrivateKey) {
        throw new Error("Invalid tweaked private key");
    }
    return Buffer.from(tweakedPrivateKey);
}
class Liquid {
    constructor(mnemonic, networkType) {
        this.mnemonic = mnemonic;
        this.privateKey = this.deriveLiquidPrivateKeyHex(networkType);
        this.networkType = networkType;
        this.network = liquidjs_lib_1.networks[networkType];
        if (!this.network)
            throw new Error(`Invalid network: "${networkType}"`);
        const masterBlindingKey = this.deriveLiquidMasterBlindingKey();
        this.slip77 =
            (0, slip77_1.SLIP77Factory)(tinysecp256k1Adapter).fromMasterBlindingKey(masterBlindingKey);
    }
    getPublicKey() {
        const publicKey = secp256k1.getPublicKey(Buffer.from(this.privateKey, "hex"), true);
        return Buffer.from(publicKey).toString("hex");
    }
    getPsetPreview(pset) {
        return (0, pset_1.getPsetPreview)(pset, this.networkType);
    }
    fetchAssetRegistry(psetPreview) {
        return (0, esplora_1.fetchAssetRegistry)(esplora_1.Esplora.fromNetwork(this.networkType), psetPreview, console.error // do not throw, just log errors
        );
    }
    // getAddress returns the segwit v1 taproot address using the private key
    getAddress() {
        const scriptPubKey = liquidjs_lib_1.bip341
            .BIP341Factory(tinysecp256k1Adapter)
            .taprootOutputScript(Buffer.from(this.getPublicKey(), "hex"));
        const unconfidentialAddr = liquidjs_lib_1.address.fromOutputScript(scriptPubKey, this.network);
        const blindingKeys = this.slip77.derive(scriptPubKey);
        if (!blindingKeys.publicKey || !blindingKeys.privateKey) {
            throw new Error("Invalid blinding keys");
        }
        const confidentialAddr = liquidjs_lib_1.address.toConfidential(unconfidentialAddr, blindingKeys.publicKey);
        return {
            address: confidentialAddr,
            blindingPrivateKey: blindingKeys.privateKey.toString("hex"),
        };
    }
    /**
     * make a schnorr signature using the Liquid private key
     * @param sigHash message to sign using the private key
     * @param keyPathOnly true if the signature has to be used for taproot key-path only inputs (will tweak the private key)
     * @returns 64 bytes schnorr signature
     */
    signSchnorr(sigHash, keyPathOnly = false) {
        let privKey = Buffer.from(this.privateKey, "hex");
        if (keyPathOnly)
            privKey = tweakPrivateKey(privKey);
        const signature = tinysecp256k1Adapter.signSchnorr(Buffer.from(sigHash, "hex"), privKey, Buffer.alloc(32));
        return Buffer.from(signature).toString("hex");
    }
    signPset(pset) {
        const liquidPublicKey = Buffer.from(Buffer.from(this.getPublicKey(), "hex")).subarray(1); // remove prefix  to get 32 bytes public key
        const signer = new liquidjs_lib_1.Signer(pset);
        for (const [inIndex, input] of pset.inputs.entries()) {
            // sign key-path taproot input using liquidPublicKey
            if (input.tapInternalKey &&
                input.tapInternalKey.equals(liquidPublicKey)) {
                const sighashType = input.sighashType || liquidjs_lib_1.Transaction.SIGHASH_DEFAULT;
                const sighash = pset.getInputPreimage(inIndex, sighashType, this.network.genesisBlockHash);
                const signature = this.signSchnorr(Buffer.from(sighash).toString("hex"), true);
                const partialSig = {
                    tapKeySig: serializeSchnnorrSig(Buffer.from(signature, "hex"), sighashType),
                    genesisBlockHash: this.network.genesisBlockHash,
                };
                signer.addSignature(inIndex, partialSig, liquidjs_lib_1.Pset.SchnorrSigValidator(tinysecp256k1Adapter));
                continue;
            }
            // sign key-path tapscript leaves using liquidPublicKey
            if (input.tapLeafScript && input.tapLeafScript.length > 0) {
                for (const leaf of input.tapLeafScript) {
                    const script = leaf.script.toString("hex");
                    if (!script.includes(liquidPublicKey.subarray(1).toString("hex"))) {
                        continue;
                    }
                    const leafHash = liquidjs_lib_1.bip341.tapLeafHash({
                        scriptHex: script,
                        version: leaf.leafVersion,
                    });
                    const sighashType = input.sighashType || liquidjs_lib_1.Transaction.SIGHASH_DEFAULT;
                    const sighash = pset.getInputPreimage(inIndex, sighashType, this.network.genesisBlockHash, leafHash);
                    const signature = this.signSchnorr(sighash.toString("hex"));
                    const tapScriptSigs = [
                        {
                            leafHash,
                            pubkey: liquidPublicKey,
                            signature: serializeSchnnorrSig(Buffer.from(signature, "hex"), sighashType),
                        },
                    ];
                    const partialSig = {
                        tapScriptSigs,
                        genesisBlockHash: this.network.genesisBlockHash,
                    };
                    signer.addSignature(inIndex, partialSig, liquidjs_lib_1.Pset.SchnorrSigValidator(tinysecp256k1Adapter));
                }
            }
        }
        return signer.pset;
    }
    deriveLiquidPrivateKeyHex(networkType) {
        const derivationPath = networkType === "liquid"
            ? LIQUID_DERIVATION_PATH
            : LIQUID_DERIVATION_PATH_REGTEST;
        return secp256k1.etc.bytesToHex(this.mnemonic.deriveKey(derivationPath).privateKey);
    }
    deriveLiquidMasterBlindingKey() {
        return (0, slip77_1.SLIP77Factory)(tinysecp256k1Adapter)
            .fromSeed(Buffer.from(bip39.mnemonicToSeedSync(this.mnemonic.mnemonic)))
            .masterKey.toString("hex");
    }
}
exports.default = Liquid;
const serializeSchnnorrSig = (sig, hashtype) => Buffer.concat([
    sig,
    hashtype !== 0x00 ? Buffer.of(hashtype) : Buffer.alloc(0),
]);
