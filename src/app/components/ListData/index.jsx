import React from "react";
import { useHistory } from "react-router-dom";
import { List, Button } from "antd";

const ListData = ({
  data,
  setCurrentAccount = () => {},
  deleteAccount = () => {},
}) => {
  const history = useHistory();

  const goToEditAccount = (accountId) => {
    return history.push({
      pathname: "/account",
      state: { accountId },
    });
  };

  function getActions(account = {}) {
    const actions = [];
    if (account.isCurrent === false) {
      actions.push(
        <Button type="text" danger onClick={() => deleteAccount(account.id)}>
          Delete
        </Button>
      );
      actions.push(
        <Button
          type="primary"
          shape="round"
          onClick={() => setCurrentAccount(account.id)}
        >
          Set Current
        </Button>
      );
    }

    actions.push(
      <Button type="link" onClick={() => goToEditAccount(account.id)}>
        More
      </Button>
    );
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
    <span>No account</span>
  );
};

export default ListData;
