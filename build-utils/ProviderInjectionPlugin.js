const { sources } = require("webpack");

const PLUGIN_NAME = "ProviderInjectionPlugin";
const PROVIDER_SCRIPT_FILENAME = "js/inpageScript.bundle.js";
const CONTENT_SCRIPT_FILENAME = "js/contentScriptOnStart.bundle.js";

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
          let providerScriptSource =
            assets[PROVIDER_SCRIPT_FILENAME].source().toString();
          providerScriptSource = JSON.stringify(providerScriptSource);
          let contentScriptSource =
            assets[CONTENT_SCRIPT_FILENAME].source().toString();

          assets[CONTENT_SCRIPT_FILENAME] = new sources.RawSource(
            contentScriptSource.replace(
              '"@@@WINDOW_PROVIDER@@@"',
              providerScriptSource
            )
          );
        }
      );
    });
  }
}

module.exports = ProviderInjectionPlugin;
