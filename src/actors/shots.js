import THREE from 'three';
import Rx from 'rx';
import 'rx-dom';

import { renderer, camera, scene, controls$ } from '../tools';

const shotGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8 );
const shotMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000
});

const interval$ = Rx.Observable.interval(200)
  .startWith(-1)
  .map(index => index + 1);

const addShot$ = Rx.Observable
  .merge(
    Rx.DOM.touchstart(renderer.domElement)
      .flatMap(() => interval$.takeUntil(Rx.DOM.touchend(renderer.domElement))),
    Rx.Observable.fromEvent(document, 'keydown').filter(e => e.keyCode === 32)
      .flatMap(x => interval$.takeUntil(Rx.Observable.fromEvent(document, 'keyup').filter(e => e.keyCode === 32)))
  )
  .throttle(200);

const removeShot$ = new Rx.Subject()

var usesDeviceOrientation;

controls$.subscribe(function(controls){
  usesDeviceOrientation = controls.autoRotate === undefined;
});

export const shots$ = Rx.Observable
  .merge(
    addShot$.map(index => {
      const shot = new THREE.Mesh(shotGeometry, shotMaterial)
      shot.position.y = camera.position.y - 10;
      //shot.rotation.x = camera.rotation.x * (usesDeviceOrientation ? -1 : 1);
      shot.rotation.x = camera.rotation.x;
      shot.rotation.y = camera.rotation.y;
      shot.rotation.z = camera.rotation.z;
      
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

//export const removeShot = RemoveShot.onNext;
export function removeShot(shot){
  removeShot$.onNext(shot);
};