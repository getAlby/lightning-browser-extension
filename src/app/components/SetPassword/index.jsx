import React from "react";
import { Input, Button, Modal, Form } from "antd";

const SetPassword = ({ onOk, visible }) => {
  const [form] = Form.useForm();

  const onDone = (values) => {
    if (values.password === values.confirm) {
      onOk(values.password);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Your Password"
      onOk={onDone}
      closeable={false}
      footer={[
        <Button key="submit" type="primary" onClick={form.submit}>
          Save
        </Button>,
      ]}
    >
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
      </Form>
    </Modal>
  );
};

export default SetPassword;
