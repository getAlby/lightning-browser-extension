import React from "react";
import PublisherCard from "./";

const Template = (args) => <PublisherCard {...args} />;

export const Default = Template.bind({});

Default.args = {
  title: "The Biz with John Carvalho",
  image: "https://picsum.photos/id/39/400/400",
};

export default {
  title: "Components/PublisherCard",
  component: PublisherCard,
};
