import React from "react";
import { calcFiatFromSatoshi } from "../../../common/utils/helpers";
import { formatRelative, subDays } from "date-fns";

import "./styles.scss";

import { Empty, List, Avatar, Icon, Tooltip } from "antd";
import { StockOutlined } from "@ant-design/icons";
import { sortByFieldAscending } from "../../../common/utils/helpers.js";

function Transactions({ exchangeRate, transactions }) {
  if (transactions?.length > 0) {
    console.log(sortByFieldAscending(transactions, "creation_date"));

    return (
      <div className="divide-y divide-gray-200">
        {sortByFieldAscending(transactions, "creation_date").map((item) => (
          <div key={item.payment_index} className="flex py-4">
            <div className="flex justify-center items-center w-6 h-6 border-2 border-grey-600 rounded-full">
              +
            </div>
            <div className="ml-4">John Doe</div>
            {`${item.value} Satoshi`}
          </div>
        ))}
      </div>
    );

    return (
      <div>
        <List
          itemLayout="horizontal"
          dataSource={sortByFieldAscending(transactions, "creation_date")}
          renderItem={(item) => (
            <List.Item className="transactions--container__item">
              <List.Item.Meta
                avatar={<Avatar icon={<StockOutlined />} />}
                title={item.value + " " + "Satoshi"}
                description={
                  calcFiatFromSatoshi(exchangeRate ?? null, item.value) +
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
    <div className="transactions--container">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );
}

export default Transactions;
