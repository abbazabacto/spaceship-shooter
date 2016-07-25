import THREE from 'three';
import Rx from 'rx';

import { scene, createGui } from '../tools';
import { randomFromRange, range } from '../utils';

// const starGeometries = [createStarGeometry(0.25)];
const starGeometries = [createStarGeometry(1), createStarGeometry(0.25), createStarGeometry(0.5)];
const starMaterial = new THREE.MeshBasicMaterial({
  color: 0xf1f1f1
});

const STARSAMOUNT_INITIAL = 50;

const addStars$ = createGui('stars', STARSAMOUNT_INITIAL, 0, 1000, 50)
  .debounce(1000)
  .map(starsAmount => parseInt(starsAmount, 10))
  .startWith(STARSAMOUNT_INITIAL)
  .flatMap(starsAmount =>
    Rx.Observable.of(
      range(0, starsAmount)
        .map((stars) => {
          const star = new THREE.Mesh(starGeometries[Math.floor(Math.random() * starGeometries.length)], starMaterial);
          star.position.x = randomFromRange(-500, 500);
          star.position.y = randomFromRange(-500, 500);
          star.position.z = randomFromRange(-500, 500);
          return star;
        })
    )
  );

export const stars$ = addStars$
  .scan((oldStars = [], newStars = []) => {
    oldStars.map(star => {
      scene.remove(star);
    });
    return newStars.map(star => {
      scene.add(star);
      return star;
    });
  }, [])
  .startWith([]);

function createStarGeometry(size, fraction = 8) {
  return new THREE.SphereGeometry(size, fraction, fraction);
}
