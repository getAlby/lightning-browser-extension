import browser from "webextension-polyfill";
import state from "~/extension/background-script/state";

const notify = (options: { title: string; message: string }) => {
  const settings = state.getState().settings;
  if (!settings.browserNotifications) return;

  const notification: browser.Notifications.CreateNotificationOptions = {
    type: "basic",
    iconUrl: "../assets/icons/alby_icon_yellow_48x48.png",
    ...options,
  };

  return browser.notifications.create(notification);
};

export { notify };
