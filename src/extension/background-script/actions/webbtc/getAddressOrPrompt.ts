import utils from "~/common/lib/utils";
import {
  addPermissionFor,
  hasPermissionFor,
} from "~/extension/background-script/permissions";
import state from "~/extension/background-script/state";
import { MessageGetAddress, PermissionMethodBitcoin } from "~/types";

const getAddressOrPrompt = async (message: MessageGetAddress) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodBitcoin["BITCOIN_GETADDRESS"],
      message.origin.host
    );

    const bitcoin = await state.getState().getBitcoin();

    if (hasPermission) {
      const data = bitcoin.getTaprootAddress();
      return {
        data,
      };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
        blocked: boolean;
      }>({
        ...message,
        action: "public/webbtc/confirmGetAddress",
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        await addPermissionFor(
          PermissionMethodBitcoin["BITCOIN_GETADDRESS"],
          message.origin.host,
          promptResponse.data.blocked
        );
      }

      if (promptResponse.data.confirm) {
        const data = bitcoin.getTaprootAddress();
        return {
          data,
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
