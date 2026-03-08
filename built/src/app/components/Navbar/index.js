"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Navbar_1 = __importDefault(require("./Navbar"));
const NavbarLink_1 = __importDefault(require("./NavbarLink"));
const Navbar = Object.assign(Navbar_1.default, {
    Link: NavbarLink_1.default,
});
exports.default = Navbar;
