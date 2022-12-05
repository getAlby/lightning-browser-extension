import { GearIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import Loading from "@components/Loading";
import Setting from "@components/Setting";
import Checkbox from "@components/form/Checkbox";
import Toggle from "@components/form/Toggle";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";
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

  const hasPermissions = !isLoadingPermissions && !!permissions?.length;
  const isEmptyPermissions = !isLoadingPermissions && permissions?.length === 0;

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const permissionResponse = await msg.request<{
          permissions: Permission[];
        }>("listPermissions", {
          id: allowance.id,
        });

        const permissions: Permission[] = permissionResponse.permissions;

        setOriginalPermissions(permissions);
        setPermissions(permissions);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(e.message);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    !permissions && fetchPermissions();

    if (budget !== "" && showFiat) {
      const getFiat = async () => {
        const res = await getFormattedFiat(budget);
        setFiatAmount(res);
      };

      getFiat();
    }
  }, [budget, showFiat, getFormattedFiat, allowance.id, permissions]);

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

  function changedPermissionIds(): number[] {
    if (!permissions || !originalPermissions) return [];
    const ids = permissions
      .filter((prm, i) => prm.enabled !== originalPermissions[i].enabled)
      .map((prm) => prm.id);
    return ids;
  }

  async function updateAllowance() {
    await msg.request("updateAllowance", {
      id: allowance.id,
      totalBudget: parseInt(budget),
      lnurlAuth,
    });

    await msg.request("disablePermissions", {
      ids: changedPermissionIds(),
    });

    setOriginalPermissions(permissions);

    onEdit && onEdit();
    closeModal();
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
          <div className="p-5 border-t border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-500">
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
            <div className="pb-4 border-b border-gray-200 dark:border-neutral-500">
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
            <h2 className="mt-4 text-lg text-gray-900 font-bold dark:text-white">
              {t("edit_permissions")}
            </h2>

            {isLoadingPermissions && (
              <div className="flex justify-center">
                <Loading />
              </div>
            )}

            {hasPermissions && (
              <div>
                {permissions.map((permission, index) => (
                  <div key={index} className="flex items-center my-2">
                    <Checkbox
                      id={"permission" + permission.id}
                      name={"permission" + permission.id}
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
                    <label
                      htmlFor={"permission" + permission.id}
                      className="ml-2 block text-sm text-gray-900 font-medium dark:text-white"
                    >
                      {permission.method}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {isEmptyPermissions && (
              <p className="text-gray-500 dark:text-neutral-400">
                {t("no_permissions")}
              </p>
            )}
          </div>

          <div className="flex justify-end p-5 dark:bg-surface-02dp">
            <Button
              type="submit"
              label={tCommon("actions.save")}
              primary
              disabled={
                parseInt(budget) === allowance.totalBudget &&
                lnurlAuth === allowance.lnurlAuth &&
                !changedPermissionIds().length
              }
            />
          </div>
        </form>
      </Modal>
    </>
  );
}

export default AllowanceMenu;
