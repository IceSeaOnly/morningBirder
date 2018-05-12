import React, { Component } from 'react';
import MainData from './components/MainData';
import LiteTable from './components/LiteTable';

export default class Home extends Component {
  static displayName = 'Home';

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <div className="home-page">
    	<MainData/>
    	<LiteTable/>
    </div>
  }
}
