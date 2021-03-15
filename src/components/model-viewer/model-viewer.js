import React, {Component} from "react";
import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import withStores from "../../hocs/withStores";

import {Menu, Dropdown, Spin} from 'antd';
import {EyeInvisibleOutlined, StarFilled, StarTwoTone} from '@ant-design/icons';
import "./model-viewer.css";
import ModelViewerTools from "../model-viewer-tools/model-viewer-tools";

class ModelViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            widthCoefficient: 0.625,
            disabled: true,
            eventDropdownMenu: null,
            isLoading: true
        }
        this.store = props.stores.modelStore;
    }

    loadViewer = (scene, axesHelper, light, renderer, camera, highlightData) => {
        scene.add(axesHelper)

        const ambientLight = new THREE.AmbientLight();
        const directionalLight1 = new THREE.DirectionalLight(new THREE.Color('hsl(64, 33%, 83%)'), 0.8);
        directionalLight1.position.set(-100, 0, -100);

        const directionalLight2 = new THREE.DirectionalLight(new THREE.Color('hsl(64, 33%, 83%)'), 0.8);
        directionalLight2.position.set(100, 100, -100);

        scene.add(ambientLight, directionalLight1, directionalLight2);

        camera.position.z = 250;
        camera.position.x = 250;

        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setSize(window.innerWidth * this.state.widthCoefficient, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        this.mount.appendChild(renderer.domElement);
        const loader = new GLTFLoader()
        loader.setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/js/libs/draco/'));
        new Promise((res, rej) => {
            loader.load(
                '/models/Редуктор в гараже 2-2.glb',
                function (gltf) {
                    gltf.scene.traverse(function (child) {
                        if ((child).isMesh) {
                            const m = child;
                            m.castShadow = true;
                            highlightData.pickableObjects.push(m);
                            //store reference to original materials for later
                            m.material.polygonOffset = true;
                            m.depthTest = true;
                            m.material.polygonOffsetFactor = 0.5;
                            m.material.polygonOffsetUnits = 1;
                            m.material.color.convertSRGBToLinear();

                            const mat = m.material.clone();
                            m.material = mat.clone();

                            highlightData.originalMaterials[m.id] = mat;

                        }
                    });
                    scene.add(gltf.scene);
                    res();
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    console.log(error);
                    rej();
                }
            );
        }).then(() => {
           this.setState({
               isLoading: false
           })
        })
    }

    componentDidMount() {
        this.store.initializeViewer(window);
        const {scene, axesHelper, light, renderer, controls, camera} = this.store.viewerData;
        this.loadViewer(scene, axesHelper, light, renderer, camera, this.store.highlightData);

        // Добавление слушателя на изменения размера окна для изменения aspect камеры и размеров viewer.
        const onWindowResize = () => {
            camera.aspect = window.innerWidth * this.state.widthCoefficient / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth * this.state.widthCoefficient, window.innerHeight);
            render();
        }
        window.addEventListener('resize', onWindowResize, false)

        //Вывод сцены на экран
        const render = () => {
            renderer.render(scene, camera);
        }

        // Three js loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            render();
        };

        animate();
    }

    onMouseMove = (event) => {
        const {viewerData, getIntersects} = this.store;
        let {selectedPart, hiddenObjects, highlightData, intersectedObject} = this.store;
        let {pickableObjects, raycaster, intersects} = highlightData;

        intersects = this.store.getIntersects(event.clientX, event.clientY);
        this.store.setIntersectedObject(intersects);
        this.mount.style.cursor = intersectedObject ? "pointer" : "default";

        pickableObjects.forEach((o, i) => {
            const isSelected = o === selectedPart;
            if (isSelected) {
                //o.material.transparent = false;
            }

            if (intersectedObject && intersectedObject.name === o.name) {
                o.material.transparent = true;
                o.material.opacity = 0.8;
                //this.props.stores.modelStore.hoveredPart = intersectedObject;

                if (intersectedObject === selectedPart) {
                    return;
                }
                o.material.color = new THREE.Color("blue");
            } else {
                if (o === selectedPart) {
                    return;
                }

                o.material.color = (highlightData.originalMaterials[
                    o.id
                    ]).color;
                o.material.transparent = false;
            }
        })
    }

    onModelClick = (event) => {
        const {renderer, camera} = this.store.viewerData;
        const {hiddenObjects, highlightData, intersectedObject, selectedPart} = this.store;
        let {pickableObjects, raycaster} = highlightData;

        const intersects = this.store.getIntersects(event.clientX, event.clientY);

        this.store.setSelectedObject(intersects);
        this.mount.style.cursor = intersectedObject ? "pointer" : "default";

        pickableObjects.forEach((o, i) => {
            if (selectedPart && intersectedObject.name === o.name) {
                pickableObjects[i].material.transparent = true;
                pickableObjects[i].material.color = new THREE.Color('#df1b1b');
                this.setState({
                    disabled: false
                })
            } else {
                o.material.color = (highlightData.originalMaterials[
                    o.id
                    ]).color;
            }
        })
    }

    onMenuVisibilityChange = (e) => {
        alert();
    }

    menuItemClicked = (e) => {
        const {hiddenObjects, highlightData} = this.store;
        const {renderer, camera} = this.store.viewerData;
        let {pickableObjects, intersectedObject, raycaster, intersects} = highlightData;


        switch (e.key) {

            case "1":
                const event = e.domEvent;

                intersects = this.store.getIntersects(event.clientX, event.clientY);
                this.store.setIntersectedObject(intersects);
                this.mount.style.cursor = intersectedObject ? "pointer" : "default";


                if (intersects.length > 0) {
                    const intersect = intersects.find((el) => {
                        return hiddenObjects.indexOf(el.object) === -1;
                    });

                    if (typeof intersect === "undefined") {
                        this.mount.style.cursor = "default";
                        intersectedObject = null;
                    } else {
                        this.mount.style.cursor = "pointer";
                        intersectedObject = intersect.object;
                        hiddenObjects.push(intersectedObject);
                    }

                } else {
                    intersectedObject = null;
                    return
                }

                pickableObjects.forEach((o, i) => {
                    if (intersectedObject && intersectedObject.name === o.name) {
                        pickableObjects[i].parent.visible = false;
                        this.store.hiddenObjects.push(o);

                    } else {
                        o.material.color = (highlightData.originalMaterials[
                            o.id
                            ]).color;
                    }
                })
                break;
            //Изоляция детали
            case "2":
                break;
            //Выделение детали
            case "3":
                break;
            default:
                break;

        }
    }

    dropdownVisibleChange = (flag) => {
        if (flag) {

        }
    }

    render() {
        const menu = (
            <Menu onClick={this.menuItemClicked}>
                <Menu.Item key="1" icon={<EyeInvisibleOutlined/>}>Скрыть</Menu.Item>
                <Menu.Item key="2" icon={<StarFilled/>}>Изолировать</Menu.Item>
                <Menu.Item key="3" icon={<StarTwoTone/>}>Выделить</Menu.Item>
            </Menu>
        );

        return (
            <Spin spinning={this.state.isLoading} size="large">
                <Dropdown overlay={menu} trigger={['contextMenu']}>
                    <div ref={ref => (this.mount = ref)} onMouseMove={this.onMouseMove} onDoubleClick={this.onModelClick}/>
                </Dropdown>

                <ModelViewerTools/>

            </Spin>
        )
    }
}

export default withStores(ModelViewer);
