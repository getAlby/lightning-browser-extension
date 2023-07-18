import {
  AssetHash,
  ElementsValue,
  Pset,
  address as liquidaddress,
  networks,
  script,
} from "liquidjs-lib";
import { EsploraAPI, EsploraAssetInfos } from "~/common/lib/esplora";

export type Address = {
  amount: number;
  address: string;
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

    let address: string;
    try {
      address = liquidaddress.fromOutputScript(witnessUtxo.script, network);
    } catch {
      address = script.toASM(witnessUtxo.script);
    }

    const asset = getInputAsset(unsignedPset, inputIndex);
    if (!asset) continue;

    const amount = getInputAmount(unsignedPset, inputIndex);
    if (!amount) continue;

    preview.inputs.push({
      address,
      asset,
      amount,
    });
  }

  for (const [outputIndex, output] of unsignedPset.outputs.entries()) {
    if (!output.script || output.script.length === 0) continue; // skip fee output

    let address: string;
    try {
      address = liquidaddress.fromOutputScript(output.script, network);
    } catch {
      address = script.toASM(output.script);
    }

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
    !input.witnessUtxo.rangeProof &&
    !input.witnessUtxo.surjectionProof
  ) {
    return AssetHash.fromBytes(input.witnessUtxo.asset).hex;
  }

  // should return undefined in case of confidential input without explicit asset
  return undefined;
}

// fetchAssetRegistry will try to fetch all assets info in the pset preview
export async function fetchAssetRegistry(
  esplora: EsploraAPI,
  preview: PsetPreview,
  onError: (error: unknown) => void
): Promise<Record<string, EsploraAssetInfos>> {
  const assets = new Set<string>();
  for (const input of preview.inputs) {
    assets.add(input.asset);
  }

  for (const output of preview.outputs) {
    assets.add(output.asset);
  }

  const assetRegistry: Record<string, EsploraAssetInfos> = {};

  const results = await Promise.allSettled(
    Array.from(assets).map((asset) => esplora.getAsset(asset))
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      assetRegistry[result.value.assetHash] = result.value;
      continue;
    }

    if (result.status === "rejected") {
      onError(result.reason);
    }
  }

  return assetRegistry;
}
