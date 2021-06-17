import React from "react";
import IntroScreen from "../app/screens/Onboard/Intro";
import ConnectLndScreen from "../app/screens/Onboard/ConnectLND";
import LastStepScreen from "../app/screens/Onboard/LastStep";
import TestConnectionScreen from "../app/screens/Onboard/TestConnection";
import SetPasswordScreen from "../app/screens/Onboard/SetPassword";

export const Intro = () => <IntroScreen />;
export const ConnectLnd = () => <ConnectLndScreen />;
export const LastStep = () => <LastStepScreen />;
export const SetPassword = () => <SetPasswordScreen />;
export const TestConnection = () => <TestConnectionScreen />;

export default {
  title: "Screens/Onboard",
};
