import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

function loadModel(onModelLoadSuccess, onModelLoadFailure, onModelLoadProgress) {
    const glTFLoader = new GLTFLoader();
    
    glTFLoader.setDRACOLoader(new DRACOLoader().setDecoderPath('/draco/'));

    glTFLoader.load('/models/gear.glb',
        function (gltf) {
            let boundBox = new THREE.Box3().setFromObject(gltf.scene);
            let size = new THREE.Vector3(); boundBox.getSize(size);
            let longestSide = Math.max(size.x, size.y, size.z);

            /*
            *   Сетка 
            */
            var gridHelper = new THREE.GridHelper(longestSide * 2, 10);
            let gridMmPerRect = (longestSide * 2) / 10;

            let center = new THREE.Vector3(); boundBox.getCenter(center);
            gridHelper.position.set(center.x, boundBox.min.y, center.z);
            gridHelper.name = '__Grid'
            gltf.scene.add(gridHelper);

            let homeViewCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 10000);
            let offset = longestSide / (2.0 * Math.tan(homeViewCamera.fov * (Math.PI / 360.0)));

            let manualCameraObj = gltf.scene.getObjectByName('ManualCamera');
            if (manualCameraObj) {
                homeViewCamera.position.copy(manualCameraObj.position.clone());
                homeViewCamera.rotation.copy(manualCameraObj.rotation.clone());
                homeViewCamera.quaternion.copy(manualCameraObj.quaternion.clone());
            }
            else {
                homeViewCamera.position.set(offset, offset, offset);
            }
            
            homeViewCamera.name = '__MainCamera';

            let homeViewTarget = new THREE.Object3D();
            homeViewTarget.position.copy(center.clone());
            homeViewTarget.name = '__MainTarget';

            let catalogCamera = homeViewCamera.clone();
            catalogCamera.name = '__CatalogCamera';

            let catalogTarget = homeViewTarget.clone();
            catalogTarget.name = '__CatalogTarget';

            //Камера и цель - для возвращения к первоначальной позиции 
            let defaultCamera = homeViewCamera.clone();
            defaultCamera.name = '__DefaultCamera';

            let defaultTarget = homeViewTarget.clone();
            defaultTarget.name = '__DefaultTarget';

            gltf.scene.add(homeViewCamera, homeViewTarget, catalogCamera, catalogTarget, defaultCamera, defaultTarget);
            

            if (manualCameraObj) {
                let manualCamera = manualCameraObj.getObjectByName('ManualCamera_Orientation');

                let manualFreeCamera = manualCamera.clone();
                manualFreeCamera.name = '__ManualCamera';
                manualFreeCamera.position.copy(manualCameraObj.position.clone());
                manualFreeCamera.rotation.copy(manualCameraObj.rotation.clone());
                manualFreeCamera.quaternion.copy(manualCameraObj.quaternion.clone());

                let manualTarget = new THREE.Object3D();
                const trackPoint = gltf.scene.getObjectByName('TrackTo');
                manualTarget.position.copy(trackPoint.position.clone());
                manualTarget.name = '__ManualTarget';

                gltf.scene.add(manualFreeCamera, manualTarget);
            }

            onModelLoadSuccess(gltf.scene, gltf.animations, gridMmPerRect)
        },

        function (xhr) {
            if (onModelLoadProgress)
                onModelLoadProgress((xhr.loaded / xhr.total * 100));
        },

        function (error) {
            if (onModelLoadFailure)
                onModelLoadFailure(error);
        })
}

export default loadModel;