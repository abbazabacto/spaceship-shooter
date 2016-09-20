import THREE from 'three';
import Rx from 'rx';

import { scene, createGui, addRenderer } from '../tools';
import { randomFromRange, range } from '../utils';

const asteroidGeometries = [createAsteroidGeometry(1), createAsteroidGeometry(0.25), createAsteroidGeometry(0.5)];
const asteroidMaterial = new THREE.MeshBasicMaterial({
  color: 0xf1f1f1
});

const ASTEROID_AMOUNT_INITIAL = 50;

const addAsteroids$ = createGui('asteroids', ASTEROID_AMOUNT_INITIAL, 0, 1000, 50)
  .debounce(1000)
  .map(asteroidAmount => parseInt(asteroidAmount, 10))
  .startWith(ASTEROID_AMOUNT_INITIAL)
  .flatMap(asteroidsAmount =>
    Rx.Observable.of(
      range(0, asteroidsAmount)
        .map(() => {
          const asteroid = new THREE.Mesh(asteroidGeometries[Math.floor(Math.random() * asteroidGeometries.length)], asteroidMaterial);
          asteroid.position.x = randomFromRange(-500, 500);
          asteroid.position.y = randomFromRange(-500, 500);
          asteroid.position.z = randomFromRange(-500, 500);
          return asteroid;
        })
    )
  );

export const asteroids$ = addAsteroids$
  .scan((oldAsteroids = [], newAsteroids = []) => {
    oldAsteroids.map(asteroid => {
      scene.remove(asteroid);
    });
    return newAsteroids.map(asteroid => {
      scene.add(asteroid);
      return asteroid;
    });
  }, [])
  .startWith([]);

function createAsteroidGeometry(size, fraction = 8) {
  return new THREE.SphereGeometry(size, fraction, fraction);
}

addRenderer(({ delta, actors: { asteroids } }) => {
  asteroids.forEach((asteroid, index) => {
    if (index % 3 === 0) {
      asteroid.position.z += (10 * delta);
    } else if (index % 3 === 1) {
      asteroid.position.z += (20 * delta);
    } else if (index % 3 === 2) {
      asteroid.position.z += (50 * delta);
    }

    if (asteroid.position.z > 500) {
      asteroid.position.z = -500;
    }
  });
});
