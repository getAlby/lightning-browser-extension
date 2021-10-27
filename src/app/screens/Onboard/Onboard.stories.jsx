import React from "react";
import { MemoryRouter } from "react-router-dom";

import IntroScreen from "./Intro";
import ConnectScreen from "./Connect";
import ConnectLndScreen from "./ConnectLnd";
import TestConnectionScreen from "./TestConnection";
import SetPasswordScreen from "./SetPassword";

export const Intro = () => <IntroScreen />;
export const SetPassword = () => <SetPasswordScreen />;
export const Connect = () => <ConnectScreen />;
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
