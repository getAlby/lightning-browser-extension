"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.sign = exports.privateNegate = exports.privateAdd = exports.xOnlyPointAddTweak = exports.isPrivate = exports.pointCompress = exports.isPoint = exports.verifySchnorr = exports.signSchnorr = exports.privateSub = exports.pointFromScalar = void 0;
/*
 * This file defines the secp256k1 module injected in liquidjs-lib and slip77.
 * It implements interface compatible with BIP341Factory and SLIP77Factory.
 */
const modular_1 = require("@noble/curves/abstract/modular");
const secp256k1_1 = require("@noble/curves/secp256k1");
const ORDER = secp256k1_1.secp256k1.CURVE.n;
function assertBytes(name, bytes, length) {
    if (bytes.length !== length) {
        throw new Error(`(${name}) Expected ${length} bytes, got ${bytes.length}`);
    }
}
function hexToNumber(hex) {
    if (typeof hex !== "string") {
        throw new TypeError("hexToNumber: expected string, got " + typeof hex);
    }
    return BigInt(`0x${hex}`);
}
const bytesToNumber = (bytes) => hexToNumber(Buffer.from(bytes).toString("hex"));
const numberToHex = (num) => num.toString(16).padStart(64, "0");
function pointFromScalar(d, compressed = true) {
    return secp256k1_1.secp256k1.ProjectivePoint.fromPrivateKey(d).toRawBytes(compressed);
}
exports.pointFromScalar = pointFromScalar;
function privateSub(d, tweak) {
    const point = secp256k1_1.secp256k1.ProjectivePoint.fromPrivateKey(d);
    const tweakedPoint = secp256k1_1.secp256k1.ProjectivePoint.fromHex(tweak);
    return point.subtract(tweakedPoint).toRawBytes(true);
}
exports.privateSub = privateSub;
function signSchnorr(h, d, e) {
    return secp256k1_1.schnorr.sign(h, d, e);
}
exports.signSchnorr = signSchnorr;
function verifySchnorr(h, Q, signature) {
    return secp256k1_1.schnorr.verify(signature, h, Q);
}
exports.verifySchnorr = verifySchnorr;
function isPoint(p) {
    try {
        secp256k1_1.secp256k1.ProjectivePoint.fromHex(p);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isPoint = isPoint;
function pointCompress(p, compressed) {
    return secp256k1_1.secp256k1.ProjectivePoint.fromHex(p).toRawBytes(compressed);
}
exports.pointCompress = pointCompress;
function isPrivate(d) {
    try {
        secp256k1_1.secp256k1.ProjectivePoint.fromPrivateKey(d);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isPrivate = isPrivate;
function xOnlyPointAddTweak(p, tweak) {
    // add an y coordinate to the point (expected by liquidjs-lib.bip341 module)
    // the value does not matter, taproot will ignore it and use the x coordinate only
    p = Buffer.concat([Buffer.from([0x02]), p]);
    const point = secp256k1_1.secp256k1.ProjectivePoint.fromHex(p);
    const tweakedPoint = secp256k1_1.secp256k1.ProjectivePoint.fromPrivateKey(tweak);
    let result = null;
    try {
        result = point.add(tweakedPoint);
    }
    catch (_a) {
        return null;
    }
    return {
        parity: result.hasEvenY() ? 0 : 1,
        xOnlyPubkey: result.toRawBytes(true).slice(1),
    };
}
exports.xOnlyPointAddTweak = xOnlyPointAddTweak;
function privateAdd(d, tweak) {
    assertBytes("privateKey", d, 32);
    assertBytes("tweak", tweak, 32);
    let t = bytesToNumber(tweak);
    if (t === BigInt(0)) {
        throw new Error("Tweak must not be zero");
    }
    if (t >= ORDER) {
        throw new Error("Tweak bigger than curve order");
    }
    t += bytesToNumber(d);
    if (t >= ORDER) {
        t -= ORDER;
    }
    if (t === BigInt(0)) {
        throw new Error("The tweak was out of range or the resulted private key is invalid");
    }
    return Buffer.from(numberToHex(t), "hex");
}
exports.privateAdd = privateAdd;
function privateNegate(d) {
    assertBytes("privateKey", d, 32);
    const bn = (0, modular_1.mod)(-bytesToNumber(d), ORDER);
    return Buffer.from(numberToHex(bn), "hex");
}
exports.privateNegate = privateNegate;
// ECDSA functions are expected by the interfaces but not used, so we throw an error if called
function sign(h, d, e) {
    throw new Error("sign not implemented");
}
exports.sign = sign;
function verify(h, Q, signature, strict) {
    throw new Error("verify not implemented");
}
exports.verify = verify;
