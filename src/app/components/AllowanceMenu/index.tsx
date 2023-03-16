import { GearIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import Setting from "@components/Setting";
import Toggle from "@components/form/Toggle";
import type { FormEvent } from "react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import msg from "~/common/lib/msg";
import type { Allowance, Permission } from "~/types";

import Button from "../Button";
import Menu from "../Menu";
import DualCurrencyField from "../form/DualCurrencyField/index";

export type Props = {
  allowance: Pick<Allowance, "id" | "totalBudget" | "lnurlAuth">;
  onEdit?: () => void;
  onDelete?: () => void;
};

function AllowanceMenu({ allowance, onEdit, onDelete }: Props) {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
  } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;
  const { account } = useAccount();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [budget, setBudget] = useState("");
  const [lnurlAuth, setLnurlAuth] = useState(false);
  const [fiatAmount, setFiatAmount] = useState("");

  const [originalPermissions, setOriginalPermissions] = useState<
    Permission[] | null
  >(null);
  const [permissions, setPermissions] = useState<Permission[] | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  const { t } = useTranslation("components", { keyPrefix: "allowance_menu" });
  const { t: tCommon } = useTranslation("common");
  const { t: tPermissions } = useTranslation("permissions");

  const hasPermissions = !isLoadingPermissions && !!permissions?.length;

  const enableSubmit =
    parseInt(budget || "0") !== allowance.totalBudget ||
    lnurlAuth !== allowance.lnurlAuth ||
    getChangedPermissionsIds().length;

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const permissionResponse = await msg.request<{
          permissions: Permission[];
        }>("listPermissions", {
          id: allowance.id,
          accountId: account?.id,
        });

        const permissions: Permission[] = permissionResponse?.permissions;

        setOriginalPermissions(permissions);
        setPermissions(permissions);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(e.message);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [account?.id, allowance.id]);

  useEffect(() => {
    if (budget !== "" && showFiat) {
      const getFiat = async () => {
        const res = await getFormattedFiat(budget);
        setFiatAmount(res);
      };

      getFiat();
    }
  }, [budget, showFiat, getFormattedFiat]);

  function openModal() {
    setBudget(allowance.totalBudget.toString());
    setLnurlAuth(allowance.lnurlAuth);
    /**
     * @HACK
     * @headless-ui/menu restores focus after closing a menu, to the button that opened it.
     * By slightly delaying opening the modal, react-modal's focus management won't be overruled.
     * {@link https://github.com/tailwindlabs/headlessui/issues/259}
     */
    setTimeout(() => {
      setIsOpen(true);
    }, 50);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function getChangedPermissionsIds(): number[] {
    if (!permissions || !originalPermissions) return [];
    const ids = permissions
      .filter((prm, i) => prm.enabled !== originalPermissions[i].enabled)
      .map((prm) => prm.id);
    return ids;
  }

  async function updateAllowance() {
    try {
      await msg.request("updateAllowance", {
        id: allowance.id,
        totalBudget: parseInt(budget || "0"),
        lnurlAuth,
      });

      const changedIds = getChangedPermissionsIds();

      if (changedIds.length) {
        await msg.request("deletePermissionsById", {
          ids: changedIds,
          accountId: account?.id,
        });
      }

      /* DB is updated, let´s update the original permissions
      to the updated permission in local state too */
      setOriginalPermissions(permissions);

      onEdit && onEdit();
      closeModal();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center text-gray-500 hover:text-black transition-color duration-200 dark:hover:text-white">
          <GearIcon className="h-6 w-6" />
        </Menu.Button>
        <Menu.List position="right">
          <Menu.ItemButton onClick={openModal}>
            {tCommon("actions.edit")}
          </Menu.ItemButton>
          <Menu.ItemButton
            danger
            onClick={async () => {
              if (window.confirm(t("confirm_delete"))) {
                try {
                  await msg.request("deleteAllowance", {
                    id: allowance.id,
                  });
                  onDelete && onDelete();
                } catch (e) {
                  console.error(e);
                  if (e instanceof Error) toast.error(`Error: ${e.message}`);
                }
              }
            }}
          >
            {tCommon("actions.delete")}
          </Menu.ItemButton>
        </Menu.List>
      </Menu>

      <Modal
        ariaHideApp={false}
        closeTimeoutMS={200}
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={t("edit_allowance.screen_reader")}
        overlayClassName="bg-black bg-opacity-25 fixed inset-0 flex justify-center items-center p-5"
        className="rounded-lg bg-white w-full max-w-lg"
        style={{ content: { maxHeight: "90vh" } }}
      >
        <div className="p-5 flex justify-between dark:bg-surface-02dp">
          <h2 className="text-2xl font-bold dark:text-white">
            {t("edit_allowance.title")}
          </h2>
          <button onClick={closeModal}>
            <CrossIcon className="w-6 h-6 dark:text-white" />
          </button>
        </div>

        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            updateAllowance();
          }}
        >
          <div
            style={{ maxHeight: "calc(90vh - 154px)", overflowY: "auto" }}
            className="p-5 border-t border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-500"
          >
            <div className="pb-4 border-b border-gray-200 dark:border-neutral-500">
              <DualCurrencyField
                id="budget"
                label={t("new_budget.label")}
                min={0}
                autoFocus
                placeholder={tCommon("sats", { count: 0 })}
                value={budget}
                hint={t("hint")}
                fiatValue={fiatAmount}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div
              className={
                hasPermissions
                  ? "pb-4 border-b border-gray-200 dark:border-neutral-500"
                  : ""
              }
            >
              <Setting
                title={t("enable_login.title")}
                subtitle={t("enable_login.subtitle")}
              >
                <Toggle
                  checked={lnurlAuth}
                  onChange={() => setLnurlAuth(!lnurlAuth)}
                />
              </Setting>
            </div>

            {hasPermissions && (
              <div>
                <h2 className="pt-4 text-lg text-gray-900 font-bold dark:text-white">
                  {t("edit_permissions")}
                </h2>
                <div>
                  {permissions.map((permission) => (
                    <Fragment key={permission.id}>
                      <Setting
                        title={permission.method}
                        subtitle={tPermissions(
                          permission.method
                            .toLowerCase()
                            .split("/")
                            .slice(-2)
                            .join(".") as unknown as TemplateStringsArray
                        )}
                        /* split the method at "/", take the last two items in
                        the array and join them with "." to get the i18n string
                        webln/lnd/getinfo -> lnd.getinfo
                        nostr/nip04decrypt --> nostr.nip04decrypt */
                      >
                        <Toggle
                          checked={permission.enabled}
                          onChange={() => {
                            setPermissions(
                              permissions.map((prm) =>
                                prm.id === permission.id
                                  ? { ...prm, enabled: !prm.enabled }
                                  : prm
                              )
                            );
                          }}
                        />
                      </Setting>
                    </Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end p-5 dark:bg-surface-02dp">
            <Button
              type="submit"
              label={tCommon("actions.save")}
              primary
              disabled={!enableSubmit}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}

export default AllowanceMenu;
