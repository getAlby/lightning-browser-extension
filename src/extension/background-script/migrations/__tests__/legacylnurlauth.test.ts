import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import type { Allowance } from "~/types";

import migrate from "../index";

describe("With lnurlAuth enabled allowance", () => {
  afterEach(() => {
    jest.clearAllMocks();
    state.getState().reset();
  });

  const mockAllowances: Allowance[] = [
    {
      enabled: true,
      host: "numbergoup.ngu",
      id: 1,
      imageURL: "https://numbergoup.ngu/favicon.ico",
      lastPaymentAt: "0",
      lnurlAuth: true,
      name: "ngu",
      remainingBudget: 500,
      totalBudget: 500,
      createdAt: "123456",
      payments: [],
      paymentsAmount: 0,
      paymentsCount: 0,
      percentage: "0",
      usedBudget: 0,
      tag: "",
    },
  ];

  test("enable legacy lnurl-auth", async () => {
    expect(state.getState().settings.isUsingLegacyLnurlAuthKey).toEqual(false);
    await db.allowances.bulkAdd(mockAllowances);
    await migrate();
    expect(state.getState().settings.isUsingLegacyLnurlAuthKey).toEqual(true);
  });
});

describe("Without lnurlAuth enabled allowance", () => {
  const mockAllowances: Allowance[] = [
    {
      enabled: true,
      host: "numbergoup.ngu",
      id: 1,
      imageURL: "https://numbergoup.ngu/favicon.ico",
      lastPaymentAt: "0",
      lnurlAuth: false,
      name: "ngu",
      remainingBudget: 500,
      totalBudget: 500,
      createdAt: "123456",
      payments: [],
      paymentsAmount: 0,
      paymentsCount: 0,
      percentage: "0",
      usedBudget: 0,
      tag: "",
    },
  ];

  test("disabled legacy lnurl-auth", async () => {
    expect(state.getState().settings.isUsingLegacyLnurlAuthKey).toEqual(false);
    await db.allowances.bulkAdd(mockAllowances);
    await migrate();
    expect(state.getState().settings.isUsingLegacyLnurlAuthKey).toEqual(false);
  });
});

/*
describe("Migrations already executed", () => {
  test("does not run the migration twice", async () => {
    state.setState({ migrations: ["foo"] });
    //...
  });
});
*/
