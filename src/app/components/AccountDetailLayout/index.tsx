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
        headerLeft={
          <IconButton
            onClick={back}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      >
        {account && (
          <div className="flex-row justify-center space-x-2 flex items-center">
            <Avatar
              size={24}
              url={account?.avatarUrl}
              name={account?.id || ""}
            />
            <h2
              title={account.name}
              className="text-xl font-semibold dark:text-white overflow-hidden text-ellipsis whitespace-nowrap my-2"
            >
              {account.name}
            </h2>
            <span>/</span>
            <span className="text-ellipsis whitespace-nowrap overflow-hidden">
              {t("title1")}
            </span>
          </div>
        )}
      </Header>
      <Outlet />
    </>
  );
}

export default AccountDetailLayout;
