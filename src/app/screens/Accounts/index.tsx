import {
  EllipsisIcon,
  PlusIcon,
  WalletIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import type { FormEvent } from "react";
import { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import api from "../../../common/lib/api";
import utils from "../../../common/lib/utils";
import type { Account } from "../../../types";
import Button from "../../components/Button";
import Container from "../../components/Container";
import TextField from "../../components/Form/TextField";
import Menu from "../../components/Menu";
import { useAccounts } from "../../context/AccountsContext";
import { useAuth } from "../../context/AuthContext";

type AccountAction = Omit<Account, "connector" | "config">;

function AccountsScreen() {
  const auth = useAuth();
  const { accounts, getAccounts } = useAccounts();
  const navigate = useNavigate();

  const [currentAccountId, setCurrentAccountId] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");

  function closeModal() {
    setModalIsOpen(false);
  }

  async function selectAccount(accountId: string) {
    auth.setAccountId(accountId);
    await api.selectAccount(accountId);
    auth.fetchAccountInfo(accountId);
  }

  async function updateAccountName({ id, name }: AccountAction) {
    await utils.call("editAccount", {
      name,
      id,
    });

    getAccounts();
    closeModal();
  }

  async function removeAccount({ id, name }: AccountAction) {
    if (window.confirm(`Are you sure you want to delete account: ${name}?`)) {
      let nextAccountId;
      let accountIds = Object.keys(accounts);
      if (auth.account?.id === id && accountIds.length > 1) {
        nextAccountId = accountIds.filter((accountId) => accountId !== id)[0];
      }

      await api.deleteAccount(id);
      accountIds = accountIds.filter((accountId) => accountId !== id);

      if (accountIds.length > 0) {
        getAccounts();
        if (nextAccountId) selectAccount(nextAccountId);
      } else {
        window.close();
      }
    }
  }

  return (
    <Container>
      <h2 className="mt-12 mb-6 text-2xl font-bold dark:text-white">
        Accounts
      </h2>
      <div className="shadow border-b border-gray-200 dark:border-gray-500 sm:rounded-lg bg-white dark:bg-gray-800">
        <div className="p-6">
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            label="Add account"
            primary
            onClick={() => navigate(`/accounts/new`)}
          />
        </div>
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-200">
            {Object.keys(accounts).map((accountId) => {
              const account = accounts[accountId];
              return (
                <tr key={accountId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex justify-center items-center rounded-full bg-orange-bitcoin-50">
                        <WalletIcon className="w-8 h-8 text-black" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {account.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {account.connector}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Menu as="div" className="relative">
                      <Menu.Button className="ml-auto flex items-center text-gray-500 hover:text-black transition-color duration-200 dark:hover:text-white">
                        <EllipsisIcon className="h-6 w-6 rotate-90" />
                      </Menu.Button>

                      <Menu.List position="right">
                        <Menu.ItemButton
                          onClick={() => {
                            setCurrentAccountId(accountId);
                            setNewAccountName(account.name);
                            setModalIsOpen(true);
                          }}
                        >
                          Edit
                        </Menu.ItemButton>

                        <Menu.ItemButton
                          onClick={() =>
                            removeAccount({
                              id: accountId,
                              name: account.name,
                            })
                          }
                        >
                          Delete
                        </Menu.ItemButton>
                      </Menu.List>
                    </Menu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Modal
          closeTimeoutMS={200}
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit account name"
          overlayClassName="bg-black bg-opacity-25 fixed inset-0 flex justify-center items-center p-5"
          className="rounded-lg bg-white w-full max-w-lg"
        >
          <div className="p-5 flex justify-between dark:bg-gray-800">
            <h2 className="text-2xl font-bold dark:text-white">Edit account</h2>
            <button onClick={closeModal}>
              <CrossIcon className="w-6 h-6 dark:text-white" />
            </button>
          </div>

          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              updateAccountName({
                id: currentAccountId,
                name: newAccountName,
              });
            }}
          >
            <div className="p-5 border-t border-b border-gray-200 dark:bg-gray-800 dark:border-gray-500">
              <div className="w-60">
                <TextField
                  autoFocus
                  id="acountName"
                  label="Name"
                  onChange={(e) => setNewAccountName(e.target.value)}
                  value={newAccountName}
                />
              </div>
            </div>

            <div className="flex justify-end p-5 dark:bg-gray-800">
              <Button
                label="Save"
                type="submit"
                primary
                disabled={newAccountName === ""}
              />
            </div>
          </form>
        </Modal>
      </div>
    </Container>
  );
}

export default AccountsScreen;
