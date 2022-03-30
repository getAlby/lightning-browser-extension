import { Component } from "react";

import utils from "../../../common/lib/utils";

class DevMenu extends Component {
  reset() {
    utils.call("reset").then((response) => {
      console.log(response);
      alert("Done, you can start over");
    });
  }

  initDevelopmentAccount() {
    alert("not implemented");
  }

  render() {
    return (
      <div className="flex items-center px-3 py-2 space-x-3 bg-gray-800 text-white">
        <span>Dev Menu</span>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => {
            this.initDevelopmentAccount();
          }}
        >
          Reset and add development account
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => {
            this.reset();
          }}
        >
          Reset Everything
        </button>
      </div>
    );
  }
}

export default DevMenu;
