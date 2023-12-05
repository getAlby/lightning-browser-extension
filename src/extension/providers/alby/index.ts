import LiquidProvider from "~/extension/providers/liquid";
import NostrProvider from "~/extension/providers/nostr";
import ProviderBase from "~/extension/providers/providerBase";
import WebBTCProvider from "~/extension/providers/webbtc";
import WebLNProvider from "~/extension/providers/webln";

export default class AlbyProvider extends ProviderBase {
  liquid: LiquidProvider;
  nostr: NostrProvider;
  webbtc: WebBTCProvider;
  webln: WebLNProvider;

  constructor(
    liquid: LiquidProvider,
    nostr: NostrProvider,
    webbtc: WebBTCProvider,
    webln: WebLNProvider
  ) {
    super("alby");
    this.liquid = liquid;
    this.nostr = nostr;
    this.webbtc = webbtc;
    this.webln = webln;
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
