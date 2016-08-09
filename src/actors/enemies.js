import THREE from 'three';
import Rx from 'rx';

import { camera, scene, addRenderer, removeRenderer } from '../tools';
import { level$ } from './score';
import { spaceshipMesh$ } from './spaceship';
import { randomFromRange, getVideoMaterialRenderer$ } from '../utils';

const enemyGeometry = new THREE.BoxGeometry(10, 10, 10);
const enemyMaterialHithox = new THREE.MeshBasicMaterial({
  color: 0x333333,
  wireframe: true,
  wireframeLinewidth: 0.01,
  transparent: true,
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

      enemy.position.x = randomFromRange(-250, 250);
      enemy.position.y = randomFromRange(-250, 250);
      enemy.position.z = -500;
      enemy.lookAt(new THREE.Vector3(
        camera.position.x,
        camera.position.y + 10,
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
      const geometry = new THREE.PlaneGeometry(20, 20, 32);
      plane = new THREE.Mesh(geometry, renderMaterial());

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
