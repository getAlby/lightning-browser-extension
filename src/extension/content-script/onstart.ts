import { isManifestV3 } from "~/common/utils/mv3";
import injectScript from "~/extension/content-script/injectScript";
import shouldInject from "./shouldInject";

async function onstart() {
  // eslint-disable-next-line no-console
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  // Inject in-page scripts for MV2
  if (!isManifestV3) {
    injectScript("@@@WINDOW_PROVIDER@@@");
  }
}

onstart();
