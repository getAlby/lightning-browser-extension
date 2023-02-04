import utils from "~/common/lib/utils";
import state from "~/extension/background-script/state";
import { Nip26DelegateConditions } from "~/extension/ln/nostr/types";
import { MessageDelegateGet, PermissionMethodNostr } from "~/types";

import { addPermissionFor, hasPermissionFor } from "./helpers";

const generateDelegationResponse = async (
  delegateePubkey: string,
  conditions: Nip26DelegateConditions
) => {
  const publicKey = state.getState().getNostr().getPublicKey();
  const { cond, sig } = await state
    .getState()
    .getNostr()
    .delegate(delegateePubkey, conditions);
  const response = {
    from: publicKey,
    to: delegateePubkey,
    cond,
    sig,
  };

  return response;
};

const delegateOrPrompt = async (message: MessageDelegateGet) => {
  const { args } = message;
  const { delegateePubkey, conditions } = args;

  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_NIP26DELEGATE"],
      message.origin.host
    );

    if (hasPermission) {
      const response = await generateDelegationResponse(
        delegateePubkey,
        conditions
      );
      return { data: response };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
      }>({
        ...message,
        action: "public/nostr/confirm",
        args: {
          description: "Key delegation of events with these conditions",
          details: JSON.stringify(conditions),
        },
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_NIP26DELEGATE"],
          message.origin.host
        );
      }
      if (promptResponse.data.confirm) {
        const response = await generateDelegationResponse(
          delegateePubkey,
          conditions
        );
        return { data: response };
      } else {
        return { error: "User rejected" };
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default delegateOrPrompt;
