import THREE from 'three';
import Rx from 'rx';

import { camera, scene, addRenderer, removeRenderer } from '../tools';
import { level$ } from './score';
import { randomFromRange, getVideoMaterialRenderer$, createModel } from '../utils';

const spaceshipModel = createModel('res/models/spaceship.json');

const spaceshipMesh$ = spaceshipModel.object$
  .map(object => {
    // object.position.y -= 1;
    object.scale.set(20, 20, 20);
    return object;
  });

const enemyGeometry = new THREE.BoxGeometry(100, 100, 100);
const enemyMaterialHithox = new THREE.MeshBasicMaterial({
  color: 0x333333,
  wireframe: true,
  wireframeLinewidth: 0.01,
  // transparent: true,
});
enemyMaterialHithox.opacity = 0;

const addEnemy$ = level$
  .flatMapLatest(function(currentLevel){
    return Rx.Observable.interval(5000 - (currentLevel * 100))
      .startWith(-1)
      .map((index) => currentLevel);
  });

const removeEnemy$ = new Rx.Subject();

export const enemies$ = Rx.Observable
  .merge(
    addEnemy$.map(function (index) {
      const enemy = new THREE.Mesh(enemyGeometry, enemyMaterialHithox);

      spaceshipMesh$.subscribe(function (spaceshipMesh) {
        enemy.add(spaceshipMesh.clone());
      });

      enemy.position.x = randomFromRange(-3000, 3000);
      enemy.position.y = randomFromRange(-1000, 1000);
      enemy.position.z = -5000;
      enemy.lookAt(new THREE.Vector3(
        camera.position.x,
        camera.position.y + 50,
        camera.position.z));
      scene.add(enemy);

      return enemies => enemies.concat(enemy);
    }),
    removeEnemy$.map(function (removeEnemy) {
      scene.remove(removeEnemy);

      return enemies => enemies.filter(enemy => enemy !== removeEnemy);
    })
  )
  .scan((enemies, operation) => operation(enemies), [])
  .startWith([]);

export const removeEnemy = (enemy) => removeEnemy$.onNext(enemy);

export const addExplosion = (enemy) => {
  let plane;
  let _renderMaterial;
  const { position, rotation } = enemy;

  getVideoMaterialRenderer$('res/video/explosion/explosion.webm')
    .do((renderMaterial) => _renderMaterial = renderMaterial)
    .subscribe((renderMaterial) => {
      const geometry = new THREE.PlaneGeometry(200, 200, 200);
      const material = renderMaterial();
      material.transparent = true;
      material.blending = THREE.AdditiveBlending;
      plane = new THREE.Mesh(geometry, material);

      plane.position.x = position.x;
      plane.position.y = position.y;
      plane.position.z = position.z;
      plane.rotation.x = rotation.x;
      plane.rotation.y = rotation.y;
      plane.rotation.z = rotation.z;

      scene.add(plane);

      addRenderer(renderMaterial);
    }, 
    () => {}, 
    () => {
      scene.remove(plane);
      removeRenderer(_renderMaterial);

      plane = null;
      _renderMaterial = null;
    });
};

addRenderer(({ delta, actors: { enemies } }) => {
  enemies.forEach(enemy => {
    enemy.translateZ(400 * delta);

    if (enemy.position.z > 10000) {
      removeEnemy(enemy);
    }
  });
});