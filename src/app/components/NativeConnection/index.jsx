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

const NativeConnectionForm = ({
  initialValues = {},
  submitHook = () => {},
}) => {
  const [form] = Form.useForm();
  submitHook(form);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
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
    </Form>
  );
};

export default NativeConnectionForm;
