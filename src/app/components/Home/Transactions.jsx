import React from "react";
import { calcFiatFromSatoshi } from "../../../common/utils/helpers";
import "./styles.scss";

import { Empty, List, Avatar, Icon } from "antd";
import { StockOutlined } from "@ant-design/icons";

class Transactions extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    if (this.props.transactions?.length > 0) {
      return (
        <div class="transactions--container">
          <List
            itemLayout="horizontal"
            dataSource={this.props.transactions}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<StockOutlined />} />}
                  title={item.amount + " " + "Satoshi"}
                  description={
                    calcFiatFromSatoshi(
                      this.props.exchangeRate ?? null,
                      item.amount
                    ) +
                    " " +
                    "USD"
                  }
                />
              </List.Item>
            )}
          />
        </div>
      );
    }
    return (
      <div class="transactions--container">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }
}

export default Transactions;
