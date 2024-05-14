import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import { MessageDefault } from "~/types";

const getBalanceOrPrompt = async (message: MessageDefault) => {
  if (!("host" in message.origin)) return;

  const connector = await state.getState().getConnector();
  const accountId = state.getState().currentAccountId;

  try {
    const allowance = await db.allowances
      .where("host")
      .equalsIgnoreCase(message.origin.host)
      .first();

    if (!allowance?.id) {
      throw new Error("Could not find an allowance for this host");
    }

    if (!accountId) {
      // type guard
      throw new Error("Could not find a selected account");
    }

    const permission = await db.permissions
      .where("host")
      .equalsIgnoreCase(message.origin.host)
      .and((p) => p.accountId === accountId && p.method === "webln.getbalance")
      .first();

    // request method is allowed to be called
    if (permission && permission.enabled) {
      const response = await connector.getBalance();
      return response;
    } else {
      // throws an error if the user rejects
      const promptResponse = await utils.openPrompt<{
        enabled: boolean;
        blocked: boolean;
      }>({
        args: {
          requestPermission: {
            method: "getBalance",
            description: `webln.getbalance.description`,
          },
        },
        origin: message.origin,
        action: "public/confirmRequestPermission",
      });

      const response = await connector.getBalance();

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.enabled) {
        const permissionIsAdded = await db.permissions.add({
          createdAt: Date.now().toString(),
          accountId: accountId,
          allowanceId: allowance.id,
          host: message.origin.host,
          method: "webln.getbalance", // ensure to store the prefixed method string
          enabled: promptResponse.data.enabled,
          blocked: promptResponse.data.blocked,
        });

        !!permissionIsAdded && (await db.saveToStorage());
      }

      return response;
    }
  } catch (e) {
    console.error(e);
    return {
      error:
        e instanceof Error
          ? e.message
          : `Something went wrong with during webln.getBalance()`,
    };
  }
};

export default getBalanceOrPrompt;
