import browser from "webextension-polyfill";
import React, { useState, useEffect } from "react";
import { Typography, Layout, Tabs, Row } from "antd";

import LndForm from "../forms/lnd";
import { encryptData } from "./../lib/crypto";

import "./styles.scss";

const { TabPane } = Tabs;
const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const Options = () => {
  const [accounts, setAccounts] = useState({});
  const [settings, setSettings] = useState({});
  const [hostSettings, setHostSettings] = useState({});
  const [currentAccount, setCurrentAccount] = useState("");

  useEffect(() => {
    browser.storage.sync
      .get(["accounts", "currentAccount", "settings", "hostSettings"])
      .then((result) => {
        console.log(result.accounts);
        setAccounts(result.accounts || {});
        setSettings(result.settings || {});
        setHostSettings(result.hostSettings || {});
        setCurrentAccount(result.currentAccount || "");
      });
  }, []);

  const saveCurrentAccount = (values) => {
    const currentAccount = values.currentAccount;

    if (currentAccount) {
      browser.storage.sync.set({ currentAccount }).then(() => {
        setCurrentAccount(currentAccount);
        alert("Saved");
      });
    }
  };

  const saveLndAccount = (values) => {
    accounts[values.name] = {
      config: {
        macaroon: values.macaroon,
        url: values.url,
      },
      connector: "lnd",
    };
    saveAccounts(accounts).then(() => {
      alert("Saved");
    });
  };

  const saveLndHubAccount = (values) => {
    accounts[values.name] = {
      config: {
        login: values.login,
        password: values.password,
        url: values.url,
      },
      connector: "lndhub",
    };

    saveAccounts(accounts).then(() => {
      alert("Saved");
    });
  };

  const saveNativeAccount = (values) => {
    accounts[values.name] = {
      config: {},
      connector: "native",
    };
    saveAccounts(accounts).then(() => {
      alert("Saved");
    });
  };

  const resetAccounts = () => {
    return saveAccounts({}).then(() => {
      alert("Done");
    });
  };

  const resetHostSettings = () => {
    return browser.storage.sync.set({ hostSettings: {} }).then(() => {
      setHostSettings({});
      alert("Done");
    });
  };

  const saveAccounts = (accounts) => {
    for (const [name, data] of Object.entries(accounts)) {
      if (data.config) {
        data.config = encryptData(data.config, "btc", "salt");
      }
      accounts[name] = data;
    }
    return browser.storage.sync.set({ accounts }).then(() => {
      setAccounts(accounts);
    });
  };

  const addLndAccountFailure = (errorInfo) => {
    console.log(errorInfo);
  };

  return (
    <Layout>
      <Header>Lightning Extension Options</Header>

      <Content>
        <Tabs defaultActiveKey="2">
          <TabPane tab="General" key="1">
            Content of Tab Pane 1
          </TabPane>

          <TabPane tab="Accounts" key="2">
            {Object.keys(accounts).length > 0 && (
              <>
                <Row>
                  <Title level={2}>Existing Accounts</Title>
                </Row>
                <Paragraph code>{JSON.stringify(accounts, null, 2)}</Paragraph>
              </>
            )}

            <Title level={2}>Add Account</Title>

            <Tabs defaultActiveKey="1">
              <TabPane tab="LND Account" key="1">
                <LndForm
                  saveLndAccount={saveLndAccount}
                  addLndAccountFailure={addLndAccountFailure}
                />
              </TabPane>

              <TabPane tab="LND Hub Account" key="2">
                LND hub account form comes here
              </TabPane>

              <TabPane tab="Native Connection" key="3">
                Native accout form comes here
              </TabPane>
            </Tabs>
          </TabPane>

          <TabPane tab="Enabled Sites" key="3">
            Content of Tab Pane 3
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default Options;
