import React from "react";
import qs from "query-string";
import { createHashHistory } from "history";
import { HashRouter, Route, Switch } from "react-router-dom";

//import "./styles.scss";

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return <div>Hallo</div>;
  }
}

export default Welcome;
