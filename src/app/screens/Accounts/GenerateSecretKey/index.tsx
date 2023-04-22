import Container from "@components/Container";
import Loading from "@components/Loading";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import React from "react";
import { toast } from "react-toastify";
import Button from "~/app/components/Button";
import { useAccount } from "~/app/context/AccountContext";

function GenerateSecretKey() {
  const [mnemomic] = React.useState(bip39.generateMnemonic(wordlist, 128));
  const account = useAccount();

  /*const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view",
  });
  const { t: tCommon } = useTranslation("common");*/

  async function saveSecretKey() {
    try {
      // TODO: re-add
      if (!account) {
        // type guard
        throw new Error("No account available");
      }

      alert("Mnemonic: " + mnemomic);

      // TODO: make sure secret key doesn't already exist

      //   await msg.request("secretKey/save", {
      //     id: account.id,
      //     mnemomic,
      //   });
      //   toast.success(t("nostr.private_key.success"));
      // }
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  }

  return !account ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <Container>
        <div className="mt-12 shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
          Test
        </div>
        <Button
          label={/*tCommon("actions.save")*/ "Save generated Secret Key"}
          primary
          onClick={saveSecretKey}
        />
      </Container>
    </div>
  );
}

export default GenerateSecretKey;
