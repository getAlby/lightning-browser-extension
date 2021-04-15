import React from "react";
import { List, Button } from "antd";

const ListData = ({ data }) => {
  function getActions(item = {}) {
    const actions = [];
    if (!item.isCurrent) {
      actions.push(
        <Button type="text" danger>
          Delete
        </Button>
      );
      actions.push(<Button type="primary">Set Current</Button>);
    }

    actions.push(<Button type="link">More</Button>);
    return actions;
  }
  return data.length > 0 ? (
    <>
      <List
        size="small"
        dataSource={data}
        itemLayout="horizontal"
        bordered
        renderItem={(item) => (
          <List.Item key={item.id} actions={getActions(item)}>
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
