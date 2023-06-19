import { postMessage } from "../postMessage";

export default class AlbyProvider {
  enabled: boolean;

  constructor() {
    this.enabled = false;
  }

  enable() {
    if (this.enabled) {
      return Promise.resolve({ enabled: true });
    }
    return this.execute("enable").then((result) => {
      if (typeof result.enabled === "boolean") {
        this.enabled = result.enabled;
      }
      return result;
    });
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
    return this.execute("addAccount", {
      name: params.name,
      connector: params.connector,
      config: params.config,
    });
  }

  execute(
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return postMessage("alby", action, args);
  }
}
