import React from "react";
import { Form, Input, Button } from "antd";

const FormItem = Form.Item;

const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const LndHubForm = ({ ref, saveLndHubAccount, addLndHubAccountFailure }) => {
  const [form] = Form.useForm();

  return (
    <Form
      {...layout}
      form={form}
      name="basic"
      onFinishFailed={addLndHubAccountFailure}
      onFinish={(values) => saveLndHubAccount(values, form)}
      initialValues={{
        name: "LndHub",
        url: "",
        login: "",
        password: "",
      }}
    >
      <FormItem
        label="Name"
        name="name"
        rules={[
          {
            required: true,
            message: "Please enter the name!",
          },
        ]}
      >
        <Input />
      </FormItem>

      <FormItem
        label="URL"
        name="url"
        rules={[
          {
            type: "url",
            required: true,
            message: "Please enter the macroon url!",
          },
        ]}
      >
        <Input />
      </FormItem>

      <FormItem
        label="Login"
        name="login"
        rules={[
          {
            required: true,
            message: "Please enter the lnd username/email",
          },
        ]}
      >
        <Input />
      </FormItem>

      <FormItem
        label="Password"
        name="password"
        rules={[
          {
            required: true,
            message: "Please enter the password for the lnd account",
          },
        ]}
      >
        <Input.Password />
      </FormItem>

      <FormItem {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </FormItem>
    </Form>
  );
};

export default LndHubForm;
