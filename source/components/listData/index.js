import React from "react";
import { Typography, Button, List, Row } from "antd";

const ListData = ({ data, title, onResetCallback }) => {
  return data.length > 0 ? (
    <>
      <Row align="middle" justify="space-between">
        <Typography.Title level={2}>{title}</Typography.Title>

        <div className="reset-button-wrapper">
          <Button
            shape="round"
            type="primary"
            onClick={onResetCallback}
            className="reset-button"
          >
            Reset
          </Button>
        </div>
      </Row>

      <List
        size="default"
        dataSource={data}
        itemLayout="vertical"
        renderItem={(item) => (
          <List.Item key={item.title}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </>
  ) : null;
};

export default ListData;
