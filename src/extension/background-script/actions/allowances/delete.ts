import db from "~/extension/background-script/db";
import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";
import type { MessageAllowanceDelete } from "~/types";

const deleteAllowance = async (message: MessageAllowanceDelete) => {
  const id = message.args.id;
  if (!id) return { error: i18n.t("errors.missing_id", commonI18nNamespace) };
  await db.allowances.delete(id);
  await db.saveToStorage();
  return { data: true };
};

export default deleteAllowance;
