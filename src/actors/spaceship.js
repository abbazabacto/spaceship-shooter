import THREE from 'three';
import Rx from 'rx';

import { createModel } from '../utils/models';
import { getRad } from '../utils/misc';

const frameModel = createModel('res/models/spaceship-parts/frame.json');
const gunsModel = createModel('res/models/spaceship-parts/guns.json');
const bodyModel = createModel('res/models/spaceship-parts/body.json');
const glassModel = createModel('res/models/spaceship-parts/glass-1.json');
const chairModel = createModel('res/models/spaceship-parts/chair.json');

// add to preloads$...
/// spaceshipModel.progress$.subscribe(console.log.bind(console));

// utils/models.js -> createGroup?
export const spaceshipObject$ = Rx.Observable.combineLatest(
  frameModel.object$,
  gunsModel.object$,
  bodyModel.object$,
  glassModel.object$,
  chairModel.object$,
  (
    frame,
    guns,
    body,
    glass,
    chair
  ) => ({
    frame,
    guns,
    body,
    glass,
    chair,
  })
)
.map(({ 
  frame,
  guns,
  body,
  glass,
  chair,
}) => {
  const _frameHolder = new THREE.Object3D();
  const frameHolder = new THREE.Object3D();
  frameHolder.add(frame);
  frameHolder.add(guns);
  _frameHolder.add(frameHolder);

  const _base = new THREE.Object3D();
  const base = new THREE.Object3D();
  base.add(body);
  base.add(glass);
  base.add(chair);
  _base.add(base);

  const spaceship = new THREE.Object3D();
  spaceship.add(_frameHolder);
  spaceship.add(_base);

  return spaceship;
});
