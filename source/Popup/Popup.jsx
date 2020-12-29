import React, {useState} from 'react';
import browser from 'webextension-polyfill';

import './styles.scss';

function openWebPage(url) {
  return browser.tabs.create({url});
}

function openApp() {
  return browser.runtime.sendMessage({
    application: 'Joule',
    prompt: true,
    type: 'open',
    args: {},
    origin: {internal: true}
  });
}

function getInfo() {
  return browser.runtime.sendMessage({
    application: 'Joule',
    prompt: true,
    type: 'getInfo',
    args: {},
    origin: {internal: true}
  });
}

export default class Popup extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      alias: ''
    };
  }
  
  componentDidMount () {
    // TODO: cache? https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local
    getInfo().then(info => {
      this.setState({alias: info.data.alias});
    });
  }

  render () {
    return (
      <section id="popup">
        <h2>{this.state.alias}</h2>
        <button
          id="options__button"
          type="button"
          onClick={() => {
            return openWebPage('options.html');
          }}
        >
          Options Page
        </button>
        <button onClick={() => { return openApp() }}>Settings</button>
      </section>
    );
  }
};
