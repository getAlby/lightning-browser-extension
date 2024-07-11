import Button from "@components/Button";
import Hyperlink from "@components/Hyperlink";
import Setting from "@components/Setting";
import Toggle from "@components/form/Toggle";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { PreferencesIcon } from "~/app/icons";
import msg from "~/common/lib/msg";
import type { Allowance, Permission } from "~/types";

import Badge from "~/app/components/Badge";
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
  const { t: tNostr } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
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

  // returns actual permission kind (permission name)
  function getPermissionKind(permission: Permission): string {
    return permission.method.split(/[./]/).slice(-1).toString();
  }

  //constructs i18n key for the permission translations
  function getPermissionTranslationKey(permission: Permission): string {
    if (permission.method.includes("/")) {
      return permission.method.toLowerCase().split("/").slice(0, 2).join(".");
    } else {
      return permission.method.toLowerCase();
    }
  }

  function getPermissionTitle(permission: Permission): string {
    return permission.method.toLowerCase().startsWith("nostr/signmessage/")
      ? tNostr(`kinds.${getPermissionKind(permission)}.title`, {
          defaultValue: tNostr("kinds.unknown.title", {
            kind: getPermissionKind(permission),
          }),
        })
      : tPermissions(`${getPermissionTranslationKey(permission)}.title`, {
          defaultValue: getPermissionKind(permission),
        });
  }

  function getPermissionDescription(permission: Permission): string {
    return permission.method.toLowerCase().startsWith("nostr/signmessage/")
      ? tNostr(`kinds.${getPermissionKind(permission)}.description`, {
          defaultValue: tNostr("kinds.unknown.description", {
            kind: getPermissionKind(permission),
          }),
        })
      : tPermissions(
          getPermissionTranslationKey(permission).concat(".description"),
          {
            defaultValue: getPermissionKind(permission),
          }
        );
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
          <div className="pb-5 border-b border-gray-200 dark:border-neutral-700">
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
                ? "py-1 border-b border-gray-200 dark:border-neutral-700"
                : ""
            }
          >
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
            <div className="flex flex-col gap-4 pb-3 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="pt-5 text-md text-gray-800 dark:text-neutral-200">
                {t("website_permissions")}
              </h2>
              <div>
                <p className="mb-3 text-xs font-semibold text-gray-800 dark:text-neutral-200">
                  {t("edit_allowance.always_allow")}
                </p>
                <div>
                  {permissions
                    .filter((x) => x.enabled && !x.blocked)
                    .map((permission) => (
                      <>
                        <Badge
                          key={permission.method}
                          label={getPermissionTitle(permission)}
                          description={getPermissionDescription(permission)}
                          onDelete={() => {
                            setPermissions(
                              permissions.map((prm) =>
                                prm.id === permission.id
                                  ? { ...prm, enabled: !prm.enabled }
                                  : prm
                              )
                            );
                          }}
                          className="bg-green-50 dark:bg-emerald-950 border border-green-100 dark:border-emerald-900 text-gray-800 dark:text-neutral-200 mr-2 mb-2"
                        />
                      </>
                    ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold text-gray-800 dark:text-neutral-200">
                  {t("edit_allowance.always_reject")}
                </p>
                <div>
                  {permissions
                    .filter((x) => x.enabled && x.blocked)
                    .map((permission) => (
                      <>
                        <Badge
                          key={permission.method}
                          label={getPermissionTitle(permission)}
                          description={getPermissionDescription(permission)}
                          onDelete={() => {
                            setPermissions(
                              permissions.map((prm) =>
                                prm.id === permission.id
                                  ? { ...prm, enabled: !prm.enabled }
                                  : prm
                              )
                            );
                          }}
                          className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-gray-800 dark:text-neutral-200 mr-2 mb-2"
                        />
                      </>
                    ))}
                </div>
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
