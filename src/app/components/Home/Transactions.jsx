import React from "react";
import { calcFiatFromSatoshi } from "../../../common/utils/helpers";
import { formatRelative } from "date-fns";

import "./styles.scss";

import { Empty, List, Avatar, Tooltip } from "antd";
import { StockOutlined } from "@ant-design/icons";
import { sortByFieldAscending } from "../../../common/utils/helpers.js";

class Transactions extends React.Component {
  render() {
    if (this.props.transactions?.length > 0) {
      return (
        <div class="transactions--container">
          <List
            itemLayout="horizontal"
            dataSource={sortByFieldAscending(
              this.props.transactions,
              "creation_date"
            )}
            renderItem={(item) => (
              <List.Item className="transactions--container__item">
                <List.Item.Meta
                  avatar={<Avatar icon={<StockOutlined />} />}
                  title={`${item.value} Satoshi`}
                  description={
                    calcFiatFromSatoshi(
                      this.props.exchangeRate ?? null,
                      item.value
                    ) +
                    " " +
                    "USD"
                  }
                />
                {/* TODO: move to function*/}
                <Tooltip
                  placement="top"
                  title={new Date(item.creation_date * 1000).toString()}
                >
                  {/* setting 1.1.2000 as a fallback */}
                  {formatRelative(
                    new Date(parseInt(item.creation_date) * 1000 ?? 946681200),
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
