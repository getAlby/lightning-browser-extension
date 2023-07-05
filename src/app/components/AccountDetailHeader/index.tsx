import {
  CaretLeftIcon,
  ExportIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Avatar from "@components/Avatar";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GetAccountRes } from "~/common/lib/api";
import { Account } from "~/types";

type AccountAction = Pick<Account, "id" | "name">;

type Props = {
  account: GetAccountRes;
  exportAccount?: ({ id, name }: AccountAction) => void;
};
function AccountDetailHeader({ account, exportAccount }: Props) {
  const navigate = useNavigate();

  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view",
  });

  return (
    <>
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
              {exportAccount && account.connector === "lndhub" && (
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
    </>
  );
}

export default AccountDetailHeader;
