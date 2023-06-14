import {
  CaretLeftIcon,
  ExportIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import Button from "@components/Button";
import Container from "@components/Container";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import Loading from "@components/Loading";
import Setting from "@components/Setting";
import TextField from "@components/form/TextField";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import QRCode from "react-qr-code";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "~/app/components/Avatar";
import Badge from "~/app/components/Badge";
import InputCopyButton from "~/app/components/InputCopyButton";
import MenuDivider from "~/app/components/Menu/MenuDivider";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import { useSettings } from "~/app/context/SettingsContext";
import { KeyOrigin, getKeyOrigin } from "~/app/utils/getKeyOrigin";
import api, { GetAccountRes } from "~/common/lib/api";
import liquid from "~/common/lib/liquid";
import msg from "~/common/lib/msg";
import nostr from "~/common/lib/nostr";
import type { Account } from "~/types";

type AccountAction = Omit<Account, "connector" | "config" | "nostrPrivateKey">;
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
  const { id } = useParams();
  const navigate = useNavigate();

  const [lndHubData, setLndHubData] = useState({
    login: "",
    password: "",
    url: "",
    lnAddress: "",
  });
  const [accountName, setAccountName] = useState("");

  // TODO: add hooks useMnemonic, useNostrPrivateKey, ...
  const [mnemonic, setMnemonic] = useState("");
  const [nostrPrivateKey, setNostrPrivateKey] = useState("");
  const [nostrPublicKey, setNostrPublicKey] = useState("");
  const [nostrKeyOrigin, setNostrKeyOrigin] = useState<KeyOrigin>("unknown");
  const [liquidPrivateKey, setLiquidPrivateKey] = useState("");
  const [liquidPublicKey, setLiquidPublicKey] = useState("");
  const [liquidKeyOrigin, setLiquidKeyOrigin] = useState<KeyOrigin>("unknown");

  const [exportLoading, setExportLoading] = useState(false);
  const [exportModalIsOpen, setExportModalIsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const response = await msg.request<GetAccountRes>("getAccount", {
          id,
        });

        setAccount(response);
        setAccountName(response.name);

        const privLiquid = (await msg.request("liquid/getPrivateKey", {
          id,
        })) as string;
        if (privLiquid) {
          setLiquidPrivateKey(privLiquid);
        }

        const privNostr = (await msg.request("nostr/getPrivateKey", {
          id,
        })) as string;
        if (privNostr) {
          setNostrPrivateKey(privNostr);
        }

        const accountMnemonic = (await msg.request("getMnemonic", {
          id,
        })) as string;
        if (accountMnemonic) {
          setMnemonic(accountMnemonic);
        }
        if (privLiquid) {
          const keyOrigin = await getKeyOrigin(
            "liquid",
            privLiquid,
            accountMnemonic
          );
          setLiquidKeyOrigin(keyOrigin);
        }
        if (privNostr) {
          const keyOrigin = await getKeyOrigin(
            "nostr",
            privNostr,
            accountMnemonic
          );
          setNostrKeyOrigin(keyOrigin);
        }
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id]);

  function closeExportModal() {
    setExportModalIsOpen(false);
  }

  async function updateAccountName({ id, name }: AccountAction) {
    await msg.request("editAccount", {
      name,
      id,
    });

    auth.fetchAccountInfo(); // Update active account name
    getAccounts(); // update all accounts
  }

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

  async function selectAccount(accountId: string) {
    auth.setAccountId(accountId);
    await api.selectAccount(accountId);
    auth.fetchAccountInfo({ accountId });
  }

  async function removeAccount({ id, name }: AccountAction) {
    if (
      window.prompt(t("remove.confirm", { name }))?.toLowerCase() ==
      accountName.toLowerCase()
    ) {
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
    if (
      window.prompt(t("remove_secretkey.confirm", { name }))?.toLowerCase() ==
      accountName.toLowerCase()
    ) {
      await msg.request("setMnemonic", {
        id,
        mnemonic: null,
      });
      setMnemonic("");
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

  useEffect(() => {
    try {
      setLiquidPublicKey(
        liquidPrivateKey ? liquid.generatePublicKey(liquidPrivateKey) : ""
      );
    } catch (e) {
      if (e instanceof Error)
        toast.error(
          <p>
            {t("liquid.errors.failed_to_load")}
            <br />
            {e.message}
          </p>
        );
    }
  }, [liquidPrivateKey, t]);

  useEffect(() => {
    try {
      setNostrPublicKey(
        nostrPrivateKey ? nostr.generatePublicKey(nostrPrivateKey) : ""
      );
    } catch (e) {
      if (e instanceof Error)
        toast.error(
          <p>
            {t("nostr.errors.failed_to_load")}
            <br />
            {e.message}
          </p>
        );
    }
  }, [nostrPrivateKey, t]);

  return !account ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <Header
        title={t("title1")}
        headerLeft={
          <IconButton
            onClick={() => navigate("/accounts")}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      <div className="border-b border-gray-200 dark:border-neutral-500">
        <div className="flex-col justify-center p-4 flex items-center bg-white dark:bg-surface-02dp">
          <Avatar name={account.id} size={96} />
          <div className="flex flex-col overflow-hidden w-full text-center">
            <h2
              title={account.name}
              className="text-xl font-semibold dark:text-white overflow-hidden text-ellipsis whitespace-nowrap leading-1 my-2"
            >
              {account.name}
            </h2>
            <div
              title={account.connector}
              className="text-gray-500 dark:text-gray-400 mb-2 flex justify-center items-center"
            >
              {account.connector}
              {account.connector === "lndhub" && (
                <>
                  <div className="mx-2 font-black text-sm">&middot;</div>
                  <div
                    className="text-sm font-medium flex items-center text-gray-500 hover:text-black transition-color duration-200 dark:hover:text-white cursor-pointer"
                    onClick={() =>
                      exportAccount({
                        id: account.id,
                        name: account.name,
                      })
                    }
                  >
                    <p>{t("actions.export")}</p>
                    <ExportIcon className="h-6 w-6" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Container>
        <div className="flex justify-between items-center pt-8 pb-4">
          <h2 className="text-2xl font-bold dark:text-white">{t("title2")}</h2>

          <Modal
            ariaHideApp={false}
            closeTimeoutMS={200}
            isOpen={exportModalIsOpen}
            onRequestClose={closeExportModal}
            contentLabel={t("export.screen_reader")}
            overlayClassName="bg-black bg-opacity-25 fixed inset-0 flex justify-center items-center p-5"
            className="rounded-lg bg-white w-full max-w-lg"
          >
            <div className="p-5 flex justify-between dark:bg-surface-02dp">
              <h2 className="text-2xl font-bold dark:text-white">
                {t("export.title")}
              </h2>
              <button onClick={closeExportModal}>
                <CrossIcon className="w-6 h-6 dark:text-white" />
              </button>
            </div>

            {exportLoading && (
              <div className="p-5 flex justify-center items-center space-x-2 dark:text-white">
                <Loading />
                <span>{t("export.waiting")}</span>
              </div>
            )}
            {!exportLoading && (
              <div className="p-5 border-t border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-500">
                {lndHubData.lnAddress && (
                  <div className="dark:text-white mb-6">
                    <p>
                      <strong>{t("export.your_ln_address")}</strong>
                    </p>
                    {lndHubData.lnAddress && <p>{lndHubData.lnAddress}</p>}
                  </div>
                )}
                <div className="flex justify-center space-x-3 items-center dark:text-white">
                  <div className="flex-1">
                    <p>
                      <strong>{t("export.tip_mobile")}</strong>
                    </p>
                    <p>{t("export.scan_qr")}</p>
                  </div>
                  <div className="float-right">
                    <QRCode
                      value={`lndhub://${lndHubData.login}:${lndHubData.password}@${lndHubData.url}/`}
                      level="M"
                      size={130}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <TextField
                    id="uri"
                    label={t("export.export_uri")}
                    type="text"
                    readOnly
                    value={`lndhub://${lndHubData.login}:${lndHubData.password}@${lndHubData.url}/`}
                  />
                </div>
              </div>
            )}
          </Modal>
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
          {
            <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
              {t("mnemonic.description")}
            </p>
          }

          <div className="shadow bg-white sm:rounded-md sm:overflow-hidden p-6 dark:bg-surface-02dp flex flex-col gap-4">
            {mnemonic && (
              <div className="rounded-md font-medium p-4 text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900">
                {t("mnemonic.backup.warning")}
              </div>
            )}

            <div className="flex justify-between items-end">
              <div className="w-9/12">
                <p className="text-gray-900 dark:text-white font-medium">
                  {t(
                    mnemonic
                      ? "mnemonic.backup.title"
                      : "mnemonic.generate.title"
                  )}
                </p>
                <p className="text-gray-500 text-sm dark:text-neutral-500">
                  {t("mnemonic.description2")}
                </p>
              </div>

              <div className="w-1/5 flex-none">
                <Link to="secret-key/backup">
                  <Button
                    label={t(
                      mnemonic
                        ? "mnemonic.backup.button"
                        : "mnemonic.generate.button"
                    )}
                    primary
                    fullWidth
                  />
                </Link>
              </div>
            </div>
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
                {nostrPublicKey && nostrKeyOrigin !== "secret-key" && (
                  <Badge
                    label="imported"
                    color="green-bitcoin"
                    textColor="white"
                  />
                )}
              </div>

              <div className="w-1/5 flex-none">
                <Link to="nostr">
                  <Button
                    label={t("nostr.advanced_settings.label")}
                    primary
                    fullWidth
                  />
                </Link>
              </div>
            </div>
            <MenuDivider />
            <div className="flex justify-between items-end">
              <div className="w-7/12 flex items-center gap-2">
                <TextField
                  id="liquidPublicKey"
                  label={t("liquid.public_key.label")}
                  type="text"
                  value={liquidPublicKey}
                  disabled
                  endAdornment={
                    liquidPublicKey && (
                      <InputCopyButton value={liquidPublicKey} />
                    )
                  }
                />
                {liquidPublicKey && liquidKeyOrigin !== "secret-key" && (
                  <Badge
                    label="imported"
                    color="green-bitcoin"
                    textColor="white"
                  />
                )}
              </div>

              <div className="w-1/5 flex-none">
                <Link to="liquid">
                  <Button
                    label={t("liquid.advanced_settings.label")}
                    primary
                    fullWidth
                  />
                </Link>
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
            {mnemonic && (
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
