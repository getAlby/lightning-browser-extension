import { Tab as TabComponent } from "./Tab";
import TabGroup from "./TabGroup";
import TabList from "./TabList";
import TabPanel from "./TabPanel";
import TabPanels from "./TabPanels";

const Tab = Object.assign(TabComponent, {
  Group: TabGroup,
  Panel: TabPanel,
  Panels: TabPanels,
  List: TabList,
});

export default Tab;
