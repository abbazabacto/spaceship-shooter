import THREE from 'three';
import Rx from 'rx';

import { createModel } from '../utils/models';
import { getRad } from '../utils/misc';

const frameModel = createModel('res/models/spaceship-parts/frame.json');
const gunsModel = createModel('res/models/spaceship-parts/guns.json');
const domeModel = createModel('res/models/spaceship-parts/dome.json');
const chairModel = createModel('res/models/spaceship-parts/chair.json');
const wheelModel = createModel('res/models/spaceship-parts/wheel.json');

// add to preloads$...
/// spaceshipModel.progress$.subscribe(console.log.bind(console));

// utils/models.js -> createGroup?
export const spaceshipObject$ = Rx.Observable.combineLatest(
  frameModel.object$,
  gunsModel.object$,
  domeModel.object$,
  chairModel.object$,
  wheelModel.object$,
  (
    frame,
    guns,
    dome,
    chair,
    wheel,
    controlBoard
  ) => ({
    frame,
    guns,
    dome,
    chair,
    wheel,
  })
)
.map(({ 
  frame,
  guns,
  dome,
  chair,
  wheel,
}) => {
  const _frameHolder = new THREE.Object3D();
  const frameHolder = new THREE.Object3D();
  frameHolder.add(frame);
  frameHolder.add(guns);
  _frameHolder.add(frameHolder);

  const _base = new THREE.Object3D();
  const base = new THREE.Object3D();
  base.add(dome);
  base.add(wheel);
  base.add(chair);
  _base.add(base);

  const spaceship = new THREE.Object3D();
  spaceship.add(_frameHolder);
  spaceship.add(_base);

  return spaceship;
});
