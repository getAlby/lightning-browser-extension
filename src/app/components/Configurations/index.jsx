import { Tabs, Divider, Button } from "antd";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import accountSvc from "../../../common/services/account.svc";

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
      accountSvc.getAll(),
      accountSvc.getCurrentAccount(),
      settingsStore.load(),
      allowancesStore.load(),
    ]).then((responses) => {
      setAccounts(responses[0]);
      setCurrentAccount(responses[1]);
      setSettings(settingsStore.settings);
      setAllowances(allowancesStore.allowances);
    });
  };

  const resetAllowances = () => {
    return allowancesStore.reset();
  };

  const updateCurrentAccount = async (accountId) => {
    await accountSvc.setCurrentAccount(accountId);
    await load();
  };

  const removeAccount = async (accountId) => {
    await accountSvc.remove(accountId);
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

        <Divider plain>All Accounts</Divider>
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
