import { Psbt, networks, payments } from "bitcoinjs-lib";

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
    const inputType = unsignedPsbt.getInputType(i);
    if (inputType !== "witnesspubkeyhash") {
      throw new Error("Unsupported input type: " + inputType);
    }
    const bip32Derivation = unsignedPsbt.data.inputs[i].bip32Derivation;
    if (!bip32Derivation) {
      throw new Error("No bip32Derivation in input " + i);
    }
    const address = payments.p2wpkh({
      pubkey: bip32Derivation[0].pubkey,
      network,
    }).address;

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
  for (let i = 0; i < unsignedPsbt.txOutputs.length; i++) {
    const txOutput = unsignedPsbt.txOutputs[i];
    if (!txOutput.address) {
      throw new Error("No address in output " + i);
    }
    const output: Address = {
      amount: txOutput.value,
      address: txOutput.address,
    };
    preview.outputs.push(output);
  }
  return preview;
}
