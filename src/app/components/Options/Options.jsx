import { Typography, Layout, Tabs } from "antd";
import React, { useState, useEffect } from "react";

import msg from "../../../common/lib/msg";
import { encryptData } from "../../../common/lib/crypto";

import Accounts from "../../../common/lib/accounts";
import Allowances from "../../../common/lib/allowances";

import LndForm from "../Lnd";
import LndHubForm from "../LndHub";
import LnBitsForm from "../LnBits";
import NativeConnectionForm from "../NativeConnection";

import ListData from "../ListData";

import { normalizeAccountsData } from "../../../common/utils/helpers";

import "./styles.scss";

const { TabPane } = Tabs;
const { Title } = Typography;
const { Header, Content } = Layout;

const accountsStore = new Accounts();
const allowancesStore = new Allowances();

const Options = () => {
  const [accounts, setAccounts] = useState({});
  const [allowances, setAllowances] = useState({});
  const [currentAccount, setCurrentAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(true);

  useEffect(() => {
    return load();
  }, []);

  const load = () => {
    return Promise.all([
      accountsStore.load(),
      allowancesStore.load(),
    ]).then(() => {
      setAccounts(accountsStore.accounts);
      setCurrentAccount(accountsStore.currentKey);
      setAllowances(allowancesStore.allowances);
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

  const resetAccounts = () => {
    return accountsStore.reset().then(() => {
      document.location.reload();
    });
  };

  const resetAllowances = () => {
    return allowancesStore.reset();
  };

  const saveAccount = (account) => {
    account.config = encryptData(account.config, password);
    return accountsStore.setAccount(account, true).then(() => {
      return load();
    });
  };

  const formSubmitFailure = (errorInfo) => {
    console.log(errorInfo);
  };

  // TODO: refactor
  const handlePasswordModalOk = (password) => {
    setPassword(password);
    if (Object.entries(accounts).length > 0) {
      msg
        .request("unlock", { password })
        .then((response) => {
          setShowPasswordModal(false);
        })
        .catch((e) => {
          alert("Invalid password");
        });
    } else {
      setShowPasswordModal(false);
    }
  };

  return (
    <Layout>
      <Header>Lightning Extension Options</Header>

      <Content>
        <Tabs defaultActiveKey="2">
          <TabPane tab="General" key="1">
          </TabPane>

          <TabPane tab="Accounts" key="2">
            {Object.entries(accounts).map((entry) => (
              <div>{entry[1].name}</div>
            ))}
            <ListData
              title="Existing Accounts"
              onResetCallback={resetAccounts}
              data={normalizeAccountsData(accounts)}
            />

            <Title level={2}>Current Account: {currentAccount}</Title>

            <Title level={2}>Add Account</Title>

            <p>
              Choose a password:
              <input
                type="text"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
            </p>
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

export default Options;
