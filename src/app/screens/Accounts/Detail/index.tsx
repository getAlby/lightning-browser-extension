import {
  CaretLeftIcon,
  CopyIcon as CopyFilledIcon,
  ExportIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import {
  CopyIcon,
  CrossIcon,
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
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
import { Trans, useTranslation } from "react-i18next";
import Modal from "react-modal";
import QRCode from "react-qr-code";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "~/app/components/Avatar";
import Badge from "~/app/components/Badge";
import MenuDivider from "~/app/components/Menu/MenuDivider";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import { useSettings } from "~/app/context/SettingsContext";
import api, { GetAccountRes } from "~/common/lib/api";
import msg from "~/common/lib/msg";
import nostrlib from "~/common/lib/nostr";
import Nostr from "~/extension/background-script/nostr";
import type { Account } from "~/types";

type AccountAction = Omit<Account, "connector" | "config" | "nostrPrivateKey">;
dayjs.extend(relativeTime);

// TODO: replace with checking account
const SECRET_KEY_EXISTS = false;

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

  const [currentPrivateKey, setCurrentPrivateKey] = useState("");
  const [nostrPrivateKey, setNostrPrivateKey] = useState("");
  const [nostrPublicKey, setNostrPublicKey] = useState("");
  const [nostrKeyOrigin, setNostrKeyOrigin] = useState<"derived" | "unknown">(
    "unknown"
  );
  const [nostrPrivateKeyVisible, setNostrPrivateKeyVisible] = useState(false);
  const [privateKeyCopyLabel, setPrivateKeyCopyLabel] = useState(
    tCommon("actions.copy") as string
  );
  const [publicKeyCopied, setPublicKeyCopied] = useState(false);

  const [exportLoading, setExportLoading] = useState(false);
  const [exportModalIsOpen, setExportModalIsOpen] = useState(false);
  const [nostrKeyModalIsOpen, setNostrKeyModalIsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const response = await msg.request<GetAccountRes>("getAccount", {
          id,
        });
        // for backwards compatibility
        // TODO: remove. if you ask when, then it's probably now.
        if (!response.id) {
          response.id = id;
        }
        setAccount(response);
        setAccountName(response.name);

        const priv = (await msg.request("nostr/getPrivateKey", {
          id,
        })) as string;
        if (priv) {
          setCurrentPrivateKey(priv);
        }
        const keyOrigin = (await msg.request("nostr/getKeyOrigin", {
          id,
        })) as FixMe;
        setNostrKeyOrigin(keyOrigin);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id]);

  function closeExportModal() {
    setExportModalIsOpen(false);
  }

  function closeNostrKeyModal() {
    setNostrKeyModalIsOpen(false);
  }

  function generatePublicKey(priv: string) {
    const nostr = new Nostr(priv);
    const pubkeyHex = nostr.getPublicKey();
    return nostrlib.hexToNip19(pubkeyHex, "npub");
  }

  async function generateNostrPrivateKey(random?: boolean) {
    const selectedAccount = await auth.fetchAccountInfo();

    if (!random && selectedAccount?.id !== id) {
      alert(
        `Please match the account in the account dropdown at the top with this account to derive keys.`
      );
      closeNostrKeyModal();
      return;
    }
    // check with current selected account
    const result = await msg.request(
      "nostr/generatePrivateKey",
      random
        ? {
            type: "random",
          }
        : undefined
    );
    saveNostrPrivateKey(result.privateKey as string);
    closeNostrKeyModal();
  }

  async function saveNostrPrivateKey(nostrPrivateKey: string) {
    nostrPrivateKey = nostrlib.normalizeToHex(nostrPrivateKey);

    if (nostrPrivateKey === currentPrivateKey) return;

    if (
      currentPrivateKey &&
      prompt(t("nostr.private_key.warning"))?.toLowerCase() !==
        account?.name?.toLowerCase()
    ) {
      toast.error(t("nostr.private_key.failed_to_remove"));
      return;
    }

    try {
      if (!account) {
        // type guard
        throw new Error("No account available");
      }

      if (nostrPrivateKey) {
        // Validate the private key before saving
        generatePublicKey(nostrPrivateKey);
        nostrlib.hexToNip19(nostrPrivateKey, "nsec");

        await msg.request("nostr/setPrivateKey", {
          id: account.id,
          privateKey: nostrPrivateKey,
        });
        toast.success(t("nostr.private_key.success"));
      } else {
        await msg.request("nostr/removePrivateKey", {
          id: account.id,
        });
        toast.success(t("nostr.private_key.successfully_removed"));
      }

      setCurrentPrivateKey(nostrPrivateKey);
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
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
    if (window.confirm(t("remove.confirm", { name }))) {
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
      setNostrPublicKey(
        currentPrivateKey ? generatePublicKey(currentPrivateKey) : ""
      );
      setNostrPrivateKey(
        currentPrivateKey ? nostrlib.hexToNip19(currentPrivateKey, "nsec") : ""
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
  }, [currentPrivateKey, t]);

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
            {/*t("nostr.title")*/}Secret Key
          </h2>
          {
            <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
              {/*t("nostr.hint")*/}Your Account Secret Key allows you to use
              Alby to interact with protocols such as Nostr or Oridinals.
            </p>
          }

          <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 dark:bg-surface-02dp flex flex-col gap-4">
            {SECRET_KEY_EXISTS && (
              <div className="rounded-md font-medium p-4 text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900">
                {/*t("nostr.private_key.backup")*/}⚠️ Backup your Secret Key!
                Not backing it up might result in permanently loosing access to
                your Nostr identity or purchased Oridinals.
              </div>
            )}

            <div className="flex justify-between items-end">
              <div className="w-9/12">
                <p className="font-medium">
                  {SECRET_KEY_EXISTS
                    ? "Backup your Secret Key"
                    : "Generate your Secret Key"}
                </p>
                <p className="text-gray-500 text-sm">
                  Your Secret Key is a set of 12 words that will allow you to
                  access your keys to protocols such as Nostr or Oridinals on a
                  new device or in case you loose access to your account.
                </p>
              </div>

              <div className="w-1/5 flex-none">
                <Link to="secret-key/backup">
                  <Button
                    label={
                      /*tCommon("actions.save")*/ SECRET_KEY_EXISTS
                        ? "Generate Secret Key"
                        : "Backup Secret Key"
                    }
                    primary
                    fullWidth
                  />
                </Link>
              </div>
            </div>
            <MenuDivider />
            <div className="flex justify-between items-end">
              <div className="w-7/12">
                <p className="font-medium">
                  {/*tCommon("actions.save")*/}Import a Secret Key
                </p>
                <p className="text-gray-500 text-sm">
                  {/*tCommon("actions.save")*/}Use an existing Secret Key to
                  recover your derived keys.
                </p>
              </div>

              <div className="w-1/5 flex-none">
                <Link to="secret-key/import">
                  <Button
                    label={/*tCommon("actions.save")*/ "Import Secret Key"}
                    primary
                    fullWidth
                  />
                </Link>
              </div>
            </div>
            <MenuDivider />
            <div className="mb-4 flex justify-between items-end">
              <div className="w-9/12 flex items-center gap-2">
                <TextField
                  id="nostrPublicKey"
                  label={t("nostr.public_key.label")}
                  type="text"
                  value={nostrPublicKey}
                  disabled
                  endAdornment={
                    <Button
                      icon={
                        !publicKeyCopied ? (
                          <CopyIcon className="w-6 h-6 mx-2" />
                        ) : (
                          <CopyFilledIcon className="w-6 h-6 mx-2" />
                        )
                      }
                      label=""
                      onClick={async () => {
                        try {
                          navigator.clipboard.writeText(nostrPublicKey);
                          setPublicKeyCopied(true);
                          setTimeout(() => {
                            setPublicKeyCopied(false);
                          }, 1000);
                        } catch (e) {
                          if (e instanceof Error) {
                            toast.error(e.message);
                          }
                        }
                      }}
                      fullWidth
                    />
                  }
                />
                <Badge
                  label={nostrKeyOrigin}
                  color="green-bitcoin"
                  textColor="white"
                />
              </div>

              <div className="w-1/5 flex-none">
                <Button
                  label={/*tCommon("actions.save")*/ "Advanced Settings"}
                  primary
                  fullWidth
                  onClick={() => setNostrKeyModalIsOpen(true)}
                />
              </div>
            </div>
          </div>

          <h2 className="text-2xl mt-12 font-bold dark:text-white">
            {t("nostr.title")}
          </h2>
          <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
            <a
              href="https://github.com/nostr-protocol/nostr"
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              {t("nostr.title")}
            </a>{" "}
            {t("nostr.hint")}
          </p>
          <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 dark:bg-surface-02dp">
            <div className="py-4 flex justify-between items-center">
              <div>
                <span className="text-gray-900 dark:text-white font-medium">
                  {t("nostr.private_key.title")}
                </span>
                <p className="text-gray-500 mr-1 dark:text-neutral-500 text-sm">
                  <Trans
                    i18nKey={"nostr.private_key.subtitle"}
                    t={t}
                    components={[
                      // eslint-disable-next-line react/jsx-key
                      <a
                        className="underline"
                        target="_blank"
                        rel="noreferrer noopener"
                        href="https://guides.getalby.com/overall-guide/alby-browser-extension/features/nostr"
                      ></a>,
                    ]}
                  />
                </p>
              </div>
              <div className="w-1/5 flex-none ml-6">
                <Button
                  label={t("nostr.actions.generate")}
                  onClick={() => setNostrKeyModalIsOpen(true)}
                  fullWidth
                />
              </div>
            </div>
            <div className="rounded-md font-medium p-4 mb-4 text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900">
              {t("nostr.private_key.backup")}
            </div>
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                saveNostrPrivateKey(nostrPrivateKey);
              }}
              className="mb-4 flex justify-between items-end"
            >
              <div className="w-7/12">
                <TextField
                  id="nostrPrivateKey"
                  label={t("nostr.private_key.label")}
                  type={nostrPrivateKeyVisible ? "text" : "password"}
                  value={nostrPrivateKey}
                  onChange={(event) => {
                    setNostrPrivateKey(event.target.value.trim());
                  }}
                  endAdornment={
                    <button
                      type="button"
                      tabIndex={-1}
                      className="flex justify-center items-center w-10 h-8"
                      onClick={() => {
                        setNostrPrivateKeyVisible(!nostrPrivateKeyVisible);
                      }}
                    >
                      {nostrPrivateKeyVisible ? (
                        <HiddenIcon className="h-6 w-6" />
                      ) : (
                        <VisibleIcon className="h-6 w-6" />
                      )}
                    </button>
                  }
                />
              </div>
              <div className="w-1/5 flex-none mx-4">
                <Button
                  icon={<CopyIcon className="w-6 h-6 mr-2" />}
                  label={privateKeyCopyLabel}
                  onClick={async () => {
                    try {
                      navigator.clipboard.writeText(nostrPrivateKey);
                      setPrivateKeyCopyLabel(tCommon("copied"));
                      setTimeout(() => {
                        setPrivateKeyCopyLabel(tCommon("actions.copy"));
                      }, 1000);
                    } catch (e) {
                      if (e instanceof Error) {
                        toast.error(e.message);
                      }
                    }
                  }}
                  fullWidth
                />
              </div>
              <div className="w-1/5 flex-none">
                <Button
                  type="submit"
                  label={tCommon("actions.save")}
                  disabled={
                    nostrlib.normalizeToHex(nostrPrivateKey) ===
                    currentPrivateKey
                  }
                  primary
                  fullWidth
                />
              </div>
            </form>

            <div className="mb-4 flex justify-between items-end">
              <div className="w-7/12">
                <TextField
                  id="nostrPublicKey"
                  label={t("nostr.public_key.label")}
                  type="text"
                  value={nostrPublicKey}
                  disabled
                />
              </div>

              <div className="w-1/5 flex-none d-none"></div>
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

          <Modal
            ariaHideApp={false}
            closeTimeoutMS={200}
            isOpen={nostrKeyModalIsOpen}
            onRequestClose={closeNostrKeyModal}
            contentLabel={t("nostr.generate_keys.screen_reader")}
            overlayClassName="bg-black bg-opacity-25 fixed inset-0 flex justify-center items-center p-5"
            className="rounded-lg bg-white w-full max-w-lg"
          >
            <div className="p-5 flex justify-between dark:bg-surface-02dp">
              <h2 className="text-2xl font-bold dark:text-white">
                {t("nostr.generate_keys.title")}
              </h2>
              <button onClick={closeNostrKeyModal}>
                <CrossIcon className="w-6 h-6 dark:text-white" />
              </button>
            </div>
            <div className="p-5 border-t border-b dark:text-white border-gray-200 dark:bg-surface-02dp dark:border-neutral-500">
              <Trans
                i18nKey={"nostr.generate_keys.hint"}
                t={t}
                components={[
                  // eslint-disable-next-line react/jsx-key
                  <a
                    className="underline"
                    target="_blank"
                    rel="noreferrer noopener"
                    href="https://guides.getalby.com/overall-guide/alby-browser-extension/features/nostr"
                  ></a>,
                ]}
              />
            </div>
            <div className="p-4 dark:bg-surface-02dp">
              <div className="flex flex-row justify-between">
                <Button
                  type="submit"
                  onClick={() => generateNostrPrivateKey(true)}
                  label={t("nostr.generate_keys.actions.random_keys")}
                  primary
                  halfWidth
                />
                <Button
                  type="submit"
                  onClick={() => generateNostrPrivateKey()}
                  label={t("nostr.generate_keys.actions.derived_keys")}
                  halfWidth
                />
              </div>
            </div>
          </Modal>
        </div>
      </Container>
    </div>
  );
}

export default AccountDetail;
