import { savePrivateKey } from "~/app/utils/savePrivateKey";
import {
  deriveLiquidPrivateKey,
  deriveNostrPrivateKey,
} from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";

export async function saveMnemonic(accountId: string, mnemonic: string) {
  const nostrPriv = (await msg.request("nostr/getPrivateKey", {
    id: accountId,
  })) as string;
  const liquidPriv = (await msg.request("liquid/getPrivateKey", {
    id: accountId,
  })) as string;
  const hasNostrPrivateKey = !!nostrPriv;
  const hasLiquidPrivateKey = !!liquidPriv;

  await msg.request("setMnemonic", {
    id: accountId,
    mnemonic,
  });

  if (!hasNostrPrivateKey) {
    const nostrPrivateKey = await deriveNostrPrivateKey(mnemonic);
    await savePrivateKey("nostr", accountId, nostrPrivateKey);
  }
  if (!hasLiquidPrivateKey) {
    const liquidPrivateKey = await deriveLiquidPrivateKey(mnemonic);
    await savePrivateKey("liquid", accountId, liquidPrivateKey);
  }
}
