const { sources } = require("webpack");

const PLUGIN_NAME = "InjectWindowProvider";
const WINDOW_PROVIDER_FILENAME = "js/inpageScript.bundle.js";
const PROVIDER_BRIDGE_FILENAME = "js/contentScriptOnEndWebLN.bundle.js";

class InjectWindowProvider {
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

          // need to encode so it can be used as a string
          // in non optimized builds the source is a multi-line string > `` needs to be used
          // but ${ needs to be escaped separately otherwise it breaks the ``
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

module.exports = InjectWindowProvider;
