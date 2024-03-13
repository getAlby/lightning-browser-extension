import { GetAccountRes } from "~/common/lib/api";
import state from "~/extension/background-script/state";
import type { MessageAccountGet } from "~/types";

const get = async (message: MessageAccountGet) => {
  const id = message?.args?.id || state.getState().currentAccountId;

  if (!id)
    return {
      error: "No account selected.",
    };

  const accounts = state.getState().accounts;
  const account = accounts[id];

  if (!account) return;

  const result: GetAccountRes = {
    id: account.id,
    connectorType: account.connector,
    name: account.name,
    liquidEnabled: !!account.mnemonic,
    nostrEnabled: !!account.nostrPrivateKey,
    hasMnemonic: !!account.mnemonic,
    // for existing accounts consider mnemonic backup already done
    isMnemonicBackupDone:
      account.isMnemonicBackupDone !== undefined
        ? account.isMnemonicBackupDone
        : true,
    // Note: undefined (default for new accounts) it is also considered imported
    hasImportedNostrKey: account.hasImportedNostrKey !== false,
    bitcoinNetwork: account.bitcoinNetwork || "bitcoin",
    useMnemonicForLnurlAuth: account.useMnemonicForLnurlAuth || false,
  };

  return {
    data: result,
  };
};

export default get;
