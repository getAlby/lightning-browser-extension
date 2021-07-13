import React from "react";

import Menu from ".";

export const Default = () => (
  <Menu>
    <Menu.Button>Menu</Menu.Button>
    <Menu.List>
      <Menu.Item onClick={() => alert("Edit")}>Edit</Menu.Item>
      <Menu.Item onClick={() => alert("Copy")}>Copy</Menu.Item>
      <Menu.Item onClick={() => alert("Delete")}>Delete</Menu.Item>
    </Menu.List>
  </Menu>
);

export default {
  title: "Components/Menu",
  component: Menu,
};
