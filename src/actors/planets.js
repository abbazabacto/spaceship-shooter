import THREE from 'three';
import Rx from 'rx';

import THREEx from '../../lib/planets/threex.planets';

THREEx.Planets.baseURL = '/lib/planets/';
if(window.location.pathname.indexOf('/spaceship-shooter') === 0) {
  THREEx.Planets.baseURL = `/spaceship-shooter/${THREEx.Planets.baseURL}`;
}

import _, { createAtmosphereMaterial } from '../../lib/planets/threex.atmospherematerial';

import { scene, addRenderer, rendererToggle$, createGui } from '../tools';
import { getRad, getDeg, createModel } from '../utils';

var loader = new THREE.TextureLoader();

const containerEarth = new THREE.Object3D();
containerEarth.position.y = -3400;
containerEarth.position.z = -20;
scene.add(containerEarth);

const moonGeometry = new THREE.SphereGeometry(3000 / 5, 16, 16);
const moonMaterial = new THREE.MeshPhongMaterial({
  map: loader.load('dist/res/models/planets/moon/moon-col.jpg'),
  normalMap: loader.load('dist/res/models/planets/moon/moon-nrm.jpg'),
  normalScale: new THREE.Vector2(3,3),
  emissive: new THREE.Color(0.12, 0.12, 0.12),
  emissiveIntensity: 1,
});

const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.position.z = -8000;
moonMesh.position.y = -1500;
moonMesh.rotation.x = getRad(90);
moonMesh.rotation.z = getRad(90);
moonMesh.receiveShadow = true;
moonMesh.castShadow	= true;
containerEarth.add(moonMesh);

const earthGeometry = new THREE.SphereGeometry(3000, 64, 64);
const earthMaterial	= new THREE.MeshPhongMaterial({
  map	: loader.load('dist/res/models/planets/earth/earth-night.png'),
  normalMap	: loader.load('dist/res/models/planets/earth/earth-normal.png'),
  normalScale: new THREE.Vector2(0.384084,0.384084),
  specularMap : loader.load('dist/res/models/planets/earth/earth-spec.png'),
  specular : new THREE.Color('grey'),
  shininess: 30,
  emissive: new THREE.Color(1,1,0.8),
  emissiveMap	: loader.load('dist/res/models/planets/earth/earth-emission.png'),
  emissiveIntensity: 0.5,
});

const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.rotation.x = getRad(-30);
earthMesh.rotation.z = getRad(40);
earthMesh.receiveShadow = true;
earthMesh.castShadow = true;
containerEarth.add(earthMesh);

const earthCloudsGeometry = new THREE.SphereGeometry(3000, 64, 64);
const earthCloudsMaterial = new THREE.MeshBasicMaterial({
  map: loader.load('dist/res/models/planets/earth/earth-clouds-darker.png'),
  blending: THREE.AdditiveBlending,
  transparent: true,
});

const earthCloudsMesh = new THREE.Mesh(earthCloudsGeometry, earthCloudsMaterial);
earthCloudsMesh.scale.multiplyScalar(1.0025);
earthCloudsMesh.rotation.x = getRad(-280);
earthCloudsMesh.rotation.y = getRad(45);
earthCloudsMesh.rotation.z = getRad(-90);
earthCloudsMesh.receiveShadow = true;
earthCloudsMesh.castShadow	= true;
containerEarth.add(earthCloudsMesh);

const atmosphereGeometry = new THREE.SphereGeometry(3000, 64, 64);
const atmosphereMaterial = createAtmosphereMaterial();
atmosphereMaterial.uniforms.glowColor.value.set(0x00b3ff);
atmosphereMaterial.uniforms.coeficient.value = 0.9;
atmosphereMaterial.uniforms.power.value = 2.5;

const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
atmosphereMesh.scale.multiplyScalar(1.005);
containerEarth.add(atmosphereMesh);

const atmosphereGlowGeometry = new THREE.SphereGeometry(3000, 64, 64);
const atmosphereGlowMaterial = createAtmosphereMaterial();
atmosphereGlowMaterial.side = THREE.BackSide;
atmosphereGlowMaterial.uniforms.glowColor.value.set(0x00b3ff);
atmosphereGlowMaterial.uniforms.coeficient.value = 0.5;
atmosphereGlowMaterial.uniforms.power.value	= 5.0;

const atmosphereGlowMesh = new THREE.Mesh(atmosphereGlowGeometry, atmosphereGlowMaterial);
atmosphereGlowMesh.scale.multiplyScalar(1.05);
containerEarth.add(atmosphereGlowMesh);

export const earth$ = Rx.Observable.of(containerEarth);

createGui('containerEarth rotation x', 0, 0, 360)
  .subscribe(rotation => {
    containerEarth.rotation.x = getRad(rotation);
  });

addRenderer(({ delta }) => {
  containerEarth.rotation.x += getRad(0.3) * delta;
  earthCloudsMesh.rotation.y -= getRad(0.15) * delta;
});

const sunLight = new THREE.DirectionalLight(0xffddee, 0.65);
sunLight.position.set(0, 200, 6000);
sunLight.target.position.set(0, -3400, -6000);
sunLight.castShadow = true;
sunLight.shadow.bias = 0.001;
// sunLight.shadow.Darkness = 0.2; ?? removed
sunLight.shadow.mapSize.Width = 1024;
sunLight.shadow.mapSize.Height = 1024;
scene.add(sunLight);

const starFieldGeometry = new THREE.SphereGeometry(19900, 32, 32);
const starFieldMaterial	= new THREE.MeshBasicMaterial({
  map	: loader.load('dist/res/models/planets/starfield/star-environment-darker3.png'),
  side : THREE.BackSide
});
const starFieldMesh	= new THREE.Mesh(starFieldGeometry, starFieldMaterial);
starFieldMesh.rotation.x = getRad(-149);
starFieldMesh.rotation.y = getRad(-235);
starFieldMesh.rotation.z = getRad(139);

rendererToggle$
  .startWith({})
  .subscribe(({ webRtcVideo }) =>
    scene[webRtcVideo ? 'remove' : 'add'](starFieldMesh)
  );
