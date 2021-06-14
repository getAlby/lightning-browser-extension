import React from "react";

import ListData from ".";

const metadata = {
  title: "Components/ListData",
  component: ListData,
};

export default metadata;

const Template = (args) => (
  <ListData {...args} onResetCallback={() => alert("Reset callback fn")} />
);

export const Default = Template.bind({});

Default.args = {
  data: [
    {
      title: "John Doe",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      title: "Karren Koe",
      description:
        "Etiam fermentum, nisi ac rhoncus auctor, nibh dui lacinia leo, eu laoreet erat dolor quis felis.",
    },
    {
      title: "Mark Moe",
      description: "Etiam in blandit augue.",
    },
  ],
  title: "List title",
};
