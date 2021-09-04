import React from "react";
import { PencilIcon } from "@heroicons/react/solid";

import Menu from ".";
import Badge from "../Badge";

export const Default = () => (
  <Menu>
    <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
      Menu
    </Menu.Button>
    <Menu.List>
      <Menu.Subheader>Actions</Menu.Subheader>
      <Menu.Item onClick={() => alert("Edit")}>
        <PencilIcon className="h-5 w-5 mr-2 text-gray-500" aria-hidden="true" />
        Edit
      </Menu.Item>
      <Menu.Item onClick={() => alert("Copy")}>
        Copy&nbsp;
        <Badge label="Badge" color="blue-500" textColor="white" small />
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item onClick={() => alert("Delete")}>Delete</Menu.Item>
    </Menu.List>
  </Menu>
);

export default {
  title: "Components/Menu",
  component: Menu,
};
