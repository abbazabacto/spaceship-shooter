import THREE from 'three';
import Rx from 'rx';

import { renderer, camera, scene, triggerdown$, triggerup$, addRenderer } from '../tools';
import { removeEnemy, addExplosion } from '../actors/enemies';
import { addScore } from '../actors/score';

const shotGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const shotMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000
});

const interval$ = Rx.Observable.interval(500)
  .startWith(-1)
  .map(index => index + 1);

const touchstart$ = Rx.Observable.fromEvent(renderer.domElement, 'touchstart');
const touchend$ = Rx.Observable.fromEvent(renderer.domElement, 'touchend');
const spacebarKeydown$ = Rx.Observable.fromEvent(document, 'keydown').filter(e => e.keyCode === 32); 
const spacebarKeyup$ = Rx.Observable.fromEvent(document, 'keyup').filter(e => e.keyCode === 32); 

const spacebarKeydownOnce$ = Rx.Observable.merge(
  spacebarKeydown$,
  spacebarKeyup$
)
.distinctUntilChanged(e => e.type)
.filter(e => e.type === 'keydown');

const addShot$ = Rx.Observable
  .merge(
    triggerdown$.throttle(500).flatMap(() => interval$.takeUntil(triggerup$)),
    touchstart$.throttle(500).flatMap(() => interval$.takeUntil(touchend$)),
    spacebarKeydownOnce$.throttle(500).flatMap(() => interval$.takeUntil(spacebarKeyup$))
  );

const removeShot$ = new Rx.Subject();

let count = 0;

export const shots$ = Rx.Observable
  .merge(
    addShot$.map(index => {
      const shot = new THREE.Mesh(shotGeometry, shotMaterial);
      shot.rotation.x = camera.rotation.x;
      shot.rotation.y = camera.rotation.y;
      shot.rotation.z = camera.rotation.z;

      count++;

      shot.translateX(count % 2 ? -7 : 7);
      shot.translateZ(-13);
      shot.translateY(0);

      scene.add(shot);

      shot.index = index;

      return shots => shots.concat(shot);
    }),
    removeShot$.map(removeShot => {
      scene.remove(removeShot);

      return shots => shots.filter(shot => shot !== removeShot);
    })
  )
  .scan((shotArray, operation) => operation(shotArray), [])
  .startWith([]);

const removeShot = (shot) => {
  removeShot$.onNext(shot);
};

addRenderer(({ delta, actors: { shots, enemies } }) => {
  shots.forEach(shot => {
    shot.translateZ(-2000 * delta);
    
    if (shot.scale.z < 20000) {
      shot.scale.z += 4400 * delta;
    }

    if (shot.position.z > 10000) {
      removeShot(shot);
      return;
    }

    //collision detection
    shot.geometry.vertices.forEach((vertex) => {
      if (shot.hit){
        return;
      }

      const localVertex = vertex.clone();
      const globalVertex = localVertex.applyMatrix4(shot.matrix);
      const directionVector = globalVertex.sub(shot.position);

      const ray = new THREE.Raycaster(shot.position.clone(), directionVector.clone().normalize());
      const collisionResult = ray.intersectObjects(enemies);
      if (collisionResult.length > 0 && collisionResult[0].distance < directionVector.length()) {
        shot.hit = true;
        removeShot(shot);
        removeEnemy(collisionResult[0].object);
        // addExplosion(collisionResult[0].object);
        addScore(1, shot.index);
      }
    });
  });
});
