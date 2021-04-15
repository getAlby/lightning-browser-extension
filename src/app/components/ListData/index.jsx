import React from "react";
import { List, Button } from "antd";

const ListData = ({ data, title, onResetCallback }) => {
  return data.length > 0 ? (
    <>
      <List
        size="small"
        dataSource={data}
        itemLayout="horizontal"
        bordered
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Button type="primary">Set Current</Button>,
              <a key="123">more</a>,
            ]}
          >
            <List.Item.Meta title={item.name} description={item.description} />
          </List.Item>
        )}
      />
    </>
  ) : (
    <span>No account configured yet</span>
  );
};

export default ListData;
