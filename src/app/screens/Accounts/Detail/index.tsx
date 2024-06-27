import Button from "@components/Button";
import Container from "@components/Container";
import Loading from "@components/Loading";
import Setting from "@components/Setting";
import TextField from "@components/form/TextField";
import {
  PopiconsCircleExclamationLine,
  PopiconsExpandLine,
} from "@popicons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "~/app/components/Alert";
import Badge from "~/app/components/Badge";
import Hyperlink from "~/app/components/Hyperlink";
import InputCopyButton from "~/app/components/InputCopyButton";
import MenuDivider from "~/app/components/Menu/MenuDivider";
import Modal from "~/app/components/Modal";
import QRCode from "~/app/components/QRCode";
import toast from "~/app/components/Toast";
import Select from "~/app/components/form/Select";
import Toggle from "~/app/components/form/Toggle";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames, isAlbyOAuthAccount } from "~/app/utils";
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
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "badge",
  });
  const { isLoading: isLoadingSettings } = useSettings();

  const hasFetchedData = useRef(false);
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();

  const { account: accountInfo } = useAccount();

  // lightning address is returned for current active account
  const lightningAddress = accountInfo?.lightningAddress || "";

  const [account, setAccount] = useState<GetAccountRes | null>(null);
  const [accountName, setAccountName] = useState("");
  const [hasMnemonic, setHasMnemonic] = useState(false);
  const [isMnemonicBackupDone, setIsMnemonicBackupDone] = useState(false);
  const [nostrPublicKey, setNostrPublicKey] = useState("");
  const [hasImportedNostrKey, setHasImportedNostrKey] = useState(false);

  const [exportLoading, setExportLoading] = useState(false);
  const [exportModalIsOpen, setExportModalIsOpen] = useState(false);
  const [lndHubData, setLndHubData] = useState({
    login: "",
    password: "",
    url: "",
    lnAddress: "",
  });

  async function exportAccount({ id, name }: AccountAction) {
    setExportLoading(true);
    setExportModalIsOpen(true);
    setLndHubData(
      await msg.request("accountDecryptedDetails", {
        name,
        id,
      })
    );
    setExportLoading(false);
  }
  function closeExportModal() {
    setExportModalIsOpen(false);
  }

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const response = await api.getAccount(id);
        setAccount(response);
        setAccountName(response.name);
        setHasMnemonic(response.hasMnemonic);
        setIsMnemonicBackupDone(response.isMnemonicBackupDone);
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
    const confirm = window
      .prompt(t("remove.confirm", { name: accountName }))
      ?.toLowerCase();
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
    <div className="mt-12">
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold dark:text-white leading-8">
                {tCommon("wallet_settings")}
              </h2>

              <p className="text-gray-600 dark:text-neutral-400 text-sm leading-5">
                {t("description")}
              </p>
            </div>

            <h2 className="text-xl font-bold dark:text-white leading-7">
              {tCommon("general")}
            </h2>
            <div className="shadow bg-white rounded-md sm:overflow-hidden p-6 dark:bg-surface-01dp flex flex-col gap-4">
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
                className="flex flex-col sm:flex-row justify-between items-center"
              >
                <div className="sm:w-7/12 w-full">
                  <TextField
                    id="name"
                    label={t("name.title")}
                    placeholder={t("name.placeholder")}
                    value={accountName}
                    onChange={(event) => {
                      setAccountName(event.target.value);
                    }}
                    required
                  />
                </div>

                <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
                  <Button
                    type="submit"
                    label={tCommon("actions.save")}
                    disabled={account.name === accountName}
                    fullWidth
                  />
                </div>
              </form>
              {/* show lnaddress setting only for OAuth accounts and active account settings */}
              {lightningAddress &&
                isAlbyOAuthAccount(account.connectorType) &&
                account.id === auth.account?.id && (
                  <>
                    <MenuDivider />
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <div className="sm:w-9/12 w-full">
                        <p className="text-gray-800 dark:text-white font-medium">
                          {t("lnaddress.title")}
                        </p>
                        <p className="text-gray-600 text-sm dark:text-neutral-400">
                          {lightningAddress}
                        </p>
                      </div>

                      <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
                        <div className="flex flex-row gap-2">
                          <Button
                            label={t("actions.change_lnaddress")}
                            iconRight={
                              <PopiconsExpandLine className="w-5 h-5" />
                            }
                            fullWidth
                            primary
                            onClick={() =>
                              window.open(
                                "https://getalby.com/lightning_addresses",
                                "_blank"
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              {account.connectorType == "lndhub" && (
                <>
                  <MenuDivider />
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="sm:w-9/12 w-full">
                      <p className="text-gray-800 dark:text-white font-medium">
                        {t("export.title")}
                      </p>
                      <p className="text-gray-600 text-sm dark:text-neutral-400">
                        <Trans
                          i18nKey={"export.description"}
                          t={t}
                          components={[
                            // eslint-disable-next-line react/jsx-key
                            <Hyperlink
                              href="https://zeusln.app"
                              target="_blank"
                              rel="noopener nofollow"
                            />,

                            // eslint-disable-next-line react/jsx-key
                            <Hyperlink
                              href="https://bluewallet.io"
                              target="_blank"
                              rel="noopener nofollow"
                            />,
                          ]}
                        />
                      </p>
                    </div>

                    <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
                      {exportAccount && account.connectorType === "lndhub" && (
                        <div className="flex flex-row gap-2">
                          <Button
                            label={t("actions.connect_mobile_wallet")}
                            iconRight={
                              <PopiconsExpandLine className="w-5 h-5" />
                            }
                            fullWidth
                            primary
                            onClick={() =>
                              exportAccount({
                                id: account.id,
                                name: account.name,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                    <Modal
                      isOpen={exportModalIsOpen}
                      close={closeExportModal}
                      contentLabel={t("export.screen_reader")}
                      title={t("export.title")}
                    >
                      {exportLoading && (
                        <div className="flex justify-center items-center space-x-2 dark:text-white">
                          <Loading />
                          <span>{t("export.waiting")}</span>
                        </div>
                      )}
                      {!exportLoading && (
                        <div className="flex flex-col gap-4 justify-center items-center dark:text-white">
                          <p>{t("export.scan_qr")}</p>
                          <div className="p-5">
                            <QRCode
                              value={`lndhub://${lndHubData.login}:${lndHubData.password}@${lndHubData.url}/`}
                              size={256}
                            />
                          </div>
                          <div className="w-full">
                            <TextField
                              id="uri"
                              label={t("export.export_uri")}
                              readOnly
                              value={`lndhub://${lndHubData.login}:${lndHubData.password}@${lndHubData.url}/`}
                            />
                          </div>
                          {lndHubData.lnAddress && (
                            <div className="w-full dark:text-white">
                              <p className="font-medium">
                                {t("export.your_ln_address")}
                              </p>
                              {lndHubData.lnAddress && (
                                <p>{lndHubData.lnAddress}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Modal>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold dark:text-white leading-7">
              {t("mnemonic.title")}
            </h2>

            <div className="shadow bg-white rounded-md sm:overflow-hidden p-6 dark:bg-surface-01dp flex flex-col gap-4">
              {hasMnemonic && !isMnemonicBackupDone && (
                <Alert type="warn">
                  <div className="flex flex-row items-center gap-2 text-sm">
                    <div className="shrink-0">
                      <PopiconsCircleExclamationLine className="w-6 h-6" />
                    </div>
                    <span>{t("mnemonic.backup.warning")}</span>
                  </div>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="sm:w-9/12 w-full">
                  <p className="text-gray-800 dark:text-white font-medium">
                    {t(
                      hasMnemonic
                        ? "mnemonic.backup.title"
                        : "mnemonic.generate.title"
                    )}
                  </p>
                  <p className="text-gray-600 text-sm dark:text-neutral-400">
                    {t(
                      hasMnemonic
                        ? "mnemonic.backup.description"
                        : "mnemonic.generate.description"
                    )}
                  </p>
                </div>

                <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
                  <Link
                    to={`secret-key/${hasMnemonic ? "backup" : "generate"}`}
                  >
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
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="sm:w-7/12 w-full">
                      <p className="text-gray-800 dark:text-white font-medium">
                        {t("mnemonic.import.title")}
                      </p>
                      <p className="text-gray-600 text-sm dark:text-neutral-400">
                        {t("mnemonic.import.description")}
                      </p>
                    </div>

                    <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
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
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="sm:w-9/12 w-full">
                  <div className="flex items-center gap-2 ">
                    <p className="text-gray-800 dark:text-white font-medium">
                      {t("nostr.public_key.label")}
                    </p>
                    {nostrPublicKey && hasImportedNostrKey && (
                      <Badge
                        label={tComponents("label.imported")}
                        className="bg-green-bitcoin text-white"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-gray-600 text-sm dark:text-neutral-400 text-ellipsis whitespace-nowrap overflow-hidden">
                      {nostrPublicKey}
                    </p>
                    {nostrPublicKey && (
                      <InputCopyButton
                        value={nostrPublicKey}
                        className="w-5 h-5"
                      />
                    )}
                  </div>
                </div>

                <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
                  <Link to="nostr/settings">
                    <Button
                      label={t("nostr.settings.label")}
                      primary
                      fullWidth
                    />
                  </Link>
                </div>
              </div>
              <MenuDivider />

              {!hasMnemonic && (
                <Alert type="info">
                  <Trans
                    i18nKey={"no_mnemonic_hint"}
                    t={t}
                    components={[
                      // eslint-disable-next-line react/jsx-key
                      <Link
                        to="secret-key/generate"
                        relative="path"
                        className="underline"
                      />,
                    ]}
                  />
                </Alert>
              )}
              <div
                className={classNames(
                  "flex flex-col gap-4",
                  !hasMnemonic && "opacity-30"
                )}
              >
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="sm:w-7/12 w-full flex flex-col">
                    <p className="text-gray-800 dark:text-white font-medium">
                      {t("network.title")}
                    </p>
                    <p className="text-gray-600 text-sm dark:text-neutral-400">
                      {t("network.subtitle")}
                    </p>
                  </div>

                  <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
                    <Select
                      name="network"
                      value={account.bitcoinNetwork}
                      onChange={async (event) => {
                        // update local value
                        setAccount({
                          ...account,
                          bitcoinNetwork: event.target
                            .value as BitcoinNetworkType,
                        });
                        await api.editAccount(id, {
                          bitcoinNetwork: event.target
                            .value as BitcoinNetworkType,
                        });
                      }}
                    >
                      <option value="bitcoin">
                        {t("network.options.bitcoin")}
                      </option>
                      <option value="testnet">
                        {t("network.options.testnet")}
                      </option>
                      <option value="regtest">
                        {t("network.options.regtest")}
                      </option>
                    </Select>
                  </div>
                </div>
                <MenuDivider />
                <div className="flex justify-between items-center">
                  <div className="w-7/12 flex flex-col">
                    <p className="text-gray-800 dark:text-white font-medium">
                      {t("mnemonic.lnurl.title")}
                    </p>
                    <p className="text-gray-600 text-sm dark:text-neutral-400">
                      {t("mnemonic.lnurl.use_mnemonic")}
                    </p>
                  </div>

                  <div className="w-1/5 flex-none flex justify-end items-center">
                    <Toggle
                      disabled={!hasMnemonic}
                      checked={account.useMnemonicForLnurlAuth}
                      onChange={async () => {
                        // update local value
                        setAccount({
                          ...account,
                          useMnemonicForLnurlAuth:
                            !account.useMnemonicForLnurlAuth,
                        });
                        await api.editAccount(id, {
                          useMnemonicForLnurlAuth:
                            !account.useMnemonicForLnurlAuth,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold dark:text-white leading-7">
              {t("danger_zone")}
            </h2>

            <div className="shadow bg-white rounded-md sm:overflow-hidden mb-5 px-6 py-2 divide-y divide-gray-200 dark:divide-neutral-700 dark:bg-surface-01dp">
              {hasMnemonic && (
                <Setting
                  title={t("remove_secretkey.title")}
                  subtitle={t("remove_secretkey.subtitle")}
                >
                  <div className="sm:w-64 flex-none w-full pt-4 sm:pt-0">
                    <Button
                      onClick={() => {
                        removeMnemonic({
                          id: account.id,
                          name: account.name,
                        });
                      }}
                      label={t("actions.remove_secretkey")}
                      fullWidth
                      destructive
                    />
                  </div>
                </Setting>
              )}
              <Setting
                title={t("remove.title")}
                subtitle={t("remove.subtitle")}
              >
                <div className="sm:w-64 flex-none w-full pt-4 sm:pt-0">
                  <Button
                    onClick={() => {
                      removeAccount({
                        id: account.id,
                        name: account.name,
                      });
                    }}
                    label={t("actions.disconnect_wallet")}
                    fullWidth
                    destructive
                  />
                </div>
              </Setting>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default AccountDetail;
