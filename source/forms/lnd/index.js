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
        name: "LND",
        macaroon:
          "0201036C6E6402F801030A10A20DB3BCABE52F0186FAFB6CD5A79FED1201301A160A0761646472657373120472656164120577726974651A130A04696E666F120472656164120577726974651A170A08696E766F69636573120472656164120577726974651A210A086D616361726F6F6E120867656E6572617465120472656164120577726974651A160A076D657373616765120472656164120577726974651A170A086F6666636861696E120472656164120577726974651A160A076F6E636861696E120472656164120577726974651A140A057065657273120472656164120577726974651A180A067369676E6572120867656E657261746512047265616400000620AE1050A1B1EDA68D723F2AE0EC4561552E1F2507EFB552F86C3D7DE708BC7E1A",
        url: "https://regtest-bob.nomadiclabs.net",
      }}
    >
      <FormItem
        label="Name"
        name="name"
        rules={[
          {
            required: true,
            message: "Please give your account a name",
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
            message: "Please enter the macaroon",
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
            message: "Please enter the node url",
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
