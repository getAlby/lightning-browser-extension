import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

import { Form, Row, Col, Menu, Dropdown, Button, message } from "antd";

import accountSvc from "../../../common/services/account.svc";
import connectors from "../../../extension/background-script/connectors";
import LndForm from "../Lnd";
import LndHubForm from "../LndHub";
import LnBitsForm from "../LnBits";
import NativeConnectionForm from "../NativeConnection";

const CONNECTORS = {
  lnd: "LND",
  lndHub: "LndHub",
  lnBits: "LnBits",
  native: "Native",
};

const Account = () => {
  const history = useHistory();
  const location = useLocation();
  const accountId = location.state && location.state.accountId;
  const [account, setAccount] = useState({});
  const [accountType, setAccountType] = useState("lnd");

  useEffect(() => {
    async function fetchAccount() {
      const acc = (await accountSvc.getById(accountId)) || {};
      setAccount(acc);
      if (acc.type) {
        setAccountType(acc.type);
      }
    }
    fetchAccount();
  }, [accountId]);

  let connectorForm = null;
  const submitHook = (innerForm) => {
    connectorForm = innerForm;
  };

  const handleSubmit = async () => {
    try {
      const values = connectorForm && (await connectorForm.validateFields());
      const newAccount = Object.assign({}, account || {}, values || {});
      newAccount.type = accountType;
      setAccount(newAccount);
      if (newAccount.id) {
        await accountSvc.update(newAccount);
        message.success(`Account ${newAccount.name} updated!`);
      } else {
        await accountSvc.add(newAccount);
        message.success(`Account ${newAccount.name} created!`);
      }
      history.goBack();
    } catch (err) {
      message.error("Please check field values!");
    }
  };

  const handleConnectorTypeChange = (type) => {
    setAccountType(type);
  };

  const handleTestAccount = async () => {
    try {
      const values = connectorForm && (await connectorForm.validateFields());
      const lndConnector = new connectors.lnd({
        macaroon: values.macaroon,
        url: values.url,
      });
      const info = await lndConnector.getInfo();
      message.success(`Alias: ${info.data.alias || ""}`);
    } catch (err) {
      message.error(`Cannot connect ${err.message || ""}`);
    }
  };

  const menu = (
    <Menu>
      {Object.keys(CONNECTORS).map((key) => (
        <Menu.Item key={key} onClick={() => handleConnectorTypeChange(key)}>
          {CONNECTORS[key]}
        </Menu.Item>
      ))}
    </Menu>
  );

  const accountConfig = () => {
    if (accountType === "lnd") {
      return <LndForm initialValues={account} submitHook={submitHook} />;
    }
    if (accountType === "lndHub") {
      return <LndHubForm initialValues={account} submitHook={submitHook} />;
    }
    if (accountType === "lnBits") {
      return <LnBitsForm initialValues={account} submitHook={submitHook} />;
    }
    if (accountType === "native") {
      return (
        <NativeConnectionForm initialValues={account} submitHook={submitHook} />
      );
    }
    return <div>Unknown Account Type</div>;
  };

  return (
    <>
      <Row>
        <Col span={1}></Col>
        <Col span={20}>
          <Form name="basic" layout="vertical">
            <Form.Item label="Type" name="type">
              <Dropdown.Button overlay={menu} disabled={account && account.id}>
                {CONNECTORS[accountType]}
              </Dropdown.Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col span={1}></Col>
        <Col span={20}> {accountConfig()} </Col>
      </Row>
      <Row>
        <Col span={1}></Col>
        <Col span={5}>
          {account && account.id ? (
            <Button type="primary" onClick={handleSubmit}>
              Update
            </Button>
          ) : (
            <Button type="primary" onClick={handleSubmit}>
              Add
            </Button>
          )}
        </Col>
        <Col span={5}>
          <Button type="danger" onClick={handleTestAccount}>
            Test
          </Button>
        </Col>
        <Col span={5}>
          <Button type="text" onClick={history.goBack}>
            Cancel
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Account;
