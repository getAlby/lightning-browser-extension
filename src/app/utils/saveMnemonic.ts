import { toast } from "react-toastify";
import msg from "~/common/lib/msg";

export async function saveMnemonic(id: string, mnemonic: string) {
  const priv = (await msg.request("nostr/getPrivateKey", {
    id,
  })) as string;
  const hasNostrPrivateKey = !!priv;

  if (hasNostrPrivateKey) {
    alert(
      "This account already has a nostr private key set and will not be derived from this secret key. You can manage your nostr key from your account settings."
    );
  }
  await msg.request("setMnemonic", {
    id,
    mnemonic,
  });

  if (!hasNostrPrivateKey) {
    alert("TODO derive nostr key");
  }

  toast.success(/*t("nostr.private_key.success")*/ "Secret Key saved");
  history.back();
}
