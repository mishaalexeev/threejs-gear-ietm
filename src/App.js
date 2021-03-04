import React, {useRef, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import { Row, Col, Divider } from 'antd';
import ModelViewer from './components/model-viewer';
import Menu from './components/menu'
import Info from './components/info'

const App = () => {
  const parentRef = useRef(null);
  let parentHeight;
  useEffect ( () => {
        
    if(parentRef.current){
      console.log(parentRef.current);
      parentHeight = parentRef.current.offsetHeight; 
    }
    
}, [parentRef]);

  return (
    <div className="App">
        <Row>
          <Col span={4}>
            <Menu/>
          </Col>
          <Col span={15} ref={parentRef}>
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
