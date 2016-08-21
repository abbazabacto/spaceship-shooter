import THREE from 'three';
import Rx from 'rx';

import { createModel } from '../utils/models';
import { getRad } from '../utils/misc';

const ringsModel = createModel('res/models/spaceship-parts/rings.json');
const gunsModel = createModel('res/models/spaceship-parts/guns.json');
const shipLowerModel = createModel('res/models/spaceship-parts/ship-lower.json');
const chairModel = createModel('res/models/spaceship-parts/chair.json');
const controlBoardModel = createModel('res/models/spaceship-parts/control-board.json');

// add to preloads$...
/// spaceshipModel.progress$.subscribe(console.log.bind(console));

// utils/models.js -> createGroup?
export const spaceshipObject$ = Rx.Observable.combineLatest(
  ringsModel.object$,
  gunsModel.object$,
  shipLowerModel.object$,
  chairModel.object$,
  controlBoardModel.object$,
  (
    rings,
    guns,
    shipLower,
    chair,
    controlBoard
  ) => ({
    rings,
    guns,
    shipLower,
    chair,
    controlBoard,
  })
)
.map(({ 
  rings,
  guns,
  shipLower,
  chair,
  controlBoard,
}) => {
  const _frame = new THREE.Object3D();
  const frame = new THREE.Object3D();
  frame.add(rings);
  frame.add(guns);
  frame.add(controlBoard);
  frame.rotation.y = getRad(-90);
  _frame.add(frame);

  const _base = new THREE.Object3D();
  const base = new THREE.Object3D();
  base.add(shipLower);
  base.add(chair);
  base.add(controlBoard);
  base.rotation.y = getRad(-90);
  _base.add(base);

  const spaceship = new THREE.Object3D();
  spaceship.add(_frame);
  spaceship.add(_base);

  return spaceship;
});
