import PinExtension from "@screens/Onboard/PinExtension";
import SetPassword from "@screens/Onboard/SetPassword";
import TestConnection from "@screens/Onboard/TestConnection";
import ChooseConnector from "@screens/connectors/ChooseConnector";
import { useEffect, useState } from "react";
import {
  Outlet,
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Container from "~/app/components/Container";
import LocaleSwitcher from "~/app/components/LocaleSwitcher/LocaleSwitcher";
import Toaster from "~/app/components/Toast/Toaster";
import { AccountProvider } from "~/app/context/AccountContext";
import { SettingsProvider } from "~/app/context/SettingsContext";
import PinMeHereIcon from "~/app/icons/PinMeHereIcon";
import { getConnectorRoutes, renderRoutes } from "~/app/router/connectorRoutes";
import ChooseConnectorPath from "~/app/screens/connectors/ChooseConnectorPath";
import i18n from "~/i18n/i18nConfig";

const connectorRoutes = getConnectorRoutes();

function Welcome() {
  return (
    <SettingsProvider>
      <AccountProvider>
        <Router>
          <Toaster />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<SetPassword />} />
              <Route path="choose-path">
                <Route index={true} element={<ChooseConnectorPath />}></Route>
                <Route path="choose-connector">
                  <Route
                    index={true}
                    element={
                      <ChooseConnector
                        title={i18n.t("translation:choose_connector.title")}
                        description={i18n.t(
                          "translation:choose_connector.description"
                        )}
                        connectorRoutes={connectorRoutes}
                      />
                    }
                  ></Route>
                  {renderRoutes(connectorRoutes)}
                </Route>
              </Route>
              <Route path="test-connection" element={<TestConnection />} />
              <Route path="pin-extension" element={<PinExtension />} />
            </Route>
          </Routes>
        </Router>
      </AccountProvider>
    </SettingsProvider>
  );
}

function Layout() {
  const [languageChanged, setLanguageChanged] = useState(false);
  const [isPinScreen, setPinScreen] = useState(false);
  const location = useLocation();
  i18n.on("languageChanged", () => {
    // Trigger rerender to update displayed language
    setLanguageChanged(!languageChanged);
  });

  // Check if the current path is the pin-extension screen
  useEffect(() => {
    const checkHash = () => {
      const isPinExtensionScreen = location.pathname.includes("pin-extension");
      setPinScreen(isPinExtensionScreen);
    };
    checkHash();
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative flex ml-6 mr-[8%]">
        <LocaleSwitcher className="absolute left-0 top-4 text-sm text-gray-600 hover:text-gray-700 bg-gray-100 dark:bg-surface-00dp dark:text-neutral-400 dark:hover:text-neutral-300 border-transparent" />
        {isPinScreen && (
          <PinMeHereIcon className="ml-auto text-gray-600 dark:text-gray-400" />
        )}
      </div>
      <div className="flex flex-1 justify-center items-center">
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}

export default Welcome;
