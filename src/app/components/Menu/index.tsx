import { Menu as MenuComponent, MenuButton } from "@reach/menu-button";

import MenuList from "./MenuList";
import MenuSubheader from "./MenuSubheader";
import MenuItem from "./MenuItem";
import MenuDivider from "./MenuDivider";

const Menu = Object.assign(MenuComponent, {
  Button: MenuButton,
  List: MenuList,
  Subheader: MenuSubheader,
  Item: MenuItem,
  Divider: MenuDivider,
});

export default Menu;
