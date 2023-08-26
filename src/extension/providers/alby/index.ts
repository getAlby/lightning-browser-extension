import CommonProvider from "~/extension/providers/commonProvider";

export default class AlbyProvider extends CommonProvider {
  async enable() {
    if (this.enabled) {
      return { enabled: true };
    }
    const result = await this.execute("alby", "enable");
    if (typeof result.enabled === "boolean") {
      this.enabled = result.enabled;
    }
    return result;
  }

  /**
   * Adds a wallet to the user's Alby extension
   *
   * @param name The name of the account
   * @param connector The connector to use
   * @param config The config to pass to the connector
   * @returns Nothing, throws if user rejects
   */
  addAccount(params: {
    name: string;
    connector: string;
    config: Record<string, unknown>;
  }) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling addAccount");
    }
    return this.execute("alby", "addAccount", {
      name: params.name,
      connector: params.connector,
      config: params.config,
    });
  }
}
