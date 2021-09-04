import { Menu as MenuComponent } from "@headlessui/react";

import MenuList from "./MenuList";
import MenuSubheader from "./MenuSubheader";
import MenuItemButton from "./MenuItemButton";
import MenuDivider from "./MenuDivider";

const Menu = Object.assign(MenuComponent, {
  List: MenuList,
  Subheader: MenuSubheader,
  ItemButton: MenuItemButton,
  Divider: MenuDivider,
});

export default Menu;
