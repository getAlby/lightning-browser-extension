import React from "react";

import { HashRouter, Link } from "react-router-dom";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <HashRouter>
          <h2>Do you have a lightning node</h2>
          <p>You need to first connect a lightning node.</p>
          <ul>
            <li>
              <Link to="/lnd/setup">Connect to your remote LND node</Link>
            </li>
            <li>
              <Link to="/help">Setup your wallet</Link>
            </li>
          </ul>
        </HashRouter>
      </div>
    );
  }
}

export default Home;
