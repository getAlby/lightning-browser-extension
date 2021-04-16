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

const LndForm = ({ initialValues = {}, submitHook = () => {} }) => {
  const [form] = Form.useForm();
  submitHook(form);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        macaroon: initialValues.macaroon,
        url: initialValues.url,
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
            message: "Please set a name for the account!",
          },
        ]}
      >
        <Input />
      </FormItem>

      <FormItem label="Description" name="description">
        <Input />
      </FormItem>

      <FormItem
        label="Macaroon"
        name="macaroon"
        rules={[
          {
            required: true,
            message: "Please input the macroon key!",
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
    </Form>
  );
};

export default LndForm;
