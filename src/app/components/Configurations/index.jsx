import { Tabs, Divider, Button } from "antd";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import accountManager from "../../../common/lib/account-manager";

import Settings from "../../../common/lib/settings";
import Allowances from "../../../common/lib/allowances";

import ListData from "../ListData";

import "./styles.scss";

const { TabPane } = Tabs;

const settingsStore = new Settings();
const allowancesStore = new Allowances();

const Configurations = () => {
  const [accounts, setAccounts] = useState([]);
  const [settings, setSettings] = useState({});
  const [allowances, setAllowances] = useState({});
  const [currentAccount, setCurrentAccount] = useState(null);

  const history = useHistory();

  useEffect(() => {
    return load();
  }, []);

  const load = () => {
    return Promise.all([
      accountManager.getAll(),
      accountManager.getCurrentAccount(),
      settingsStore.load(),
      allowancesStore.load(),
    ]).then((responses) => {
      setAccounts(responses[0]);
      setCurrentAccount(responses[1]);
      setSettings(settingsStore.settings);
      setAllowances(allowancesStore.allowances);
    });
  };

  const saveLndAccount = (values, formRef) => {
    const account = {
      name: values.name,
      description: values.description,
      config: {
        macaroon: values.macaroon,
        url: values.url,
      },
      connector: "lnd",
    };
    return saveAccount(account).then(() => {
      load();
      if (formRef) {
        formRef.resetFields();
      }
    });
  };

  const saveLndHubAccount = (values, formRef) => {
    const account = {
      name: values.name,
      config: {
        login: values.login,
        password: values.password,
        url: values.url,
      },
      connector: "lndhub",
    };

    return saveAccount(account).then(() => {
      load();
      if (formRef) {
        formRef.resetFields();
      }
    });
  };

  const saveLnBitsAccount = (values, formRef) => {
    const account = {
      name: values.name,
      config: {
        adminkey: values.adminkey,
        readkey: values.readkey,
        url: "https://lnbits.com",
      },
      connector: "lnbits",
    };

    return saveAccount(account).then(() => {
      load();
      if (formRef) {
        formRef.resetFields();
      }
    });
  };

  const saveNativeAccount = (values, formRef) => {
    const account = {
      name: values.name,
      config: {},
      connector: "native",
    };
    return saveAccount(account).then(() => {
      load();
      if (formRef) {
        formRef.resetFields();
      }
    });
  };

  const resetAccounts = async () => {
    await accountManager.removeAll();
    await load();
  };

  const resetAllowances = () => {
    return allowancesStore.reset();
  };

  const saveAccount = async (account) => {
    return accountManager.add(account);
  };

  const formSubmitFailure = (errorInfo) => {
    console.log(errorInfo);
  };

  const updateCurrentAccount = async (accountId) => {
    await accountManager.setCurrentAccount(accountId);
    await load();
  };

  const removeAccount = async (accountId) => {
    await accountManager.remove(accountId);
    await load();
  };

  const goToAddAccount = () => {
    return history.push({
      pathname: "/account",
      state: { acountId: null },
    });
  };

  return (
    <Tabs defaultActiveKey="2">
      <TabPane tab="General" key="1">
        <p>{JSON.stringify(settings)}</p>
      </TabPane>

      <TabPane tab="Accounts" key="2">
        <Divider plain>Current Account</Divider>
        <ListData data={currentAccount ? [currentAccount] : []} />

        <Divider plain>Accounts</Divider>
        <ListData
          data={accounts || []}
          setCurrentAccount={updateCurrentAccount}
          deleteAccount={removeAccount}
        />

        <Divider plain></Divider>
        <Button type="primary" shape="round" onClick={goToAddAccount}>
          Add Account
        </Button>
      </TabPane>

      <TabPane tab="Allowances" key="3">
        <p>{JSON.stringify(allowances)}</p>
        <span onClick={resetAllowances}>Reset</span>
      </TabPane>
    </Tabs>
  );
};

export default Configurations;
