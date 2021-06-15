import React from "react";
import Card from "../app/components/Onboard/Shared/card";
import '../app/styles/index.css';

export const Primary = () => <Card color="red-bitcoin" alias="HeroNode" satoshis="12350283" fiat="32480.56" currency="EUR"/>;

export default {
  title: "Components/Card",
  component: Card,
};
