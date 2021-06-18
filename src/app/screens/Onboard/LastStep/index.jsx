import React from "react";
import Button from "../../../components/button";

export default function LastStep() {
  return (
    <div className="grid justify-items-center">
      <div className="mt-12 h-32">
        <img src="https://i.ibb.co/3F3mCkR/logox.png" />
      </div>
      <h1 className="text-3xl font-bold mt-5">You’re all set 🎉</h1>
      <p className="text-base text-gray-500 mt-6">
        Awesome. Now you’ve connected your node would you like to Do you want to
        go through a tutorial?
      </p>
      <div className="mt-10">
        <Button label="GO TO DEMO PUBLISHER" />
      </div>
    </div>
  );
}
