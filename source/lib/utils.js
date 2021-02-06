import browser from 'webextension-polyfill';

export default {
  notify: (details) => {
    const notification = Object.assign({
      "type": "basic",
      "iconUrl": browser.extension.getURL("assets/icons/favicon-48.png"),
    }, details);
    browser.notifications.create(notification);
  },
  openPrompt: () => {
    const urlParams = '';

    return new Promise((resolve, reject) => {
      browser.windows
        .create({
          url: `${browser.runtime.getURL('prompt.html')}?${urlParams}`,
          type: 'popup',
          width: 400,
          height: 580,
        })
        .then(window => {
          const tabId = window.tabs[0].id;
        });
    });
  }
}