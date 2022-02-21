describe("Create or connect wallets to Alby Extension", () => {
  it("successfully creates an Alby wallet", async () => {
    await cy.task("createAlbyWallet");
  });

  it("successfully connects to BlueWallet wallet", async () => {
    await cy.task("connectBlueWallet");
  });

  it("successfully connects to LNBits wallet", async () => {
    await cy.task("connectLNBitsWallet");
  });
});
