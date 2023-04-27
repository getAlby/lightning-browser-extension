import { CopyIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Container from "@components/Container";
import Loading from "@components/Loading";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "~/app/components/Button";
import MnemonicInputs from "~/app/components/MnemonicInputs";
import Checkbox from "~/app/components/form/Checkbox";
import { useAccount } from "~/app/context/AccountContext";
import NostrIcon from "~/app/icons/NostrIcon";
import OrdinalsIcon from "~/app/icons/OrdinalsIcon";
import { saveMnemonic } from "~/app/utils/saveMnemonic";
import msg from "~/common/lib/msg";

const debug = process.env.NODE_ENV === "development";

function BackupSecretKey() {
  const [mnemonic, setMnemonic] = useState<string | undefined>();
  const account = useAccount();
  const { t: tCommon } = useTranslation("common");
  const [publicKeyCopyLabel, setPublicKeyCopyLabel] = useState(
    tCommon("actions.copy_clipboard") as string
  );
  const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);
  // TODO: useMnemonic hook
  const [hasMnemonic, setHasMnemonic] = useState(false);
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const accountMnemonic = (await msg.request("getMnemonic", {
          id,
        })) as string;
        if (accountMnemonic) {
          setMnemonic(accountMnemonic);
          setHasMnemonic(true);
        } else {
          // generate a new mnemonic
          setMnemonic(bip39.generateMnemonic(wordlist, 128));
        }
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /*const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view",
  });*/

  async function backupSecretKey() {
    try {
      if (!hasConfirmedBackup) {
        throw new Error(
          "Please confirm that you have backed up your secret key."
        );
      }
      // TODO: re-add
      if (!account || !id) {
        // type guard
        throw new Error("No account available");
      }
      if (!mnemonic) {
        throw new Error("No mnemonic available");
      }

      await saveMnemonic(id, mnemonic);
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  }

  return !account || !mnemonic ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <Container>
        <div className="mt-12 shadow bg-white sm:rounded-md sm:overflow-hidden p-10 divide-black/10 dark:divide-white/10 dark:bg-surface-02dp flex flex-col gap-4">
          <h1 className="font-bold text-2xl">
            {hasMnemonic
              ? "Back up your Secret Key"
              : "Generate your Secret Key"}
          </h1>
          <p className="text-gray-500">
            In addition to Bitcoin Lightning Network, Alby allows you to
            generate keys and interact with other protocols such as:
          </p>
          <div className="flex flex-col gap-4">
            <ProtocolListItem icon={<NostrIcon />} title="Nostr protocol" />
            <ProtocolListItem icon={<OrdinalsIcon />} title="Ordinals" />
            {/* <ProtocolListItem icon={<LiquidIcon />} title="Liquid" /> */}
          </div>

          <p className="mb-8 text-gray-500">
            Secret Key is a set of 12 words that will allow you to access your
            keys to those protocols on a new device or in case you loose access
            to your account:
          </p>
          <MnemonicInputs mnemonic={mnemonic} disabled>
            <>
              {/* TODO: consider making CopyButton component */}
              <Button
                outline
                icon={<CopyIcon className="w-6 h-6 mr-2 text-orange-400" />}
                label={publicKeyCopyLabel}
                onClick={async () => {
                  try {
                    if (!mnemonic) {
                      throw new Error("No Secret Key set");
                    }
                    navigator.clipboard.writeText(mnemonic);
                    setPublicKeyCopyLabel(tCommon("copied"));
                    setTimeout(() => {
                      setPublicKeyCopyLabel(tCommon("actions.copy_clipboard"));
                    }, 1000);
                  } catch (e) {
                    if (e instanceof Error) {
                      toast.error(e.message);
                    }
                  }
                }}
              />
              {!hasMnemonic && (
                <div className="flex items-center">
                  <Checkbox
                    id="has_backed_up"
                    name="Backup confirmation checkbox"
                    checked={hasConfirmedBackup}
                    onChange={(event) => {
                      setHasConfirmedBackup(event.target.checked);
                    }}
                  />
                  <label
                    htmlFor="has_backed_up"
                    className="cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white"
                  >
                    {
                      /*tCommon("actions.remember")*/ "I’ve backed my account’s Secret Key in a private and secure place"
                    }
                  </label>
                </div>
              )}
            </>
          </MnemonicInputs>
        </div>
        {!hasMnemonic && (
          <div className="flex justify-center mt-8 mb-16">
            <Button
              label={/*tCommon("actions.save")*/ "Save Secret Key"}
              primary
              onClick={backupSecretKey}
            />
          </div>
        )}
        {debug && hasMnemonic && (
          <div className="flex justify-center mt-8 mb-16">
            <Button
              label={/*tCommon("actions.save")*/ "Remove Secret Key"}
              primary
              onClick={async () => {
                await msg.request("setMnemonic", {
                  id,
                  mnemonic: null,
                });
                toast.success("Removed secret key");
                history.back();
              }}
            />
          </div>
        )}
      </Container>
    </div>
  );
}

export default BackupSecretKey;

type ProtocolListItemProps = { icon: React.ReactNode; title: string };

function ProtocolListItem({ icon, title }: ProtocolListItemProps) {
  return (
    <div className="flex gap-2">
      {icon}
      <span className="text-gray-500">{title}</span>
    </div>
  );
}
