import React from "react";
import PublisherCard from "./";

export const Default = () => (
  <PublisherCard
    title="The Biz with John Carvalho"
    image="https://picsum.photos/id/39/400/400"
  />
);

export default {
  title: "Components/PublisherCard",
  component: PublisherCard,
};
