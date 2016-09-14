import THREE from 'three';
import Rx from 'rx';
import '../../lib/gamepad/ViveController';

import { vrControls } from './controls';
import { scene } from './scene';
import { addRenderer, removeRenderer } from './renderer';

const controller1 = new THREE.ViveController(0);
controller1.standingMatrix = vrControls.getStandingMatrix();
controller1.userData.points = [new THREE.Vector3(), new THREE.Vector3()];
controller1.userData.matrices = [new THREE.Matrix4(), new THREE.Matrix4()];
scene.add(controller1);

const controller2 = new THREE.ViveController(1);
controller2.standingMatrix = vrControls.getStandingMatrix();
controller2.userData.points = [new THREE.Vector3(), new THREE.Vector3()];
controller2.userData.matrices = [new THREE.Matrix4(), new THREE.Matrix4()];
scene.add(controller2);

const loader = new THREE.OBJLoader();
loader.setPath('res/models/vive/');

loader.load('vive.obj', function (object) {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setPath('res/models/vive/');

  const controller = object.children[0];
  controller.material.map = textureLoader.load('onepointfive_texture.png');
  controller.material.specularMap = textureLoader.load('onepointfive_spec.png');

  controller1.add(object.clone());
  controller2.add(object.clone());
});

const controllerUpdate = () => {
  controller1.update();
  controller2.update();

  if (controller1.visible === false || controller2.visible === false) {
    console.log('No Vive controller found');
    removeRenderer(controllerUpdate);
  }
};

addRenderer(controllerUpdate);

export const triggerdown$ = Rx.Observable.fromEvent(controller1, 'triggerdown');
export const triggerup$ = Rx.Observable.fromEvent(controller1, 'triggerup');
