import React from "react";
import { Form, Input, Row, Col, Menu, Dropdown, Button } from "antd";

import LndForm from "../Lnd";
import LndHubForm from "../LndHub";
import LnBitsForm from "../LnBits";
import NativeConnectionForm from "../NativeConnection";

const Account = () => {
  const layout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 20,
    },
  };

  let connectorForm = null;
  const submitHook = (innerForm) => {
    connectorForm = innerForm;
  };

  const handleSubmit = async () => {
    try {
      const values = connectorForm && (await connectorForm.validateFields());
      console.log("########## 5:", values);
    } catch (err) {}
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
          <Form {...layout} name="basic" layout="vertical">
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
          <LndForm submitHook={submitHook} />
        </Col>
      </Row>
      <Row>
        <Col span={1}></Col>
        <Col span={20}>
          <Button type="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Account;
