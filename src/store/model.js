import { observable, computed, makeObservable, action } from "mobx";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class ModelStore {

    modelsData = [];
    viewerData = {
        scene: null,
        axesHelper: null,
        camera: null,
        light: null,
        renderer: null,
        controls: null,
        highlightData: {
            pickableObjects: null,
            intersectedObject: null,
            originalMaterials: null,
            highlightedMaterial: null,
            raycaster: null,
            intersects: null
            }
        }
    selectedPart = {};
    hoveredPart = {};
        

    initializeViewer(window) {
        this.viewerData.scene = new THREE.Scene();
        this.viewerData.axesHelper = new THREE.AxesHelper(100);
        this.viewerData.camera = new THREE.PerspectiveCamera(75, 0.625*window.innerWidth / window.innerHeight, 0.1, 3000);
        //this.viewerData.light = new THREE.AmbientLight();
        this.viewerData.light = new THREE.DirectionalLight(new THREE.Color('hsl(30,100%,75%)'),0.8);
        this.viewerData.light.position.set(-100, 0, -100);
        

        this.viewerData.renderer = new THREE.WebGLRenderer();
        this.viewerData.renderer.setPixelRatio(window.devicePixelRatio > 1 ?  1 : window.devicePixelRatio);
        this.viewerData.renderer.setClearColor(new THREE.Color("ghostwhite"));

        this.viewerData.controls = new OrbitControls(this.viewerData.camera, this.viewerData.renderer.domElement);


        this.viewerData.highlightData.pickableObjects = new Array();
        this.viewerData.highlightData.originalMaterials = {};
        this.viewerData.highlightData.highlightedMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x00ff00 });
        this.viewerData.highlightData.raycaster = new THREE.Raycaster();
         
    }

    constructor(rootStore){
        this.rootStore = rootStore;
        makeObservable(this, {
            modelsData: observable,
            viewerData: observable,
            selectedPart: observable,
            hoveredPart: observable,
            initializeViewer: action
        })
    }
}
