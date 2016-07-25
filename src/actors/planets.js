import THREE from 'three';
import Rx from 'rx';

import THREEx from '../../lib/planets/threex.planets';

THREEx.Planets.baseURL = '/lib/planets/';
if(window.location.pathname.indexOf('/spaceship-shooter') === 0) {
  THREEx.Planets.baseURL = `/spaceship-shooter/${THREEx.Planets.baseURL}`;
}

import _, { createAtmosphereMaterial } from '../../lib/planets/threex.atmospherematerial';

import { scene } from '../tools/scene';
import { getRad  } from '../utils/misc';

const containerEarth = new THREE.Object3D();
containerEarth.position.y = -3400;
containerEarth.position.z = -20;
containerEarth.rotation.x = getRad(-90);
containerEarth.rotation.z = getRad(90);
scene.add(containerEarth);

const moonMesh = THREEx.Planets.createMoon(3000);
moonMesh.position.set(8000, 0, -1500);
moonMesh.scale.multiplyScalar(1/5);
moonMesh.receiveShadow = true;
moonMesh.castShadow	= true;
containerEarth.add(moonMesh);

const earthMesh = THREEx.Planets.createEarth(3000, 64);
earthMesh.receiveShadow = true;
earthMesh.castShadow = true;
containerEarth.add(earthMesh);

var geometry = new THREE.SphereGeometry(3000, 64, 64);
var material = createAtmosphereMaterial();
material.uniforms.glowColor.value.set(0x00b3ff);
material.uniforms.coeficient.value = 0.8;
material.uniforms.power.value = 2.0;

var mesh = new THREE.Mesh(geometry, material );
mesh.scale.multiplyScalar(1.005);
containerEarth.add( mesh );
// new THREEx.addAtmosphereMaterial2DatGui(material, datGUI)

var geometry = new THREE.SphereGeometry(3000, 64, 64);
var material = createAtmosphereMaterial();
material.side = THREE.BackSide;
material.uniforms.glowColor.value.set(0x00b3ff);
material.uniforms.coeficient.value = 0.5;
material.uniforms.power.value	= 4.0
var mesh = new THREE.Mesh(geometry, material );
mesh.scale.multiplyScalar(1.05);
containerEarth.add( mesh );
// new THREEx.addAtmosphereMaterial2DatGui(material, datGUI)

const earthCloud = THREEx.Planets.createEarthCloud(3000);
earthCloud.receiveShadow = true;
earthCloud.castShadow	= true;
containerEarth.add(earthCloud);

export const earth$ = Rx.Observable.of(containerEarth);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(0, 200, 6000);
sunLight.target.position.set(0, -3400, -6000);
scene.add(sunLight);
sunLight.castShadow = true;
sunLight.shadow.bias = 0.001;
// sunLight.shadow.Darkness = 0.2; ?? removed
sunLight.shadow.mapSize.Width = 1024;
sunLight.shadow.mapSize.Height = 1024;

const starField = THREEx.Planets.createStarfield(19900);

const showStarField$ = new Rx.BehaviorSubject(true);

showStarField$
  .subscribe(showStarField =>
    scene[showStarField ? 'add' : 'remove'](starField)
  );

export const enableStarField = (enabled) => showStarField$.onNext(enabled);
