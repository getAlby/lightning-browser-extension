"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPsetPreview = void 0;
const liquidjs_lib_1 = require("liquidjs-lib");
function getPsetPreview(pset, networkType) {
    const network = networkType ? liquidjs_lib_1.networks[networkType] : undefined;
    const unsignedPset = liquidjs_lib_1.Pset.fromBase64(pset);
    const preview = {
        inputs: [],
        outputs: [],
    };
    for (const [inputIndex, input] of unsignedPset.inputs.entries()) {
        const witnessUtxo = input.witnessUtxo;
        if (!witnessUtxo) {
            throw new Error(`No witnessUtxo in input #${inputIndex}`);
        }
        let address;
        try {
            address = liquidjs_lib_1.address.fromOutputScript(witnessUtxo.script, network);
        }
        catch (_a) {
            address = liquidjs_lib_1.script.toASM(witnessUtxo.script);
        }
        const asset = getInputAsset(unsignedPset, inputIndex);
        if (!asset)
            continue;
        const amount = getInputAmount(unsignedPset, inputIndex);
        if (!amount)
            continue;
        preview.inputs.push({
            address,
            asset,
            amount,
        });
    }
    for (const [outputIndex, output] of unsignedPset.outputs.entries()) {
        if (!output.script || output.script.length === 0)
            continue; // skip fee output
        let address;
        try {
            address = liquidjs_lib_1.address.fromOutputScript(output.script, network);
        }
        catch (_b) {
            address = liquidjs_lib_1.script.toASM(output.script);
        }
        const asset = output.asset;
        if (!asset)
            throw new Error(`No asset in output #${outputIndex}`);
        const amount = output.value;
        if (!amount)
            throw new Error(`No value in output #${outputIndex}`);
        preview.outputs.push({
            address,
            asset: liquidjs_lib_1.AssetHash.fromBytes(asset).hex,
            amount,
        });
    }
    return preview;
}
exports.getPsetPreview = getPsetPreview;
function getInputAmount(pset, inputIndex) {
    const input = pset.inputs[inputIndex];
    if (input.explicitValue) {
        return input.explicitValue;
    }
    if (input.witnessUtxo &&
        !liquidjs_lib_1.ElementsValue.fromBytes(input.witnessUtxo.value).isConfidential) {
        return liquidjs_lib_1.ElementsValue.fromBytes(input.witnessUtxo.value).number;
    }
    // should return undefined in case of confidential input without explicit value
    return undefined;
}
function getInputAsset(pset, inputIndex) {
    const input = pset.inputs[inputIndex];
    if (input.explicitAsset) {
        return liquidjs_lib_1.AssetHash.fromBytes(input.explicitAsset).hex;
    }
    if (input.witnessUtxo &&
        !input.witnessUtxo.rangeProof &&
        !input.witnessUtxo.surjectionProof) {
        return liquidjs_lib_1.AssetHash.fromBytes(input.witnessUtxo.asset).hex;
    }
    // should return undefined in case of confidential input without explicit asset
    return undefined;
}
