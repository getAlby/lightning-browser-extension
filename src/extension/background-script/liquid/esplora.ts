import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios, { AxiosInstance } from "axios";
import { networks } from "liquidjs-lib";
import { EsploraAssetInfos, EsploraAssetRegistry, PsetPreview } from "~/types";

export interface EsploraAPI {
  getAsset(assetHash: string): Promise<EsploraAssetInfos>;
}

export class Esplora implements EsploraAPI {
  private httpClient: AxiosInstance;

  private constructor(baseURL: string) {
    this.httpClient = axios.create({
      baseURL,
      adapter: fetchAdapter,
    });
  }

  static fromNetwork(network: keyof typeof networks): Esplora {
    switch (network) {
      case "liquid":
        return new Esplora("https://blockstream.info/liquid/api");
      case "testnet":
        return new Esplora("https://blockstream.info/liquidtestnet/api");
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }

  async getAsset(assetHash: string): Promise<EsploraAssetInfos> {
    if (LBTC_ASSET_HASHES.includes(assetHash)) return makeLBTC(assetHash);

    const response = await this.httpClient.get(`/asset/${assetHash}`);
    if (!isRawGetAssetResponse(response.data))
      throw new Error("Invalid response");
    return toAssetInfos(response.data);
  }
}

type RawGetAssetResponse = {
  asset_id: string;
  ticker: string;
  name: string;
  precision: number;
};

function isRawGetAssetResponse(obj: unknown): obj is RawGetAssetResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "asset_id" in obj &&
    typeof obj.asset_id === "string" &&
    "ticker" in obj &&
    typeof obj.ticker === "string" &&
    "name" in obj &&
    typeof obj.name === "string" &&
    "precision" in obj &&
    typeof obj.precision === "number"
  );
}

function toAssetInfos(raw: RawGetAssetResponse): EsploraAssetInfos {
  return {
    assetHash: raw.asset_id,
    ticker: raw.ticker,
    name: raw.name,
    precision: raw.precision,
  };
}

const LBTC_ASSET_HASHES = [
  networks.liquid.assetHash,
  networks.testnet.assetHash,
  networks.regtest.assetHash,
];

const makeLBTC = (assetHash: string): EsploraAssetInfos => ({
  assetHash,
  ticker: "LBTC",
  name: "Liquid Bitcoin",
  precision: 8,
});

// fetchAssetRegistry will try to fetch all assets info in the pset preview
export async function fetchAssetRegistry(
  esplora: EsploraAPI,
  preview: PsetPreview,
  onError: (error: unknown) => void
): Promise<EsploraAssetRegistry> {
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
