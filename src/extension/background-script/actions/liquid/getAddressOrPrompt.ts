import utils from "~/common/lib/utils";
import {
  addPermissionFor,
  hasPermissionFor,
} from "~/extension/background-script/permissions";
import type { MessageGetLiquidAddress } from "~/types";
import { PermissionMethodLiquid } from "~/types";

import state from "../../state";

const getAddressOrPrompt = async (message: MessageGetLiquidAddress) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodLiquid["LIQUID_GETADDRESS"],
      message.origin.host
    );

    const liquid = await state.getState().getLiquid();

    if (hasPermission) {
      const publicKey = liquid.getPublicKey();
      const address = liquid.getAddress();
      return {
        data: {
          ...address,
          publicKey,
        },
      };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
        blocked: boolean;
      }>({
        args: {},
        ...message,
        action: "public/liquid/confirmGetAddress",
      });
      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        await addPermissionFor(
          PermissionMethodLiquid["LIQUID_GETADDRESS"],
          message.origin.host,
          promptResponse.data.blocked
        );
      }

      if (promptResponse.data.confirm) {
        // Normally `openPrompt` would throw already, but to make sure we got a confirm from the user we check this here
        const publicKey = liquid.getPublicKey();
        const address = liquid.getAddress();
        return {
          data: {
            ...address,
            publicKey,
          },
        };
      } else {
        return { error: "User rejected" };
      }
    }
  } catch (e) {
    console.error("getAddress failed", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default getAddressOrPrompt;
