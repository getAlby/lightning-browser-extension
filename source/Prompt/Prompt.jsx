import React, {useState} from 'react';
import browser from 'webextension-polyfill';

import './styles.scss';

export default class Prompt extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount () {
  }

  render () {
    return (
      <section id="prompt">
        <h2>Enable</h2>
      </section>
    );
  }
};
