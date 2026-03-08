"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tab_1 = require("./Tab");
const TabGroup_1 = __importDefault(require("./TabGroup"));
const TabList_1 = __importDefault(require("./TabList"));
const TabPanel_1 = __importDefault(require("./TabPanel"));
const TabPanels_1 = __importDefault(require("./TabPanels"));
const Tab = Object.assign(Tab_1.Tab, {
    Group: TabGroup_1.default,
    Panel: TabPanel_1.default,
    Panels: TabPanels_1.default,
    List: TabList_1.default,
});
exports.default = Tab;
