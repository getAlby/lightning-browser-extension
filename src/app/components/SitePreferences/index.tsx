import Button from "@components/Button";
import Hyperlink from "@components/Hyperlink";
import Setting from "@components/Setting";
import Toggle from "@components/form/Toggle";
import type { FormEvent } from "react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { PreferencesIcon } from "~/app/icons";
import msg from "~/common/lib/msg";
import type { Allowance, Permission } from "~/types";

import Modal from "~/app/components/Modal";
import DualCurrencyField from "../form/DualCurrencyField/index";

type LauncherType = "hyperlink" | "button" | "icon";

export type Props = {
  launcherType: LauncherType;
  allowance: Pick<Allowance, "id" | "totalBudget" | "lnurlAuth">;
  onEdit?: () => void;
  onDelete?: () => void;
};

function SitePreferences({ launcherType, allowance, onEdit, onDelete }: Props) {
  const { isLoading: isLoadingSettings, settings } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;
  const { account } = useAccount();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [budget, setBudget] = useState("");
  const [lnurlAuth, setLnurlAuth] = useState(false);

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

  const getLauncher = (launcherType: LauncherType) => {
    if (launcherType === "button") {
      return (
        <Button
          icon={
            <PreferencesIcon className="h-6 w-6 mr-2 dark:fill-neutral-200" />
          }
          label={t("edit_allowance.title")}
          onClick={openModal}
          className="text-xs"
        />
      );
    }
    if (launcherType === "icon") {
      return (
        <PreferencesIcon
          className="h-6 w-6 fill-gray-600 dark:fill-neutral-400 hover:bg-gray-100 dark:hover:bg-surface-02dp hover:fill-gray-700 dark:hover:fill-neutral-300 rounded-sm cursor-pointer"
          onClick={openModal}
        />
      );
    }
    if (launcherType === "hyperlink") {
      return (
        <Hyperlink onClick={openModal}>{t("new_budget.link_label")}</Hyperlink>
      );
    }
  };

  return (
    <>
      {getLauncher(launcherType)}
      <Modal
        isOpen={modalIsOpen}
        close={closeModal}
        contentLabel={t("edit_allowance.screen_reader")}
        title={t("edit_allowance.title")}
      >
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            updateAllowance();
          }}
        >
          <div className="pb-4 border-b border-gray-200 dark:border-neutral-700">
            <DualCurrencyField
              id="budget"
              label={t("new_budget.label")}
              min={0}
              autoFocus
              placeholder={tCommon("sats", { count: 0 })}
              value={budget}
              hint={t("hint")}
              showFiat={showFiat}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div className={hasPermissions ? "pb-4" : ""}>
            <Setting
              title={t("enable_login.title")}
              subtitle={t("enable_login.subtitle")}
              inline={true}
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
                      inline={true}
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

          <div className="mt-6 flex justify-between items-center">
            <Hyperlink
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
              className="text-red-700 hover:text-red-800"
            >
              {tCommon("actions.disconnect")}
            </Hyperlink>
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

export default SitePreferences;
