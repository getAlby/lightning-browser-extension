import Button from "@components/Button";
import Container from "@components/Container";
import Loading from "@components/Loading";
import Setting from "@components/Setting";
import TextField from "@components/form/TextField";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Alert from "~/app/components/Alert";
import Badge from "~/app/components/Badge";
import InputCopyButton from "~/app/components/InputCopyButton";
import MenuDivider from "~/app/components/Menu/MenuDivider";
import Select from "~/app/components/form/Select";
import Toggle from "~/app/components/form/Toggle";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import { useSettings } from "~/app/context/SettingsContext";
import api, { GetAccountRes } from "~/common/lib/api";
import msg from "~/common/lib/msg";
import nostr from "~/common/lib/nostr";
import type { Account, BitcoinNetworkType } from "~/types";

type AccountAction = Pick<Account, "id" | "name">;
dayjs.extend(relativeTime);

function AccountDetail() {
  const auth = useAccount();
  const { accounts, getAccounts } = useAccounts();
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view",
  });
  const { t: tCommon } = useTranslation("common");
  const { isLoading: isLoadingSettings } = useSettings();

  const hasFetchedData = useRef(false);
  const [account, setAccount] = useState<GetAccountRes | null>(null);
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();

  const [accountName, setAccountName] = useState("");

  const [hasMnemonic, setHasMnemonic] = useState(false);
  const [nostrPublicKey, setNostrPublicKey] = useState("");
  const [hasImportedNostrKey, setHasImportedNostrKey] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const response = await api.getAccount(id);
        setAccount(response);
        setAccountName(response.name);
        setHasMnemonic(response.hasMnemonic);
        setHasImportedNostrKey(response.hasImportedNostrKey);

        if (response.nostrEnabled) {
          const nostrPublicKeyHex = await api.nostr.getPublicKey(id);
          if (nostrPublicKeyHex) {
            const nostrPublicKeyNpub = nostr.hexToNip19(
              nostrPublicKeyHex,
              "npub"
            );
            setNostrPublicKey(nostrPublicKeyNpub);
          }
        }
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id]);

  async function updateAccountName({ id, name }: AccountAction) {
    await api.editAccount(id, { name });

    auth.fetchAccountInfo(); // Update active account name
    getAccounts(); // update all accounts
  }

  async function selectAccount(accountId: string) {
    auth.setAccountId(accountId);
    await api.selectAccount(accountId);
    auth.fetchAccountInfo();
  }

  async function removeAccount({ id, name }: AccountAction) {
    const confirm = window.prompt(t("remove.confirm"))?.toLowerCase();
    if (!confirm) return;

    if (confirm == accountName.toLowerCase()) {
      let nextAccountId;
      let accountIds = Object.keys(accounts);
      if (auth.account?.id === id && accountIds.length > 1) {
        nextAccountId = accountIds.filter((accountId) => accountId !== id)[0];
      }

      await api.removeAccount(id);
      accountIds = accountIds.filter((accountId) => accountId !== id);

      if (accountIds.length > 0) {
        getAccounts();
        if (nextAccountId) selectAccount(nextAccountId);
        navigate("/accounts", { replace: true });
      } else {
        window.close();
      }
    } else {
      toast.error(t("remove.error"));
    }
  }
  async function removeMnemonic({ id, name }: AccountAction) {
    const confirm = window
      .prompt(t("remove_secretkey.confirm", { name }))
      ?.toLowerCase();
    if (!confirm) return;

    if (confirm == accountName.toLowerCase()) {
      // TODO: consider adding removeMnemonic function
      await api.setMnemonic(id, null);
      setHasMnemonic(false);
      setHasImportedNostrKey(true);
      toast.success(t("remove_secretkey.success"));
    } else {
      toast.error(t("remove.error"));
    }
  }

  useEffect(() => {
    // Run once.
    if (!isLoadingSettings && !hasFetchedData.current) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, [fetchData, isLoadingSettings]);

  return !account ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <Container>
        <div className="flex justify-between items-center pt-8 pb-4">
          <h2 className="text-2xl font-bold dark:text-white">{t("title2")}</h2>
        </div>

        <div>
          <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                updateAccountName({
                  id: account.id,
                  name: accountName,
                });
                const updatedAccount = account;
                updatedAccount.name = accountName;
                setAccount(updatedAccount);
              }}
              className="my-4 flex justify-between items-end"
            >
              <div className="w-7/12">
                <TextField
                  id="name"
                  label={t("name.title")}
                  placeholder={t("name.placeholder")}
                  type="text"
                  value={accountName}
                  onChange={(event) => {
                    setAccountName(event.target.value);
                  }}
                />
              </div>
              <div className="w-1/5 flex-none mx-4 d-none"></div>
              <div className="w-1/5 flex-none">
                <Button
                  type="submit"
                  label={tCommon("actions.save")}
                  disabled={account.name === accountName}
                  primary
                  fullWidth
                />
              </div>
            </form>
          </div>

          <h2 className="text-2xl mt-12 font-bold dark:text-white">
            {t("mnemonic.title")}
          </h2>
          <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
            {t("mnemonic.description")}
          </p>

          <div className="shadow bg-white sm:rounded-md sm:overflow-hidden p-6 dark:bg-surface-02dp flex flex-col gap-4">
            {hasMnemonic && (
              <Alert type="warn">{t("mnemonic.backup.warning")}</Alert>
            )}

            <div className="flex justify-between items-end">
              <div className="w-9/12">
                <p className="text-gray-900 dark:text-white font-medium">
                  {t(
                    hasMnemonic
                      ? "mnemonic.backup.title"
                      : "mnemonic.generate.title"
                  )}
                </p>
                <p className="text-gray-500 text-sm dark:text-neutral-500">
                  {t("mnemonic.description2")}
                </p>
              </div>

              <div className="w-1/5 flex-none">
                <Link to={`secret-key/${hasMnemonic ? "backup" : "generate"}`}>
                  <Button
                    label={t(
                      hasMnemonic
                        ? "mnemonic.backup.button"
                        : "mnemonic.generate.button"
                    )}
                    primary
                    fullWidth
                  />
                </Link>
              </div>
            </div>
            {!hasMnemonic && (
              <>
                <MenuDivider />
                <div className="flex justify-between items-end">
                  <div className="w-7/12">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {t("mnemonic.import.title")}
                    </p>
                    <p className="text-gray-500 text-sm dark:text-neutral-500">
                      {t("mnemonic.import.description")}
                    </p>
                  </div>

                  <div className="w-1/5 flex-none">
                    <Link to="secret-key/import">
                      <Button
                        label={t("mnemonic.import.button")}
                        primary
                        fullWidth
                      />
                    </Link>
                  </div>
                </div>
              </>
            )}
            <MenuDivider />
            <div className="flex justify-between items-end">
              <div className="w-7/12 flex items-center gap-2">
                <TextField
                  id="nostrPublicKey"
                  label={t("nostr.public_key.label")}
                  type="text"
                  value={nostrPublicKey}
                  disabled
                  endAdornment={
                    nostrPublicKey && <InputCopyButton value={nostrPublicKey} />
                  }
                />
                {nostrPublicKey && hasImportedNostrKey && (
                  <Badge
                    label="imported"
                    color="green-bitcoin"
                    textColor="white"
                  />
                )}
              </div>

              <div className="w-1/5 flex-none">
                <Link to="nostr">
                  <Button label={t("nostr.settings.label")} primary fullWidth />
                </Link>
              </div>
            </div>
            <MenuDivider />
            <div className="flex justify-between items-end">
              <div className="w-7/12 flex flex-col gap-2">
                <p className="text-gray-900 dark:text-white font-medium">
                  {t("bitcoin.network.title")}
                </p>
                <p className="text-gray-500 text-sm dark:text-neutral-500">
                  {t("bitcoin.network.subtitle")}
                </p>
              </div>

              <div className="w-1/5 flex-none">
                <Select
                  name="network"
                  value={account.bitcoinNetwork}
                  onChange={async (event) => {
                    // update local value
                    setAccount({
                      ...account,
                      bitcoinNetwork: event.target.value as BitcoinNetworkType,
                    });
                    await api.editAccount(id, {
                      bitcoinNetwork: event.target.value as BitcoinNetworkType,
                    });
                  }}
                >
                  <option value="bitcoin">
                    {t("bitcoin.network.options.bitcoin")}
                  </option>
                  <option value="testnet">
                    {t("bitcoin.network.options.testnet")}
                  </option>
                  <option value="regtest">
                    {t("bitcoin.network.options.regtest")}
                  </option>
                </Select>
              </div>
            </div>
            <MenuDivider />
            <div className="flex justify-between items-center">
              <div className="w-7/12 flex flex-col gap-2">
                <p className="text-gray-900 dark:text-white font-medium">
                  {t("mnemonic.lnurl.title")}
                </p>
                <p className="text-gray-500 text-sm dark:text-neutral-500">
                  {t("mnemonic.lnurl.use_mnemonic")}
                </p>
              </div>

              <div className="w-1/5 flex-none flex justify-end items-center">
                <Toggle
                  checked={account.useMnemonicForLnurlAuth}
                  onChange={async () => {
                    // update local value
                    setAccount({
                      ...account,
                      useMnemonicForLnurlAuth: !account.useMnemonicForLnurlAuth,
                    });
                    await api.editAccount(id, {
                      useMnemonicForLnurlAuth: !account.useMnemonicForLnurlAuth,
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="relative flex py-5 mt-12 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 fw-bold">
              ⛔️ Danger Zone
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="shadow bg-white sm:rounded-md sm:overflow-hidden mb-5 px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
            {hasMnemonic && (
              <Setting
                title={t("remove_secretkey.title")}
                subtitle={t("remove_secretkey.subtitle")}
              >
                <div className="w-64">
                  <Button
                    onClick={() => {
                      removeMnemonic({
                        id: account.id,
                        name: account.name,
                      });
                    }}
                    label={t("actions.remove_secretkey")}
                    fullWidth
                  />
                </div>
              </Setting>
            )}
            <Setting title={t("remove.title")} subtitle={t("remove.subtitle")}>
              <div className="w-64">
                <Button
                  onClick={() => {
                    removeAccount({
                      id: account.id,
                      name: account.name,
                    });
                  }}
                  label={t("actions.remove_account")}
                  fullWidth
                />
              </div>
            </Setting>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default AccountDetail;
