import React from "react";

import { HashRouter, Link } from "react-router-dom";

class Success extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <HashRouter>
          <h2>Success</h2>
          <p>Yay!</p>
        </HashRouter>
      </div>
    );
  }
}

export default Success;
