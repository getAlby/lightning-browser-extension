import React from "react";
import { calcFiatFromSatoshi } from "../../../common/utils/helpers";
import { formatRelative, subDays } from "date-fns";

import "./styles.scss";

import { Empty, List, Avatar, Icon, Tooltip } from "antd";
import { StockOutlined } from "@ant-design/icons";

class Transactions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.transactions?.length > 0) {
      return (
        <div class="transactions--container">
          <List
            itemLayout="horizontal"
            dataSource={this.props.transactions}
            renderItem={(item) => (
              <List.Item className="transactions--container__item">
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
                {/* TODO: move to function*/}
                <Tooltip
                  placement="top"
                  title={new Date(item.time_stamp * 1000).toString()}
                >
                  {/* setting 1.1.2000 as a fallback */}
                  {formatRelative(
                    new Date(parseInt(item.time_stamp) * 1000 ?? 946681200),
                    new Date()
                  )}
                </Tooltip>
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
