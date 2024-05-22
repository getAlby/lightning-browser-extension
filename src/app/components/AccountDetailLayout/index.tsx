import Header from "@components/Header";
import IconButton from "@components/IconButton";
import { PopiconsChevronLeftLine } from "@popicons/react";
import { useTranslation } from "react-i18next";
import { Outlet, useMatch, useNavigate, useParams } from "react-router-dom";
import Avatar from "~/app/components/Avatar";
import { useAccounts } from "~/app/context/AccountsContext";

function AccountDetailLayout() {
  const navigate = useNavigate();
  const isRoot = useMatch("accounts/:id");
  const { accounts } = useAccounts();

  const { t: tCommon } = useTranslation("common");
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
            icon={<PopiconsChevronLeftLine className="w-5 h-5" />}
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
              {tCommon("wallet_settings")}
            </span>
          </div>
        )}
      </Header>
      <Outlet />
    </>
  );
}

export default AccountDetailLayout;
