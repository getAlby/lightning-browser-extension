"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@headlessui/react");
const MenuDivider_1 = __importDefault(require("./MenuDivider"));
const MenuItemButton_1 = __importDefault(require("./MenuItemButton"));
const MenuList_1 = __importDefault(require("./MenuList"));
const MenuSubheader_1 = __importDefault(require("./MenuSubheader"));
const Menu = Object.assign(react_1.Menu, {
    List: MenuList_1.default,
    Subheader: MenuSubheader_1.default,
    ItemButton: MenuItemButton_1.default,
    Divider: MenuDivider_1.default,
});
exports.default = Menu;
