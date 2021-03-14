import React from 'react';
import {Button, Spin} from "antd";
import {EyeOutlined, SyncOutlined} from "@ant-design/icons";
import withStores from "../../hocs/withStores";

const ModelViewerTools = (props) => {

    const store = props.stores.modelStore;

    const handleRestoreVisibilityClicked = (e) => {
        const {pickableObjects} = store.highlightData;
        pickableObjects.forEach((o, i) => {
            pickableObjects[i].parent.visible = true;
            store.hiddenObjects = [];
        });
    }

    return (
        <div className="viewer-tools">
            <Button type="default" icon={<EyeOutlined/>} size={"large"} onClick={handleRestoreVisibilityClicked}/>
        </div>
    );
}


export default withStores(ModelViewerTools);