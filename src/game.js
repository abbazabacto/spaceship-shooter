import THREE from 'three';
import Rx from 'rx';
import 'rx-dom';

import { scene, camera, renderer, EffectRenderer, Controls, AnimationFrame } from './tools';
import { AspectRatio } from './utils';
import { Stars, removeShot, Shots, removeEnemy, Enemies, addScore, SpaceshipMesh } from './actors';

//compose
document.body.appendChild(renderer.domElement);
camera.position.set(0, 10, 0);
scene.add(camera);

SpaceshipMesh.subscribe(function(spaceShipMesh){
  var mesh = spaceShipMesh.clone();
  //mesh.position.y = 5;
  scene.add(mesh);
});

const Preload = Rx.Observable
  .combineLatest(
    SpaceshipMesh, Rx.DOM.ready(), 
    spaceshipMesh => ({ spaceshipMesh })
  );

const Game = Rx.Observable
  .combineLatest(
    AnimationFrame, AspectRatio, EffectRenderer, Controls, Stars, Shots, Enemies, 
    function(animationFrame, aspectRatio, effectRenderer, controls, stars, shots, enemies){
      return { 
        animationFrame,
        aspectRatio,
        effectRenderer,
        controls,
        stars,
        shots,
        enemies
      };  
    }
  )
  //only update when frame is ready to render
  //otherwise frames could drop on overloading changes in other observables
  .distinctUntilChanged(({ animationFrame }) => animationFrame.timestamp);

Preload
  .flatMap(() => Game) 
  .subscribe(render);

function render({ animationFrame, aspectRatio, effectRenderer, controls, stars, shots, enemies }){
  //stars
  stars.forEach(function (star, index) {
    if (index % 3 === 0) {
      star.position.z -= (10 * animationFrame.delta);
    } else if (index % 3 === 1) {
      star.position.z -= (20 * animationFrame.delta);
    } else if (index % 3 === 2) {
      star.position.z -= (50 * animationFrame.delta);
    }

    if (star.position.z < -500) {
      star.position.z = 500;
    }
  });
  
  //shots
  shots.forEach(function (shot) {
    shot.translateZ(-200 * animationFrame.delta);

    if (shot.position.z > 500) {
      removeShot(shot);
      return;
    }
    
    //collision detection
    shot.geometry.vertices.forEach(function (vertex) {
      if(shot.hit){
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
        addScore(1, shot.index);
      }
    });
  });
  
  //enemeies
  enemies.forEach(function (enemy) {
    enemy.translateZ(50 * animationFrame.delta);

    if (enemy.position.z < -500) {
      removeEnemy(enemy);
    }
  });
  
  //resize
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
  
  effectRenderer.setSize(window.innerWidth, window.innerHeight);
  
  //update
  camera.updateProjectionMatrix();
  controls.update(animationFrame.delta);
  
  //render
  effectRenderer.render(scene, camera);
}