const { sources } = require("webpack");

const PLUGIN_NAME = "ProviderInjectionPlugin";
const WINDOW_PROVIDER_FILENAME = "js/inpageScript.bundle.js";
const PROVIDER_BRIDGE_FILENAME = "js/contentScriptOnStart.bundle.js";

// plugin to intercept webln bundle during built times and inline/attach provider to make it available immediately
// works only on MV2 and designed specifically for firefox as main world execution is not supported for firefox
class ProviderInjectionPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        (assets) => {
          let windowProviderSource =
            assets[WINDOW_PROVIDER_FILENAME].source().toString();
          windowProviderSource = JSON.stringify(windowProviderSource);
          let providerBridgeSource =
            assets[PROVIDER_BRIDGE_FILENAME].source().toString();

          assets[PROVIDER_BRIDGE_FILENAME] = new sources.RawSource(
            providerBridgeSource.replace(
              '"@@@WINDOW_PROVIDER@@@"',
              windowProviderSource
            )
          );
        }
      );
    });
  }
}

module.exports = ProviderInjectionPlugin;
