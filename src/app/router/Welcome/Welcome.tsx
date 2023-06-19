import PinExtension from "@screens/Onboard/PinExtension";
import SetPassword from "@screens/Onboard/SetPassword";
import TestConnection from "@screens/Onboard/TestConnection";
import ChooseConnector from "@screens/connectors/ChooseConnector";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, Route, HashRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Container from "~/app/components/Container";
import { SettingsProvider } from "~/app/context/SettingsContext";
import { getConnectorRoutes, renderRoutes } from "~/app/router/connectorRoutes";
import ChooseConnectorPath from "~/app/screens/connectors/ChooseConnectorPath";
import i18n from "~/i18n/i18nConfig";

const connectorRoutes = getConnectorRoutes();

function Welcome() {
  return (
    <SettingsProvider>
      <Router>
        <ToastContainer
          autoClose={15000}
          hideProgressBar={true}
          className="w-fit max-w-2xl"
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<SetPassword />} />
            <Route path="choose-path">
              <Route
                index={true}
                element={<ChooseConnectorPath fromWelcome />}
              ></Route>
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
    </SettingsProvider>
  );
}

function Layout() {
  const { t } = useTranslation();

  const [languageChanged, setLanguageChanged] = useState(false);
  i18n.on("languageChanged", () => {
    // Trigger rerender to update displayed language
    setLanguageChanged(!languageChanged);
  });

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center font-serif font-medium text-2xl my-10 dark:text-white">
          <p>
            {t("welcome.title")}
            <img
              src="assets/icons/alby_icon_yellow.svg"
              alt="Alby"
              className="dark:hidden inline align-middle w-6 ml-2"
            />
            <img
              src="assets/icons/alby_icon_yellow_dark.svg"
              alt="Alby"
              className="hidden dark:inline align-middle w-6 ml-2"
            />
          </p>
        </div>
      </div>
      <Container maxWidth="xl">
        <Outlet />
      </Container>
    </div>
  );
}

export default Welcome;
