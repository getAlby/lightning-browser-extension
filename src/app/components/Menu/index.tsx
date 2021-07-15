import { Menu as MenuComponent, MenuButton } from "@reach/menu-button";

import MenuList from "./MenuList";
import MenuItem from "./MenuItem";

const Menu = Object.assign(MenuComponent, {
  Button: MenuButton,
  List: MenuList,
  Item: MenuItem,
});

export default Menu;
