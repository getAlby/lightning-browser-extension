import React from "react";
import { MemoryRouter } from "react-router-dom";

import IntroScreen from "../app/screens/Onboard/Intro";
import ChooseConnectorScreen from "../app/screens/Onboard/ChooseConnector";
import ConnectLndScreen from "../app/screens/Onboard/ConnectLnd";
import TestConnectionScreen from "../app/screens/Onboard/TestConnection";
import SetPasswordScreen from "../app/screens/Onboard/SetPassword";

export const Intro = () => <IntroScreen />;
export const SetPassword = () => <SetPasswordScreen />;
export const ChooseConnector = () => <ChooseConnectorScreen />;
export const ConnectLnd = () => <ConnectLndScreen />;
export const TestConnection = () => <TestConnectionScreen />;

export default {
  title: "Screens/Onboard",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="container mx-auto">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};
