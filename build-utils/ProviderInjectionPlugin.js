const { sources } = require("webpack");

const PLUGIN_NAME = "ProviderInjectionPlugin";
const PROVIDER_BRIDGE_FILENAME = "js/contentScriptOnStart.bundle.js";

// plugin to intercept webln bundle during built times and inline/attach provider to make it available immediately
// works only on MV2 and designed specifically for firefox as main world execution is not supported for firefox
class ProviderInjectionPlugin {
  apply(compiler) {
    // declare any new provider here
    const inpageScripts = [
      {
        fileName: "js/inpageScript.bundle.js",
      },
      {
        fileName: "js/inpageScriptWebLN.bundle.js",
      },
      {
        fileName: "js/inpageScriptLiquid.bundle.js",
      },
      {
        fileName: "js/inpageScriptNostr.bundle.js",
      },
      {
        fileName: "js/inpageScriptWebBTC.bundle.js",
      },
      {
        fileName: "js/inpageScriptAlby.bundle.js",
      },
    ];

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        (assets) => {
          const windowProviderSource = inpageScripts
            .map((provider) => assets[provider.fileName].source().toString())
            .join("\n");

          const encodedWindowProviderSource =
            JSON.stringify(windowProviderSource);

          let providerBridgeSource =
            assets[PROVIDER_BRIDGE_FILENAME].source().toString();

          assets[PROVIDER_BRIDGE_FILENAME] = new sources.RawSource(
            providerBridgeSource.replace(
              '"@@@WINDOW_PROVIDER@@@"',
              encodedWindowProviderSource
            )
          );
        }
      );
    });
  }
}

module.exports = ProviderInjectionPlugin;
