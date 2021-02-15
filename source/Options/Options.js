import browser from "webextension-polyfill";
import { Typography, Layout, Tabs } from "antd";
import React, { useState, useEffect } from "react";

import LndForm from "../forms/lnd";
import LndHubForm from "../forms/lndhub";
import LnBitsForm from "../forms/lnbits";
import { encryptData } from "./../lib/crypto";
import ListData from "../components/listData";
import { normalizeAccountsData, normalizeSettingsData } from "../utils/helpers";

import "./styles.scss";

const { TabPane } = Tabs;
const { Title } = Typography;
const { Header, Content } = Layout;

const Options = () => {
  const [accounts, setAccounts] = useState({});
  const [settings, setSettings] = useState({});
  const [hostSettings, setHostSettings] = useState({});
  const [currentAccount, setCurrentAccount] = useState("");

  useEffect(() => {
    fetchOptionsFromStorage();
  }, []);

  const fetchOptionsFromStorage = () => {
    browser.storage.sync
      .get(["accounts", "currentAccount", "settings", "hostSettings"])
      .then((result) => {
        setAccounts(result.accounts || {});
        setSettings(result.settings || {});
        setHostSettings(result.hostSettings || {});
        setCurrentAccount(result.currentAccount || "");
      });
  };

  const saveCurrentAccount = (values) => {
    const currentAccount = values.currentAccount;

    if (currentAccount) {
      browser.storage.sync.set({ currentAccount }).then(() => {
        setCurrentAccount(currentAccount);
        alert("Saved");
      });
    }
  };

  const saveLndAccount = (values, formRef) => {
    accounts[values.name] = {
      config: {
        macaroon: values.macaroon,
        url: values.url,
      },
      connector: "lnd",
    };

    saveAccounts(accounts).then(() => {
      fetchOptionsFromStorage();
      saveCurrentAccount({ currentAccount: values.name });

      if (formRef) {
        formRef.resetFields();
      }
    });
  };

  const saveLndHubAccount = (values, formRef) => {
    accounts[values.name] = {
      config: {
        login: values.login,
        password: values.password,
        url: values.url,
      },
      connector: "lndhub",
    };

    saveAccounts(accounts).then(() => {
      fetchOptionsFromStorage();
      saveCurrentAccount({ currentAccount: values.name });
      if (formRef) {
        formRef.resetFields();
      }
    });
  };

  const saveLnBitsAccount = (values, formRef) => {
    accounts[values.name] = {
      config: {
        adminkey: values.adminkey,
        readkey: values.readkey,
        url: "https://lnbits.com",
      },
      connector: "lnbits",
    };

    saveAccounts(accounts).then(() => {
      fetchOptionsFromStorage();
      saveCurrentAccount({ currentAccount: values.name });
      if (formRef) {
        formRef.resetFields();
      }
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
      setAccounts({});
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

  const formSubmitFailure = (errorInfo) => {
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
            <ListData
              title="Existing Accounts"
              onResetCallback={resetAccounts}
              data={normalizeAccountsData(accounts)}
            />

            <ListData
              title="Settings"
              onResetCallback={resetHostSettings}
              data={normalizeSettingsData(hostSettings)}
            />

            <Title level={2}>Current Account: {currentAccount}</Title>

            <Title level={2}>Add Account</Title>

            <Tabs defaultActiveKey="1">
              <TabPane tab="LND Account" key="1">
                <LndForm
                  saveLndAccount={saveLndAccount}
                  addLndAccountFailure={formSubmitFailure}
                />
              </TabPane>

              <TabPane tab="LND Hub Account" key="2">
                <LndHubForm
                  saveLndHubAccount={saveLndHubAccount}
                  addLndHubAccountFailure={formSubmitFailure}
                />
              </TabPane>

              <TabPane tab="Native Connection" key="3">
                Native accout form comes here
              </TabPane>

              <TabPane tab="LNbits" key="4">
                <LnBitsForm
                  onFinish={saveLnBitsAccount}
                  onFinishFailed={formSubmitFailure}
                ></LnBitsForm>
              </TabPane>
            </Tabs>
          </TabPane>

          <TabPane tab="Enabled Sites" key="3">
            <p>{JSON.stringify(hostSettings)}</p>
            <span onClick={resetHostSettings}>Reset</span>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default Options;
