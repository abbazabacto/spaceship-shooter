import THREE from 'three';
import Rx from 'rx';

import THREEx from '../../lib/planets/threex.planets';
THREEx.Planets.baseURL = '../lib/planets/';

import _, { createAtmosphereMaterial } from '../../lib/planets/threex.atmospherematerial';

import { scene } from '../tools/scene';
import { getRad  } from '../utils/misc';

const mesh = THREEx.Planets.createEarth(2000);
mesh.position.y = -2400;
mesh.rotation.x = getRad(90);
mesh.rotation.y = getRad(90);
console.log(mesh);
scene.add(mesh);

export const earth$ = Rx.Observable.of(mesh);

var starSphere	= THREEx.Planets.createStarfield(490);
// scene.add(starSphere);
