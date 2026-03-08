"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionMethodNostr = exports.PermissionMethodLiquid = exports.PermissionMethodBitcoin = exports.PermissionOption = exports.NostrPermissionPreset = void 0;
var NostrPermissionPreset;
(function (NostrPermissionPreset) {
    NostrPermissionPreset["TRUST_FULLY"] = "trust_fully";
    NostrPermissionPreset["REASONABLE"] = "reasonable";
    NostrPermissionPreset["PARANOID"] = "paranoid";
})(NostrPermissionPreset || (exports.NostrPermissionPreset = NostrPermissionPreset = {}));
var PermissionOption;
(function (PermissionOption) {
    PermissionOption["ASK_EVERYTIME"] = "ask_everytime";
    PermissionOption["DONT_ASK_CURRENT"] = "dont_ask_current";
    PermissionOption["DONT_ASK_ANY"] = "dont_ask_any";
})(PermissionOption || (exports.PermissionOption = PermissionOption = {}));
var PermissionMethodBitcoin;
(function (PermissionMethodBitcoin) {
    PermissionMethodBitcoin["BITCOIN_GETADDRESS"] = "bitcoin/getAddress";
})(PermissionMethodBitcoin || (exports.PermissionMethodBitcoin = PermissionMethodBitcoin = {}));
var PermissionMethodLiquid;
(function (PermissionMethodLiquid) {
    PermissionMethodLiquid["LIQUID_GETADDRESS"] = "liquid/getAddress";
})(PermissionMethodLiquid || (exports.PermissionMethodLiquid = PermissionMethodLiquid = {}));
var PermissionMethodNostr;
(function (PermissionMethodNostr) {
    PermissionMethodNostr["NOSTR_SIGNMESSAGE"] = "nostr/signMessage";
    PermissionMethodNostr["NOSTR_SIGNSCHNORR"] = "nostr/signSchnorr";
    PermissionMethodNostr["NOSTR_GETPUBLICKEY"] = "nostr/getPublicKey";
    PermissionMethodNostr["NOSTR_DECRYPT"] = "nostr/decrypt";
    PermissionMethodNostr["NOSTR_ENCRYPT"] = "nostr/encrypt";
})(PermissionMethodNostr || (exports.PermissionMethodNostr = PermissionMethodNostr = {}));
