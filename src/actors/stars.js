import THREE from 'three';
import Rx from 'rx';

import { scene } from '../tools';
import { randomFromRange } from '../utils';

const starGeometries = [createStarGeometry(0.25)];
// const starGeometries = [createStarGeometry(0.15), createStarGeometry(1), createStarGeometry(5)];
const starMaterial = new THREE.MeshBasicMaterial({
  color: 0xf1f1f1
});

export const stars$ = Rx.Observable.range(0, 1000)
  .map(function () {
    var star = new THREE.Mesh(starGeometries[Math.floor(Math.random() * starGeometries.length)], starMaterial);
    star.position.x = randomFromRange(-500, 500);
    star.position.y = randomFromRange(-500, 500);
    star.position.z = randomFromRange(-500, 500);
    
    scene.add(star);
    
    return star;
  })
  .toArray()
  .startWith([]);

function createStarGeometry(size) {
  return new THREE.SphereGeometry(size, 16, 8);
}
