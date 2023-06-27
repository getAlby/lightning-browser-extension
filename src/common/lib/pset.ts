import {
  AssetHash,
  ElementsValue,
  Pset,
  address as liquidaddress,
  networks,
} from "liquidjs-lib";

import { Address as PsbtAddress } from "./psbt";

export type Address = PsbtAddress & {
  asset: string;
};

export type PsetPreview = {
  inputs: Address[];
  outputs: Address[];
};

export function getPsetPreview(
  pset: string,
  networkType?: keyof typeof networks
): PsetPreview {
  const network = networkType ? networks[networkType] : undefined;

  const unsignedPset = Pset.fromBase64(pset);

  const preview: PsetPreview = {
    inputs: [],
    outputs: [],
  };

  for (const [inputIndex, input] of unsignedPset.inputs.entries()) {
    const witnessUtxo = input.witnessUtxo;
    if (!witnessUtxo) {
      throw new Error(`No witnessUtxo in input #${inputIndex}`);
    }

    const address = liquidaddress.fromOutputScript(witnessUtxo.script, network);

    const asset = getInputAsset(unsignedPset, inputIndex);
    if (!asset) throw new Error(`No explicitAsset in input #${inputIndex}`);

    const amount = getInputAmount(unsignedPset, inputIndex);
    if (!amount) throw new Error(`No explicitValue in input #${inputIndex}`);

    preview.inputs.push({
      address,
      asset,
      amount,
    });
  }

  for (const [outputIndex, output] of unsignedPset.outputs.entries()) {
    if (!output.script || output.script.length === 0) continue; // skip fee output
    const address = liquidaddress.fromOutputScript(output.script, network);

    const asset = output.asset;
    if (!asset) throw new Error(`No asset in output #${outputIndex}`);

    const amount = output.value;
    if (!amount) throw new Error(`No value in output #${outputIndex}`);

    preview.outputs.push({
      address,
      asset: AssetHash.fromBytes(asset).hex,
      amount,
    });
  }

  return preview;
}

function getInputAmount(pset: Pset, inputIndex: number): number | undefined {
  const input = pset.inputs[inputIndex];
  if (input.explicitValue) {
    return input.explicitValue;
  }

  if (
    input.witnessUtxo &&
    !ElementsValue.fromBytes(input.witnessUtxo.value).isConfidential
  ) {
    return ElementsValue.fromBytes(input.witnessUtxo.value).number;
  }

  // should return undefined in case of confidential input without explicit value
  return undefined;
}

function getInputAsset(pset: Pset, inputIndex: number): string | undefined {
  const input = pset.inputs[inputIndex];
  if (input.explicitAsset) {
    return AssetHash.fromBytes(input.explicitAsset).hex;
  }

  if (
    input.witnessUtxo &&
    !AssetHash.fromBytes(input.witnessUtxo.asset).isConfidential
  ) {
    return AssetHash.fromBytes(input.witnessUtxo.asset).hex;
  }

  // should return undefined in case of confidential input without explicit asset
  return undefined;
}
