import NavbarComponent from "./Navbar";
import NavbarLink from "./NavbarLink";

const Navbar = Object.assign(NavbarComponent, {
  Link: NavbarLink,
});

export default Navbar;
