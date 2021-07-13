import { Menu as MenuComponent } from "@reach/menu-button";

import MenuButton from "./MenuButton";
import MenuList from "./MenuList";
import MenuItem from "./MenuItem";

const Menu = Object.assign(MenuComponent, {
  Button: MenuButton,
  List: MenuList,
  Item: MenuItem,
});

export default Menu;
