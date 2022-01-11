import React from 'react';
import Canvas from './components/Canvas';
import renderer, { onMouseMove, } from './renderer';
import { render } from 'react-dom';

class App extends React.Component {
  render () {
    return <Canvas render={renderer} onMouseMove={onMouseMove}/>;
  }
}

render(<App/>, document.getElementById('app'));
