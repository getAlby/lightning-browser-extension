import { EsploraAPI, EsploraAssetInfos } from "~/common/lib/esplora";
import { PsetPreview } from "~/types";

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
