import { Typography, Layout, Tabs, Divider } from "antd";
import React, { useState, useEffect } from "react";

import accountManager from "../../../common/lib/account-manager";

import Settings from "../../../common/lib/settings";
import Allowances from "../../../common/lib/allowances";

import LndForm from "../Lnd";
import LndHubForm from "../LndHub";
import LnBitsForm from "../LnBits";
import NativeConnectionForm from "../NativeConnection";

import ListData from "../ListData";

import "./styles.scss";

const { TabPane } = Tabs;
const { Title } = Typography;
const { Header, Content } = Layout;

const settingsStore = new Settings();
const allowancesStore = new Allowances();

const Configurations = () => {
  const [accounts, setAccounts] = useState([]);
  const [settings, setSettings] = useState({});
  const [allowances, setAllowances] = useState({});
  const [currentAccount, setCurrentAccount] = useState({});

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
      console.log("load all", settingsStore.settings);
    });
  };

  const saveLndAccount = (values, formRef) => {
    const account = {
      name: values.name,
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

  return (
    <Layout>
      <Header>Lightning Extension Configuration</Header>

      <Content>
        <Tabs defaultActiveKey="2">
          <TabPane tab="General" key="1">
            <p>{JSON.stringify(settings)}</p>
          </TabPane>

          <TabPane tab="Accounts" key="2">
            <Divider plain>Current Account</Divider>
            <ListData data={[currentAccount]} />

            <Divider plain>Accounts</Divider>
            <ListData data={accounts} />

            <Divider plain>Add Account</Divider>

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
                <NativeConnectionForm
                  saveNativeAccount={saveNativeAccount}
                  addNativeConnectionFailure={formSubmitFailure}
                />
              </TabPane>

              <TabPane tab="LNbits" key="4">
                <LnBitsForm
                  onFinish={saveLnBitsAccount}
                  onFinishFailed={formSubmitFailure}
                ></LnBitsForm>
              </TabPane>
            </Tabs>
          </TabPane>

          <TabPane tab="Allowances" key="3">
            <p>{JSON.stringify(allowances)}</p>
            <span onClick={resetAllowances}>Reset</span>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default Configurations;
