import { Component } from "react";
import { toast } from "react-toastify";
import msg from "~/common/lib/msg";

class DevMenu extends Component {
  reset() {
    msg.request("reset").then((response) => {
      console.info(response);
      toast.success("Done, you can start over");
    });
  }

  initDevelopmentAccount() {
    toast.error("not implemented");
  }

  render() {
    return (
      <div className="flex items-center px-3 py-2 space-x-3 bg-gray-800 text-white">
        <span>Dev Menu</span>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => {
            this.initDevelopmentAccount();
          }}
        >
          Reset and add development account
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
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
