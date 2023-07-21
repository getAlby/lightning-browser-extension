import { networks } from "liquidjs-lib";
import { getPsetPreview } from "~/extension/background-script/liquid/pset";
import { liquidFixtureDecode } from "~/fixtures/liquid";

describe("decode PSET", () => {
  for (const { description, valid, pset } of liquidFixtureDecode) {
    it(`it should ${valid ? "decode" : "not decode"} ${description}`, () => {
      if (valid) {
        const { inputs, outputs } = getPsetPreview(pset, "regtest");
        expect(inputs.length).toBeGreaterThan(0);
        expect(inputs.at(0)?.amount).toBe(1_0000_0000);
        expect(inputs.at(0)?.asset).toBe(networks.regtest.assetHash);
        expect(outputs.length).toBeGreaterThan(0);
      }
    });
  }
});
