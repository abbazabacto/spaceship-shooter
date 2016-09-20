import THREE from 'three';
import Rx from 'rx';
import 'rx-dom';

import { scene, camera, renderer, renderers$, addRenderer, effectRenderer$, controls$, animationFrame$, stats$, rendererStats$ } from './tools';
import { aspectRatio$, getRad, getDeg } from './utils';
import { asteroids$, removeShot, shots$, removeEnemy, enemies$, addExplosion, addScore, spaceshipObject$, earth$ } from './actors';

import {createGameLoop} from './tools/gameLoop';

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

spaceshipObject$.subscribe(function(spaceshipObject){
  const object = spaceshipObject.clone();
  const scale = 0.3;
  object.scale.multiplyScalar(scale);

  const [frame, base] = object.children;
  addRenderer(({ camera }) => {
    frame.rotation.x = camera.rotation.x;
    frame.rotation.y = camera.rotation.y;
    frame.rotation.z = camera.rotation.z;
    object.position.x = camera.position.x;
    object.position.y = camera.position.y + (-4 * scale);
    object.position.z = camera.position.z + (-1 * scale);
  });
  object.position.y = -4 * scale;
  object.position.z = -1 * scale;

  scene.add(object);
});

// use preloads$, dynamic combineLatest
const preload$ = Rx.Observable
  .combineLatest(
    spaceshipObject$, Rx.DOM.ready(), 
    spaceshipObject => ({ spaceshipObject })
  );

var light = new THREE.AmbientLight( 0x111111 );
scene.add( light );

const game$ = createGameLoop({
  animationFrame$,
  effectRenderer$,
  controls$,
  asteroids$,
  shots$,
  enemies$,
  stats$,
  rendererStats$,
  earth$,
  renderers$,
});

preload$
  .flatMap(() => game$) 
  .subscribe((actors) => {
  const { 
    animationFrame,
    effectRenderer,
    controls,
    asteroids,
    shots,
    enemies,
    stats,
    rendererStats,
    earth,
    renderers,
  } = actors;

  const { delta } = animationFrame; 

  renderers.forEach(render => render({ scene, camera, delta, actors }));

  // shots
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
        // addExplosion(collisionResult[0].object);
        addScore(1, shot.index);
      }
    });
  });

  //update
  camera.updateProjectionMatrix();
  controls.update(delta);
  
  //render
  effectRenderer.render(scene, camera);

  //stats
  stats.update();
  rendererStats.update(renderer);
});

aspectRatio$
  .withLatestFrom(
    effectRenderer$,
    (aspectRatio, effectRenderer) => ({ aspectRatio, effectRenderer })
  )
  .subscribe(({ aspectRatio, effectRenderer }) => {
    //resize
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
    
    effectRenderer.setSize(window.innerWidth, window.innerHeight);
  });
  