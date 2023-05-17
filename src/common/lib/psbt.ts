import * as btc from "@scure/btc-signer";
import { Psbt, networks } from "bitcoinjs-lib";

type Address = { amount: number; address: string };

export type PsbtPreview = {
  inputs: Address[];
  outputs: Address[];
};

export function getPsbtPreview(
  psbt: string,
  networkType?: keyof typeof networks
): PsbtPreview {
  const network = networkType ? networks[networkType] : undefined;

  const unsignedPsbt = Psbt.fromHex(psbt, {
    network,
  });

  const preview: PsbtPreview = {
    inputs: [],
    outputs: [],
  };

  for (let i = 0; i < unsignedPsbt.data.inputs.length; i++) {
    if (i > 0) {
      throw new Error("Multiple inputs currently unsupported");
    }

    const tapBip32Derivation = unsignedPsbt.data.inputs[i].tapBip32Derivation;
    if (!tapBip32Derivation) {
      throw new Error("No bip32Derivation in input " + i);
    }
    const address = btc.p2tr(
      tapBip32Derivation[0].pubkey,
      undefined,
      network
    ).address;

    if (!address) {
      throw new Error("No address found in input " + i);
    }
    const witnessUtxo = unsignedPsbt.data.inputs[i].witnessUtxo;
    if (!witnessUtxo) {
      throw new Error("No witnessUtxo in input " + i);
    }

    preview.inputs.push({
      amount: witnessUtxo.value,
      address,
    });
  }
  for (let i = 0; i < unsignedPsbt.data.outputs.length; i++) {
    const txOutput = unsignedPsbt.txOutputs[i];
    const output = unsignedPsbt.data.outputs[i];
    if (!output.tapBip32Derivation) {
      throw new Error("No tapBip32Derivation in output");
    }
    const address = btc.p2tr(
      output.tapBip32Derivation[0].pubkey,
      undefined,
      network
    ).address;
    if (!address) {
      throw new Error("No address found in output " + i);
    }

    const previewOutput: Address = {
      amount: txOutput.value,
      address,
    };
    preview.outputs.push(previewOutput);
  }
  return preview;
}
