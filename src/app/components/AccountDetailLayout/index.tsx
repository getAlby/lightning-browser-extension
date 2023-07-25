import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import { useTranslation } from "react-i18next";
import { Outlet, useMatch, useNavigate, useParams } from "react-router-dom";
import Avatar from "~/app/components/Avatar";
import { useAccounts } from "~/app/context/AccountsContext";

function AccountDetailLayout() {
  const navigate = useNavigate();
  const isRoot = useMatch("accounts/:id");
  const { accounts } = useAccounts();
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view",
  });
  const { id } = useParams() as { id: string };

  function back() {
    if (isRoot) {
      navigate("/accounts");
    } else {
      navigate(`/accounts/${id}`);
    }
  }

  const account = accounts[id];

  return (
    <>
      <Header
        title={t("title1")}
        headerLeft={
          <IconButton
            onClick={back}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      {account && (
        <div className="border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-surface-01dp p-4">
          <div className="flex-row justify-center  space-x-2 flex items-center">
            <Avatar
              size={32}
              url={account?.avatarUrl}
              name={account?.id || ""}
            />
            <h2
              title={account.name}
              className="text-xl font-semibold dark:text-white overflow-hidden text-ellipsis whitespace-nowrap leading-1 my-2"
            >
              {account.name}
            </h2>
          </div>
          <div className="flex-row justify-center flex items-center text-gray-500 text-sm dark:text-neutral-500">
            {account.connector}
          </div>
        </div>
      )}
      <Outlet />
    </>
  );
}

export default AccountDetailLayout;
