import * as React from 'react';
import { Formik, Field, Form } from "formik";
import browser from 'webextension-polyfill';

import './styles.scss';

export default class Options extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      accounts: {},
      currentAccount: '',
      settings: {}
    };
  }

  componentDidMount () {
    browser.storage.sync.get(['accounts', 'currentAccount', 'settings']).then(result => {
      this.setState({
        accounts: (result.accounts || {}),
        currentAccount: result.currentAccount,
        settings: (result.settings || {})
      });
    })
  }

  saveCurrentAccount(values) {
    const currentAccount = values.currentAccount;
    console.log(currentAccount);
    if (currentAccount) {
      browser.storage.sync.set({currentAccount}).then(() => {
        this.setState({currentAccount });
        alert('Saved');
      });
    }
  }

  saveLndAccount(values) {
    const accounts = this.state.accounts;
    accounts[values.name] = {
      config: {
        macaroon: values.macaroon,
        url: values.url
      },
      connector: 'lnd'
    };
    this.saveAccounts(accounts).then(() => {
      alert('Saved');
    });
  }

  saveLndHubAccount(values) {
    const accounts = this.state.accounts;
    accounts[values.name] = {
      config: {
        login: values.login,
        password: values.password,
        url: values.url
      },
      connector: 'lndhub'
    };
    this.saveAccounts(accounts).then(() => {
      alert('Saved');
    });
  }

  saveNativeAccount(values) {
    const accounts = this.state.accounts;
    accounts[values.name] = {
      config: {},
      connector: 'native'
    }
    this.saveAccounts(accounts).then(() => {
      alert('Saved');
    })
  }

  resetAccounts() {
    this.saveAccounts({}).then(() => {
      alert('Done');
    });
  }

  saveAccounts(accounts) {
    return browser.storage.sync.set({accounts}).then(() => {
      this.setState({accounts});
    });
  }

  render () {
    return (
      <div>
        <section>
          {JSON.stringify(this.state.accounts)}
          <button onClick={async values => { this.resetAccounts() }}>Reset</button>
        </section>
        <section>
          {JSON.stringify(this.state.settings)}
        </section>
        <section>
          <h2>Current Account</h2>
          <Formik
            initialValues={{ currentAccount: this.state.currentAccount }}
            onSubmit={async values => { this.saveCurrentAccount(values) }}
          >
            <Form>
              Current account: <Field name="currentAccount" type="text" />
              <button type="submit">Save</button>
            </Form>
          </Formik>
        </section>
        <section>
          <h2>Add LND Account</h2>
          <Formik
            initialValues={{ name: "", macaroon: "", url: "" }}
            onSubmit={async values => { this.saveLndAccount(values) }}
          >
            <Form>
              Name: <Field name="name" type="text" />
              URL: <Field name="url" type="text" />
              Macaroon Hex: <Field name="macaroon" type="text" />
              <button type="submit">Save</button>
            </Form>
          </Formik>
        </section>
        <section>
          <h2>Add LndHub Account</h2>
          <Formik
            initialValues={{ name: "", login: "", password: "", url: "" }}
            onSubmit={async values => { this.saveLndHubAccount(values) }}
          >
            <Form>
              Name: <Field name="name" type="text" />
              URL: <Field name="url" type="text" />
              Login: <Field name="login" type="text" />
              Password: <Field name="password" type="text" />
              <button type="submit">Save</button>
            </Form>
          </Formik>
        </section>
        <section>
          <h2>Add Native Connection</h2>
          <Formik
            initialValues={{ name: "", login: "", password: "", url: "" }}
            onSubmit={async values => { this.saveNativeAccount(values) }}
          >
            <Form>
              Name: <Field name="name" type="text" />
              <button type="submit">Save</button>
            </Form>
          </Formik>
        </section>
      </div>
    );
  }
};
