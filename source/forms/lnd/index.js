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

const LndForm = ({ ref, saveLndAccount, addLndAccountFailure }) => {
  const [form] = Form.useForm();

  return (
    <Form
      {...layout}
      form={form}
      name="basic"
      onFinishFailed={addLndAccountFailure}
      onFinish={(values) => saveLndAccount(values, form)}
      initialValues={{
        url: "",
        name: "",
        macaroon: "",
      }}
    >
      <FormItem
        label="Name"
        name="name"
        rules={[
          {
            required: true,
            message: "Please input your username!",
          },
        ]}
      >
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

      <FormItem {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </FormItem>
    </Form>
  );
};

export default LndForm;
