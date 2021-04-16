import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

import { Form, Row, Col, Menu, Dropdown, Button, message } from "antd";

import accountManager from "../../../common/lib/account-manager";
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
      const acc = (await accountManager.getById(accountId)) || {};
      setAccount(acc);
      if (acc.type) {
        setAccountType(acc.type);
      }
      console.log("########################2 acc ", acc);
      console.log("########################2 accountType: ", accountType);
    }
    fetchAccount();
  }, [accountId, accountType]);

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
        await accountManager.update(newAccount);
        message.success(`Account ${newAccount.name} updated!`);
      } else {
        await accountManager.add(newAccount);
        message.success(`Account ${newAccount.name} created!`);
      }
      history.goBack();
    } catch (err) {
      message.error("Please check field values!");
    }
  };

  const handleConnectorTypeChange = (type) => {
    console.log("############## type", type);
    setAccountType(type);
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
  return (
    <>
      <Row>
        <Col span={1}></Col>
        <Col span={20}>
          <Form name="basic" layout="vertical">
            <Form.Item label="Type" name="type">
              <Dropdown.Button overlay={menu}>
                {CONNECTORS[accountType]}
              </Dropdown.Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col span={1}></Col>
        <Col span={20}>
          <LndForm initialValues={account} submitHook={submitHook} />
        </Col>
      </Row>
      <Row>
        <Col span={1}></Col>
        <Col span={8}>
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
        <Col span={8}>
          <Button type="text" onClick={history.goBack}>
            Cancel
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Account;
