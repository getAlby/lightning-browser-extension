"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
test("joins classNames together", () => {
    const largeText = true;
    const smallText = false;
    expect((0, index_1.classNames)("p-4 block", "bg-blue-200", largeText && "text-3xl", smallText && "text-xs", "flex flex-col")).toBe("p-4 block bg-blue-200 text-3xl flex flex-col");
});
test("isAlbyLNDHubAccount", () => {
    expect((0, index_1.isAlbyLNDHubAccount)("🐝 getalby.com", "alby")).toBe(false);
    expect((0, index_1.isAlbyLNDHubAccount)("🐝 getalby.com", "")).toBe(false);
    expect((0, index_1.isAlbyLNDHubAccount)("🐝 getalby.com", "lndhub")).toBe(true);
});
test("isAlbyOAuthAccount", () => {
    expect((0, index_1.isAlbyOAuthAccount)("lndhub")).toBe(false);
    expect((0, index_1.isAlbyOAuthAccount)("")).toBe(false);
    expect((0, index_1.isAlbyOAuthAccount)("alby")).toBe(true);
});
