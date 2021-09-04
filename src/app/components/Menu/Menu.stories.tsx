import React from "react";

import Menu from ".";

export const Default = () => (
  <Menu>
    <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
      Menu
    </Menu.Button>
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
