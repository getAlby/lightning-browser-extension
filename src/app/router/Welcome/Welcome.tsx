import PinExtension from "@screens/Onboard/PinExtension";
import SetPassword from "@screens/Onboard/SetPassword";
import TestConnection from "@screens/Onboard/TestConnection";
import ChooseConnector from "@screens/connectors/ChooseConnector";
import { useState } from "react";
import { Outlet, Route, HashRouter as Router, Routes } from "react-router-dom";
import Container from "~/app/components/Container";
import LocaleSwitcher from "~/app/components/LocaleSwitcher/LocaleSwitcher";
import Toaster from "~/app/components/Toast/Toaster";
import { AccountProvider } from "~/app/context/AccountContext";
import { SettingsProvider } from "~/app/context/SettingsContext";
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
  i18n.on("languageChanged", () => {
    // Trigger rerender to update displayed language
    setLanguageChanged(!languageChanged);
  });

  return (
    <div className="flex flex-col min-h-screen">
      <div className="ml-6 mt-4">
        <LocaleSwitcher className="text-sm border-transparent text-gray-600 hover:text-gray-700 bg-gray-100 dark:bg-surface-00dp dark:text-neutral-400 dark:hover:text-neutral-300" />
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
