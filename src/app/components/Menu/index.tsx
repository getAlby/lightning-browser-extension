import { Menu as MenuComponent } from "@headlessui/react";

import MenuDivider from "./MenuDivider";
import MenuItemButton from "./MenuItemButton";
import MenuList from "./MenuList";
import MenuSubheader from "./MenuSubheader";

const Menu = Object.assign(MenuComponent, {
  List: MenuList,
  Subheader: MenuSubheader,
  ItemButton: MenuItemButton,
  Divider: MenuDivider,
});

export default Menu;
