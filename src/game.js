import THREE from 'three';
import Rx from 'rx';
import 'rx-dom';

import { scene, camera, renderer, renderers$, effectRenderer$, controls$, animationFrame$, stats$, rendererStats$ } from './tools';
import { aspectRatio$, getRad } from './utils';
import { asteroids$, removeShot, shots$, removeEnemy, enemies$, addExplosion, addScore, spaceshipMesh$, earth$ } from './actors';

stats$.subscribe(({ dom: domElement }) => {
  domElement.style.position = 'absolute';
  domElement.style.top = 'auto';
  domElement.style.left = 'auto';
  domElement.style.right = 0;
  domElement.style.bottom = 0;
  document.body.appendChild(domElement);
});

rendererStats$.subscribe(({ domElement }) => {
  domElement.style.position = 'absolute';
  domElement.style.top = 'auto';
  domElement.style.left = 0;
  domElement.style.bottom  = 0;
  document.body.appendChild(domElement);
});

//compose
const gameElement = document.getElementsByTagName('game')[0];
gameElement.appendChild(renderer.domElement);
camera.position.set(0, 0, 0);
scene.add(camera);

spaceshipMesh$.subscribe(function(spaceShipMesh){
  var mesh = spaceShipMesh.clone();
  mesh.position.y = -10;
  mesh.rotation.y = getRad(-180);
  scene.add(mesh);
});

const preload$ = Rx.Observable
  .combineLatest(
    spaceshipMesh$, Rx.DOM.ready(), 
    spaceshipMesh => ({ spaceshipMesh })
  );

var light = new THREE.AmbientLight( 0x111111 );
scene.add( light );

const game$ = Rx.Observable
  .combineLatest(
   animationFrame$, aspectRatio$, effectRenderer$, controls$, asteroids$, shots$, enemies$, stats$, rendererStats$, earth$, renderers$, 
    function(animationFrame, aspectRatio, effectRenderer, controls, asteroids, shots, enemies, stats, rendererStats, earth, renderers){
      return { 
        animationFrame,
        aspectRatio,
        effectRenderer,
        controls,
        asteroids,
        shots,
        enemies,
        stats,
        rendererStats,
        earth,
        renderers
      };  
    }
  )
  //only update when frame is ready to render
  //otherwise frames could drop on overloading changes in other observables
  .distinctUntilChanged(({ animationFrame }) => animationFrame.timestamp);

preload$
  .flatMap(() => game$) 
  .subscribe(render);

function render({ animationFrame, aspectRatio, effectRenderer, controls, asteroids, shots, enemies, stats, rendererStats, earth, renderers }){
  renderers.forEach(render => render(scene, camera, animationFrame.delta));

  earth.rotation.x += getRad(0.3) * animationFrame.delta;

  //asteroids
  asteroids.forEach(function (asteroid, index) {
    if (index % 3 === 0) {
      asteroid.position.z += (10 * animationFrame.delta);
    } else if (index % 3 === 1) {
      asteroid.position.z += (20 * animationFrame.delta);
    } else if (index % 3 === 2) {
      asteroid.position.z += (50 * animationFrame.delta);
    }

    if (asteroid.position.z > 500) {
      asteroid.position.z = -500;
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
        addExplosion(collisionResult[0].object);
        addScore(1, shot.index);
      }
    });
  });
  
  //enemeies
  enemies.forEach(function (enemy) {
    enemy.translateZ(50 * animationFrame.delta);

    if (enemy.position.z > 500) {
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

  //stats
  stats.update();
  rendererStats.update(renderer);
}
