import THREE from 'three';
import Rx from 'rx';
import 'rx-dom';

import { scene, camera, renderer, effectRenderer$, controls$, animationFrame$, stats$, rendererStats$ } from './tools';
import { aspectRatio$, getRad } from './utils';
import { stars$, removeShot, shots$, removeEnemy, enemies$, addScore, spaceshipMesh$ } from './actors';

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
  domElement.style.left = 0;;
  domElement.style.bottom  = 0;
  document.body.appendChild(domElement);
});

//compose
document.body.insertBefore(renderer.domElement, document.body.children[0]);
camera.position.set(0, 10, 0);
scene.add(camera);

spaceshipMesh$.subscribe(function(spaceShipMesh){
  var mesh = spaceShipMesh.clone();
  mesh.rotation.y = getRad(-180);
  scene.add(mesh);
});

const preload$ = Rx.Observable
  .combineLatest(
    spaceshipMesh$, Rx.DOM.ready(), 
    spaceshipMesh => ({ spaceshipMesh })
  );

var light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

const game$ = Rx.Observable
  .combineLatest(
   animationFrame$, aspectRatio$, effectRenderer$, controls$, stars$, shots$, enemies$, stats$, rendererStats$, 
    function(animationFrame, aspectRatio, effectRenderer, controls, stars, shots, enemies, stats, rendererStats){
      return { 
        animationFrame,
        aspectRatio,
        effectRenderer,
        controls,
        stars,
        shots,
        enemies,
        stats,
        rendererStats,
      };  
    }
  )
  //only update when frame is ready to render
  //otherwise frames could drop on overloading changes in other observables
  .distinctUntilChanged(({ animationFrame }) => animationFrame.timestamp);

preload$
  .flatMap(() => game$) 
  .subscribe(render);

function render({ animationFrame, aspectRatio, effectRenderer, controls, stars, shots, enemies, stats, rendererStats }){
  //stars
  stars.forEach(function (star, index) {
    if (index % 3 === 0) {
      star.position.z += (10 * animationFrame.delta);
    } else if (index % 3 === 1) {
      star.position.z += (20 * animationFrame.delta);
    } else if (index % 3 === 2) {
      star.position.z += (50 * animationFrame.delta);
    }

    if (star.position.z > 500) {
      star.position.z = -500;
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

  //stats
  stats.update();
  rendererStats.update(renderer);
}