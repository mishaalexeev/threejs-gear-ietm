import { Menu, Dropdown } from 'antd';
import "./contextmenu.scss";

const menu = (
  <Menu>
    <Menu.Item key="1">1st menu item</Menu.Item>
    <Menu.Item key="2">2nd menu item</Menu.Item>
    <Menu.Item key="3">3rd menu item</Menu.Item>
  </Menu>
);

const ContextMenu = () => {
 return (
 <Dropdown overlay={menu} trigger={['contextMenu']}>
   
  </Dropdown>
 )
}