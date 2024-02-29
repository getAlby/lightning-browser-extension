import LiquidProvider from "~/extension/providers/liquid";
import NostrProvider from "~/extension/providers/nostr";
import ProviderBase from "~/extension/providers/providerBase";
import WebBTCProvider from "~/extension/providers/webbtc";
import WebLNProvider from "~/extension/providers/webln";

export default class AlbyProvider extends ProviderBase {
  webln = new WebLNProvider();
  nostr = new NostrProvider();
  webbtc = new WebBTCProvider();
  liquid = new LiquidProvider();

  constructor() {
    super("alby");
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
    this._checkEnabled("addAccount");
    return this.execute("addAccount", {
      name: params.name,
      connector: params.connector,
      config: params.config,
    });
  }
}
