import React from "react";
import CaretLeftIcon from "@bitcoin-design/bitcoin-icons/svg/filled/caret-left.svg";

import Header from ".";
import IconButton from "../IconButton";

export const Default = () => (
  <Header
    headerLeft={
      <IconButton
        onClick={() => alert("Go back")}
        icon={
          <img
            className="w-4 h-4"
            src={CaretLeftIcon}
            alt=""
            aria-hidden="true"
          />
        }
      />
    }
    title="Header bar"
  />
);

export default {
  title: "Components/Header",
  component: Header,
};
