import { MemoryRouter } from "react-router-dom";
import { Meta } from "@storybook/react/types-6-0";

import IntroScreen from "./Intro";
import ChooseConnectorScreen from "./ChooseConnector";
import ConnectLndScreen from "./ConnectLnd";
import TestConnectionScreen from "./TestConnection";
import SetPasswordScreen from "./SetPassword";

export const Intro = () => <IntroScreen />;
export const SetPassword = () => <SetPasswordScreen />;
export const ChooseConnector = () => (
  <ChooseConnectorScreen title="Add a new lightning account" />
);
export const ConnectLnd = () => <ConnectLndScreen />;
export const TestConnection = () => <TestConnectionScreen />;

const metadata: Meta = {
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

export default metadata;
