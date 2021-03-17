import React, {useState, useEffect, useRef} from 'react';
import {Menu, Dropdown} from 'antd';
import "./contextmenu.css";
import withStores from "../../hocs/withStores";
import {EyeInvisibleOutlined, StarFilled, StarTwoTone} from "@ant-design/icons";


const ContextMenu = (props) => {
    const [xPos, setXPos] = useState(0);
    const [yPos, setYPos] = useState(0);
    const [open, setOpen] = useState(false);


    const handleContextMenu = (event) => {
        const intersects = props.stores.modelStore.getIntersects(event.clientX, event.clientY);

        setXPos(event.clientX - props.stores.modelStore.offset.left);
        setYPos(event.clientY);
        setOpen(intersects.length > 0);
    }

    const menuItemClicked = (event) => {
        setOpen(false);
        //ToDo исправить сложение и вычитания offset
        props.menuItemClicked(event.key, xPos + props.stores.modelStore.offset.left, yPos);
    }
    return (
        <>
            <Menu className="viewer-context-menu"
                  onClick={menuItemClicked}
                  hidden={!open}
                  style={{
                      top: yPos,
                      left: xPos
                  }}
            >
                <Menu.Item key="1" icon={<EyeInvisibleOutlined/>}>Скрыть</Menu.Item>
                <Menu.Item key="2" icon={<StarFilled/>}>Изолировать</Menu.Item>
                <Menu.Item key="3" icon={<StarTwoTone/>}>Выделить</Menu.Item>
            </Menu>

            <div
                className="viewer-context-menu-content"
                onContextMenu={handleContextMenu}
            >
                {props.children}
            </div>
        </>
    )
}

export default withStores(ContextMenu);
