"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const liquidjs_lib_1 = require("liquidjs-lib");
const pset_1 = require("~/extension/background-script/liquid/pset");
const liquid_1 = require("~/fixtures/liquid");
describe("decode PSET", () => {
    for (const { description, valid, pset } of liquid_1.liquidFixtureDecode) {
        it(`it should ${valid ? "decode" : "not decode"} ${description}`, () => {
            var _a, _b;
            if (valid) {
                const { inputs, outputs } = (0, pset_1.getPsetPreview)(pset, "regtest");
                expect(inputs.length).toBeGreaterThan(0);
                expect((_a = inputs.at(0)) === null || _a === void 0 ? void 0 : _a.amount).toBe(100000000);
                expect((_b = inputs.at(0)) === null || _b === void 0 ? void 0 : _b.asset).toBe(liquidjs_lib_1.networks.regtest.assetHash);
                expect(outputs.length).toBeGreaterThan(0);
            }
        });
    }
});
