import utils from "./utils";
import type { SettingsStorage } from "../../types";

interface AccountInfoRes {
  currentAccountId: string;
  info: { alias: string };
  balance: { balance: string };
}

interface StatusRes {
  configured: boolean;
  unlocked: boolean;
  currentAccountId: string;
  info: {
    alias: string;
  };
  balance: {
    balance: string;
  };
}

interface UnlockRes {
  currentAccountId: string;
}

export const getAccountInfo = () => utils.call<AccountInfoRes>("accountInfo");
export const getSettings = () => utils.call<SettingsStorage>("getSettings");
export const getStatus = () => utils.call<StatusRes>("status");
export const setSetting = (
  setting: Record<string, string | number | boolean>
) =>
  utils.call<SettingsStorage>("setSetting", {
    setting,
  });
export const unlock = (password: string) =>
  utils.call<UnlockRes>("unlock", { password });

export default {
  getAccountInfo,
  getSettings,
  getStatus,
  setSetting,
  unlock,
};
