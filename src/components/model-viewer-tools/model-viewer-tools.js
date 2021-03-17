import React from 'react';
import {Button, Space, Spin} from "antd";
import {EyeOutlined, SyncOutlined} from "@ant-design/icons";
import withStores from "../../hocs/withStores";

const ModelViewerTools = (props) => {

    const store = props.stores.modelStore;

    const handleRestoreVisibilityClicked = () => {
        const {pickableObjects} = store.highlightData;
        pickableObjects.forEach((o, i) => {
            pickableObjects[i].parent.visible = true;
            store.hiddenObjects = [];
        });
    }
    const handleRotateClicked = () => {
        store.viewerData.controls.autoRotate = !store.viewerData.controls.autoRotate;
    }

    return (
        <Space className="viewer-tools">
            <Button type="default" icon={<EyeOutlined/>} size={"large"} onClick={handleRestoreVisibilityClicked}/>
            <Button type="default" icon={<SyncOutlined/>} size={"large"} onClick={handleRotateClicked}/>
        </Space>
    );
}


export default withStores(ModelViewerTools);