import THREE from 'three';
import Rx from 'rx';

import { scene } from '../tools';
import { randomFromRange } from '../utils';

const starGeometry = new THREE.SphereGeometry(0.5, 16, 8);
const starMaterial = new THREE.MeshBasicMaterial({
  color: 0xf1f1f1
});

export const stars$ = Rx.Observable.range(0, 1000)
  .map(function () {
    var star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.x = randomFromRange(-500, 500);
    star.position.y = randomFromRange(-500, 500);
    star.position.z = randomFromRange(-500, 500);
    
    scene.add(star);
    
    return star;
  })
  .toArray()
  .startWith([]);