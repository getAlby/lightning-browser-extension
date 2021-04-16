import React, { useEffect } from "react";
import { Form, Input } from "antd";

const FormItem = Form.Item;

const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};

const LndHubForm = ({ initialValues = {}, submitHook = () => {} }) => {
  const [form] = Form.useForm();
  submitHook(form);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        url: initialValues.url,
        login: initialValues.login,
        password: initialValues.password,
      });
    }
  }, [form, initialValues]);

  return (
    <Form {...layout} form={form} name="basic" layout="vertical">
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
      <FormItem label="Description" name="description">
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
    </Form>
  );
};

export default LndHubForm;
