import { isManifestV3 } from "~/common/utils/mv3";
import injectScript from "~/extension/content-script/injectScript";

async function onstart() {
  // Inject in-page scripts for MV2
  if (!isManifestV3) {
    injectScript("@@@WINDOW_PROVIDER@@@");
  }
}

onstart();
