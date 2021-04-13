import React from "react";
import { Input, Button, Form } from "antd";

import PasswordManager from "../../../common/lib/password-manager";

const SetPassword = ({ onOk }) => {
  const [form] = Form.useForm();

  const onDone = async (values) => {
    if (values.password === values.confirm) {
      const passwordManager = new PasswordManager();
      await passwordManager.init(values.password, values.confirm);
      onOk();
    }
  };

  return (
    <Form form={form} name="unlock" onFinish={onDone}>
      <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            required: true,
            message: "Please enter your password!",
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Confirmation"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Please confirm your password!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                "The two passwords that you entered do not match!"
              );
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Button key="submit" type="primary" onClick={form.submit}>
        Save
      </Button>
    </Form>
  );
};

export default SetPassword;
