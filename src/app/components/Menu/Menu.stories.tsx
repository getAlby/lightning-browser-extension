import React from "react";
import { PencilIcon } from "@heroicons/react/solid";

import Menu from ".";
import Badge from "../Shared/badge";

export const Default = () => (
  <Menu as="div" className="relative">
    <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
      Menu
    </Menu.Button>
    <Menu.List>
      <Menu.Subheader>Actions</Menu.Subheader>
      <Menu.ItemButton onClick={() => alert("Edit")}>
        <PencilIcon className="h-5 w-5 mr-2 text-gray-500" aria-hidden="true" />
        Edit
      </Menu.ItemButton>
      <Menu.ItemButton onClick={() => alert("Copy")}>
        Copy&nbsp;
        <Badge label="Badge" color="blue-500" textColor="white" small />
      </Menu.ItemButton>
      <Menu.Divider />
      <Menu.ItemButton onClick={() => alert("Delete")}>Delete</Menu.ItemButton>
    </Menu.List>
  </Menu>
);

export default {
  title: "Components/Menu",
  component: Menu,
};
