import React from 'react';
import './App.css';
import { Row, Col } from 'antd';
import ModelViewer from './components/model-viewer';
import Menu from './components/menu'
import Info from './components/info'

const App = () => {
  return (
    <div className="App">
        <Row>
          <Col span={4}>
            <Menu/>
          </Col>
          <Col span={15} >
            <ModelViewer/> 
          </Col>
          <Col span={5}>
            <Info/>
          </Col>
        </Row>
    </div>
  );
}

export default App;
