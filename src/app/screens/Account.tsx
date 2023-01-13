import { ExportIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import {
  CrossIcon,
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import Button from "@components/Button";
import Container from "@components/Container";
import Loading from "@components/Loading";
import PublisherCard from "@components/PublisherCard";
import Setting from "@components/Setting";
import Input from "@components/form/Input";
import TextField from "@components/form/TextField";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Modal from "react-modal";
import QRCode from "react-qr-code";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import { useSettings } from "~/app/context/SettingsContext";
import api, { GetAccountRes } from "~/common/lib/api";
import msg from "~/common/lib/msg";
import nostrlib from "~/common/lib/nostr";
import type { Account } from "~/types";

type AccountAction = Omit<Account, "connector" | "config" | "nostrPrivateKey">;
dayjs.extend(relativeTime);

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Acc%3D%22http%3A%2F%2Fcreativecommons.org%2Fns%23%22%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2050%2050%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cmetadata%3E%3Crdf%3ARDF%3E%3Ccc%3AWork%3E%3Cdc%3Aformat%3Eimage%2Fsvg%2Bxml%3C%2Fdc%3Aformat%3E%3Cdc%3Atype%20rdf%3Aresource%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Fdcmitype%2FStillImage%22%2F%3E%3Cdc%3Atitle%3EJdenticon%3C%2Fdc%3Atitle%3E%3Cdc%3Acreator%3E%3Ccc%3AAgent%3E%3Cdc%3Atitle%3EDaniel%20Mester%20Pirttij%C3%A4rvi%3C%2Fdc%3Atitle%3E%3C%2Fcc%3AAgent%3E%3C%2Fdc%3Acreator%3E%3Cdc%3Asource%3Ehttps%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%3C%2Fdc%3Asource%3E%3Ccc%3Alicense%20rdf%3Aresource%3D%22https%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%2Fblob%2Fmaster%2FLICENSE%22%2F%3E%3C%2Fcc%3AWork%3E%3C%2Frdf%3ARDF%3E%3C%2Fmetadata%3E%3Crect%20fill%3D%22transparent%22%20width%3D%2250%22%20height%3D%2250%22%20x%3D%220%22%20y%3D%220%22%2F%3E%3Cpath%20fill%3D%22%23329948%22%20d%3D%22M13%2013L13%201L25%201ZM25%201L37%201L37%2013ZM37%2037L37%2049L25%2049ZM25%2049L13%2049L13%2037ZM1%2025L1%2013L13%2013ZM37%2013L49%2013L49%2025ZM49%2025L49%2037L37%2037ZM13%2037L1%2037L1%2025Z%22%2F%3E%3Cpath%20fill%3D%22%2366cc7b%22%20d%3D%22M1%2013L1%201L13%201ZM37%201L49%201L49%2013ZM49%2037L49%2049L37%2049ZM13%2049L1%2049L1%2037ZM13%2013L25%2013L25%2025L13%2025ZM16%2020.5L20.5%2025L25%2020.5L20.5%2016ZM37%2013L37%2025L25%2025L25%2013ZM29.5%2016L25%2020.5L29.5%2025L34%2020.5ZM37%2037L25%2037L25%2025L37%2025ZM34%2029.5L29.5%2025L25%2029.5L29.5%2034ZM13%2037L13%2025L25%2025L25%2037ZM20.5%2034L25%2029.5L20.5%2025L16%2029.5Z%22%2F%3E%3C%2Fsvg%3E";

function AccountScreen() {
  const auth = useAccount();
  const { accounts, getAccounts } = useAccounts();
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts",
  });
  const { t: tSettings } = useTranslation("translation", {
    keyPrefix: "settings",
  });
  const { isLoading: isLoadingSettings } = useSettings();

  const hasFetchedData = useRef(false);
  const [account, setAccount] = useState<GetAccountRes>();
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const [lndHubData, setLndHubData] = useState({
    login: "",
    password: "",
    url: "",
    lnAddress: "",
  });
  const [accountName, setAccountName] = useState("");
  const [nostrPrivateKey, setNostrPrivateKey] = useState("");
  const [nostrPrivateKeyVisible, setNostrPrivateKeyVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportModalIsOpen, setExportModalIsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (id) {
        const response = await msg.request<GetAccountRes>("getAccount", {
          id,
        });
        setAccount(response);
        setAccountName(response.name);
        setLoading(false);

        const priv = (await msg.request("nostr/getPrivateKey", {
          id,
        })) as string;
        if (priv) {
          setNostrPrivateKey(nostrlib.hexToNip19(priv, "nsec"));
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

  async function saveNostrPrivateKey(nostrPrivateKey: string) {
    const result = await msg.request("nostr/getPrivateKey", {
      id: account?.id,
    });
    const currentPrivateKey = result as unknown as string;

    if (nostrPrivateKey === currentPrivateKey) return;

    if (currentPrivateKey && !confirm(tSettings("nostr.private_key.warning"))) {
      return;
    }

    await msg.request("nostr/setPrivateKey", {
      id: account?.id,
      privateKey: nostrlib.normalizeToHex(nostrPrivateKey),
    });

    toast.success(tSettings("nostr.private_key.success"));
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
    /**
     * @HACK
     * @headless-ui/menu restores focus after closing a menu, to the button that opened it.
     * By slightly delaying opening the modal, react-modal's focus management won't be overruled.
     * {@link https://github.com/tailwindlabs/headlessui/issues/259}
     */
    setTimeout(() => {
      setExportModalIsOpen(true);
    }, 50);
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

  return loading ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <div className="border-b border-gray-200 dark:border-neutral-500">
        <PublisherCard
          title={account?.name || ""}
          image={DEFAULT_IMAGE || ""}
          description={account?.connector}
          isCard={false}
          isSmall={false}
        />
      </div>

      {account && (
        <Container>
          <div className="flex justify-between items-center pt-8 pb-4">
            <dl>
              <dt className="text-sm font-medium text-gray-500">
                {"Account Information"}
              </dt>
            </dl>

            {account.connector === "lndhub" && (
              <div className="flex items-center text-gray-500 hover:text-black transition-color duration-200 dark:hover:text-white">
                <ExportIcon
                  className="h-6 w-6 rotate-90 cursor-pointer"
                  onClick={() =>
                    exportAccount({
                      id: account.id,
                      name: account.name,
                    })
                  }
                />
              </div>
            )}

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
              <Setting title={"Account Name"} subtitle={""}>
                <div className="w-64">
                  <Input
                    placeholder={"Account Name"}
                    type="text"
                    value={accountName}
                    onBlur={() => {
                      updateAccountName({
                        id: account.id,
                        name: accountName,
                      });
                      const updatedAccount = account;
                      updatedAccount.name = accountName;
                      setAccount(updatedAccount);
                    }}
                    onChange={(event) => {
                      setAccountName(event.target.value);
                    }}
                  />
                </div>
              </Setting>
            </div>
            <div className="relative flex py-5 mt-5 items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 fw-bold">
                🧪 Alby Lab
              </span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <h2 className="text-2xl font-bold dark:text-white">
              {tSettings("nostr.title")}
            </h2>
            <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
              <a
                href="https://github.com/nostr-protocol/nostr"
                target="_blank"
                rel="noreferrer noopener"
                className="underline"
              >
                {tSettings("nostr.title")}
              </a>{" "}
              {tSettings("nostr.hint")}
            </p>
            <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
              <Setting
                title={tSettings("nostr.private_key.title")}
                subtitle={
                  <Trans
                    i18nKey={"nostr.private_key.subtitle"}
                    t={tSettings}
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
                }
              >
                <div className="w-96 flex justify-end">
                  <div className="w-96 flex-auto -mt-1 ml-6">
                    <TextField
                      id="nostrPrivateKey"
                      label={""}
                      type={nostrPrivateKeyVisible ? "text" : "password"}
                      value={nostrPrivateKey}
                      onBlur={() => {
                        saveNostrPrivateKey(nostrPrivateKey);
                      }}
                      onChange={(event) => {
                        setNostrPrivateKey(event.target.value);
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
                  {!nostrPrivateKey && (
                    <div className="flex-none ml-2 flex-end">
                      <Button
                        label={tSettings("nostr.private_key.generate")}
                        onClick={async () => {
                          const result = await msg.request(
                            "nostr/generatePrivateKey"
                          );
                          setNostrPrivateKey(result.privateKey as string);
                          saveNostrPrivateKey(result.privateKey as string);
                        }}
                      />
                    </div>
                  )}
                </div>
              </Setting>
            </div>

            <div className="relative flex py-5 mt-5 items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 fw-bold">
                ⛔️ Danger Zone
              </span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="shadow bg-white sm:rounded-md sm:overflow-hidden mb-5 px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
              <Setting
                title={"Remove This Account"}
                subtitle={
                  "All the linked allowances will be deleted. Please be certain."
                }
              >
                <div className="w-64">
                  <Button
                    onClick={() => {
                      removeAccount({
                        id: account.id,
                        name: account.name,
                      });
                    }}
                    label={"Remove Account"}
                    fullWidth
                    // loading={isLoading}
                    // disabled={isLoading}
                  />
                </div>
              </Setting>
            </div>
          </div>
        </Container>
      )}
    </div>
  );
}

export default AccountScreen;
