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

const NativeConnectionForm = ({
  saveNativeAccount,
  addNativeConnectionFailure,
}) => {
  const [form] = Form.useForm();

  return (
    <Form
      {...layout}
      form={form}
      name="basic"
      onFinishFailed={addNativeConnectionFailure}
      onFinish={(values) => saveNativeAccount(values, form)}
      initialValues={{
        name: "",
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

      <FormItem {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </FormItem>
    </Form>
  );
};

export default NativeConnectionForm;
