import Button from "@components/Button";
import Container from "@components/Container";
import { PopiconsChevronRightLine, PopiconsPlusSolid } from "@popicons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Avatar from "~/app/components/Avatar";
import { useAccounts } from "~/app/context/AccountsContext";

function AccountsScreen() {
  const { accounts } = useAccounts();
  const navigate = useNavigate();

  const { t } = useTranslation("translation", {
    keyPrefix: "accounts",
  });

  return (
    <Container>
      <div className="mt-12 mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">{t("title")}</h2>
        <div>
          <Button
            icon={<PopiconsPlusSolid className="w-5 h-5 mr-2" />}
            label={t("actions.connect_a_wallet")}
            primary
            onClick={() => navigate(`/accounts/new`)}
          />
        </div>
      </div>
      <div className="shadow overflow-hidden rounded-lg">
        <table className="min-w-full">
          <tbody className="bg-white divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
            {Object.keys(accounts).map((accountId) => {
              const account = accounts[accountId];
              return (
                <tr
                  key={accountId}
                  className="cursor-pointer hover:bg-gray-50 transition duration-200 dark:hover:bg-neutral-800"
                  onClick={() => navigate(`/accounts/${accountId}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        name={account.id}
                        size={48}
                        url={account.avatarUrl}
                      />

                      <div className="ml-4">
                        <h3 className="font-medium dark:text-white break-all whitespace-normal max-w-xs md:max-w-lg xl:max-w-2xl">
                          {account.name}
                        </h3>
                        <p className="text-gray-600 dark:text-neutral-400">
                          {account.connector}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="w-10">
                    <PopiconsChevronRightLine className="h-6 w-6 text-gray-600 dark:text-neutral-400" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

export default AccountsScreen;
