import {
  CaretLeftIcon,
  CrossIcon,
  ExportIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import QRCode from "react-qr-code";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import Avatar from "~/app/components/Avatar";
import Loading from "~/app/components/Loading";
import TextField from "~/app/components/form/TextField";
import api, { GetAccountRes } from "~/common/lib/api";
import msg from "~/common/lib/msg";
import { Account } from "~/types";

type AccountAction = Pick<Account, "id" | "name">;

function AccountDetailLayout() {
  const navigate = useNavigate();

  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view",
  });
  const [account, setAccount] = useState<GetAccountRes>();
  const { id } = useParams() as { id: string };
  const [exportLoading, setExportLoading] = useState(false);
  const [exportModalIsOpen, setExportModalIsOpen] = useState(false);
  const [lndHubData, setLndHubData] = useState({
    login: "",
    password: "",
    url: "",
    lnAddress: "",
  });

  useEffect(() => {
    (async () => {
      const account = await api.getAccount(id);
      setAccount(account);
    })();
  }, [id]);

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

  return (
    <>
      <Header
        title={t("title1")}
        headerLeft={
          <IconButton
            onClick={() => navigate(-1)}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      {account && (
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
                title={account.connectorType}
                className="text-gray-500 dark:text-gray-400 mb-2 flex justify-center items-center"
              >
                {account.connectorType}
                {exportAccount && account.connectorType === "lndhub" && (
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
      )}
      <Outlet />
    </>
  );
}

export default AccountDetailLayout;
