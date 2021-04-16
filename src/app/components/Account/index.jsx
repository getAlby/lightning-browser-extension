import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

import { Form, Row, Col, Menu, Dropdown, Button, message } from "antd";

import accountManager from "../../../common/lib/account-manager";
import LndForm from "../Lnd";
import LndHubForm from "../LndHub";
import LnBitsForm from "../LnBits";
import NativeConnectionForm from "../NativeConnection";

const Account = () => {
  const history = useHistory();
  const location = useLocation();
  const accountId = location.state && location.state.accountId;
  const [account, setAccount] = useState(null);

  useEffect(() => {
    async function fetchAccount() {
      const acc = await accountManager.getById(accountId);
      setAccount(acc);
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
      if (account && account.id) {
        await accountManager.update(Object.assign(account, values));
        message.success(`Account ${account.name} updated!`);
      } else {
        const newAccount = await accountManager.add(values);
        message.success(`Account ${newAccount.name} created!`);
      }
      history.goBack();
    } catch (err) {
      message.error("Please check field values!");
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="lnd">LND</Menu.Item>
      <Menu.Item key="lndHub">LndHub</Menu.Item>
      <Menu.Item key="lnBits">LnBits</Menu.Item>
      <Menu.Item key="native">Native</Menu.Item>
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
                Dropdown sasasasasasasassas
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
