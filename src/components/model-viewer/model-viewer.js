import React, { Component } from "react";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import withStores from "../../hocs/withStores";

import { Menu, Dropdown } from 'antd';

import { EyeInvisibleOutlined , StarFilled, StarTwoTone } from '@ant-design/icons';


class ModelViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            widthCoefficient: 0.625,
            disabled: true
        }
    }

    loadViewer = (scene, axesHelper, light, renderer, camera, highlightData) => {
        scene.add(axesHelper)

        const ambientLight = new THREE.AmbientLight();
        const directionalLight1 = new THREE.DirectionalLight(new THREE.Color('hsl(64, 33%, 83%)'),0.8);
        directionalLight1.position.set(-100, 0, -100);
                
        const directionalLight2 = new THREE.DirectionalLight(new THREE.Color('hsl(64, 33%, 83%)'),0.8);
        directionalLight2.position.set(100, 100, -100);

        scene.add(ambientLight, directionalLight1, directionalLight2);
       
        camera.position.z = 250;
        camera.position.x = 250;
        
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setSize(window.innerWidth * this.state.widthCoefficient, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        this.mount.appendChild(renderer.domElement);
        const loader = new GLTFLoader()
        loader.setDRACOLoader(new DRACOLoader().setDecoderPath('/draco/'));
        new Promise((res, rej) => {
            loader.load(
                '/models/34.glb',
                function (gltf) {
                    gltf.scene.traverse(function (child) {
                        if ((child).isMesh) {
                            let m = child
                            //the sphere and plane will not be mouse picked. THe plane will receive shadows while everything else casts shadows.
                            m.castShadow = true;
                            highlightData.pickableObjects.push(m);
                            //store reference to original materials for later

                            
                            m.material.polygonOffset = true;
                            m.depthTest = true;
                            m.material.polygonOffsetFactor = 0.5;
                            m.material.polygonOffsetUnits = 1;
                            m.material.color.convertSRGBToLinear();

                            let mat = m.material.clone();
                            m.material = mat.clone();
                            console.log(m.parent.name);

                            highlightData.originalMaterials[m.name] = (m).material;

                        }
                    })

                    scene.add(gltf.scene);
                    res();
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded')
                },
                (error) => {
                    console.log(error);
                }
            );
        }).then(()=> {

        })
    }

    componentDidMount() {
        const { modelStore } = this.props.stores;
        modelStore.initializeViewer(window);
        const { scene, axesHelper, light, renderer, controls, camera, highlightData } = modelStore.viewerData;
        this.loadViewer(scene, axesHelper, light, renderer, camera, highlightData);

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
        const { viewerData } = this.props.stores.modelStore;
        let { hoveredPart, selectedPart } = this.props.stores.modelStore;
        const { renderer, camera, highlightData } = viewerData;
        let { pickableObjects, intersectedObject, raycaster, intersects } = highlightData;
        
        const offset = {
            left: document.querySelector(".ant-col-4").offsetWidth,
            right: document.querySelector(".ant-col-5").offsetWidth,
        }
       
        raycaster.setFromCamera({
            x: ((event.clientX - offset.left) / renderer.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
            z: 0.5
        }, camera);
        intersects = raycaster.intersectObjects(pickableObjects, false);

        if (intersects.length > 0) {
            intersectedObject = intersects[0].object;
            this.mount.style.cursor = "pointer";
        } else {
            this.mount.style.cursor = "default";
            intersectedObject = null;
        }

        // TODO исправить подсвечивания у выделенного объекта
        pickableObjects.forEach((o, i) => {
            const isSelected = o === selectedPart;
            if (isSelected){
                o.material.transparent = false;
            }

            if (intersectedObject && intersectedObject.name === o.name ) {
                o.material.transparent = true;
                o.material.opacity = 0.8;
                hoveredPart = intersectedObject;
                
                if (intersectedObject === selectedPart){
                    return;
                }
                o.material.color = new THREE.Color("skyblue");
            } else {
                if (o === selectedPart){
                    return;
                }
                // ToDo исправить свет из массива чтобы брался
                o.material.color = new THREE.Color(1, 1,1);
                o.material.transparent = false;
            }
        })
    }

    onModelClick = (event) => {
        const { modelStore } = this.props.stores;
        const { renderer, camera, highlightData } = modelStore.viewerData;
        let { pickableObjects, intersectedObject, raycaster, intersects } = highlightData;

        const offset = {
            left: document.querySelector(".ant-col-4").offsetWidth,
        }
       
        raycaster.setFromCamera({
            x: ((event.clientX - offset.left) / renderer.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
            z: 0.5
        }, camera);
        intersects = raycaster.intersectObjects(pickableObjects, false);

        if (intersects.length > 0) {
            intersectedObject = intersects[0].object;
        } else {
            intersectedObject = null;
            return
        }
        
        pickableObjects.forEach((o, i) => {
            if (intersectedObject && intersectedObject.name === o.name) {
                modelStore.selectedPart = pickableObjects[i];
                pickableObjects[i].material.transparent = true;
                pickableObjects[i].material.color = new THREE.Color('#df1b1b');
                this.setState({
                    disabled: false
                })
            } else{
                pickableObjects[i].material.color = new THREE.Color(1,1,1);
            }
        })
    }

    onMenuVisibilityChange = (e) => {
        alert();
    }

    render() {
        const menu = (
            <Menu>
              <Menu.Item key="1" icon={<EyeInvisibleOutlined/>}>Скрыть</Menu.Item>
              <Menu.Item key="2" icon={<StarFilled />}>Сфокусироваться</Menu.Item>
              <Menu.Item key="3" icon={<StarTwoTone />}>Выделить</Menu.Item>
            </Menu>
          );

        return (
            <Dropdown overlay={menu} trigger={['contextMenu']}>
                <div ref={ref => (this.mount = ref)} onMouseMove={this.onMouseMove} onDoubleClick={this.onModelClick}/>
            </Dropdown>
        )
    }
}

export default withStores(ModelViewer);
