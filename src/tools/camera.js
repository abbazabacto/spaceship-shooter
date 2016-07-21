import THREE from 'three';
import { getAspectRatio } from '../utils';
import { renderer } from './renderer';

const perspective = 75;
const aspect = getAspectRatio(renderer.domElement);
const near = 0.01;
const far = 1000;

const camera = new THREE.PerspectiveCamera(perspective, aspect, near, far);
camera.position.set(0, 0, 0);

export { camera };
