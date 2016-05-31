import Rx from 'rx';

import { camera, animationFrame$, rendererStereoEffect$ } from '../tools';
import { createTextMesh, aspectRatio$, getRad } from '../utils';

const addScore$ = new Rx.Subject();

const removeScore$ = new Rx.Subject();

export const score$ = Rx.Observable
  .merge(
    addScore$,
    removeScore$.map(points => points * -1)
  )
  .scan((score, points) => score + points, 0)
  .startWith(0)
  .shareReplay();

const scoreHolder = new THREE.Object3D();
scoreHolder.position.x = 90;
scoreHolder.position.y = 80;
scoreHolder.position.z = -100;
camera.add(scoreHolder);

const scoreMesh$ = score$
  .map(function(currentScore){
    scoreHolder.remove(scoreHolder.children[0]);
    scoreHolder.add(createTextMesh(currentScore, {}, 'right'));
    return scoreHolder;
  });

export const level$ = score$
  .map((currentScore) => Math.ceil((currentScore + 1) / 1000))
  .startWith(1)
  .distinctUntilChanged()
  .shareReplay(1);

const levelHolder = new THREE.Object3D();
camera.add(levelHolder);
levelHolder.position.z = -100;

const levelMesh$ = level$
  .map(function(currenLevel){
    levelHolder.position.y = 120;
    levelHolder.remove(levelHolder.children[0]);
    levelHolder.add(createTextMesh(`Level ${currenLevel}`, {}, 'center'));
    return levelHolder;
  })
  .timestamp();

Rx.Observable
  .combineLatest(
    animationFrame$, scoreMesh$, levelMesh$,
    function(animationFrame, scoreMesh, levelMesh){
      return { 
        animationFrame,
        scoreMesh, 
        levelMesh: levelMesh.value, 
        newLevelTimeElapsed: animationFrame.timestamp - levelMesh.timestamp 
      };
    }
  )
  .distinctUntilChanged(({ animationFrame }) => animationFrame.timestamp)
  .subscribe(function({ animationFrame, scoreMesh, levelMesh, newLevelTimeElapsed }){
    if(newLevelTimeElapsed < 5000){
      var position = Math.cos(Math.PI * (newLevelTimeElapsed / 5000));
      levelMesh.position.y -= position;
    }
  });

const minScore = 10;
const maxScore = 100;

//export const addScore = AddScore.onNext;
export function addScore(ships, shotIndex){
  const pointDeduction = shotIndex * minScore;
  addScore$.onNext(ships * (pointDeduction > maxScore - minScore ? minScore : maxScore - pointDeduction));
}

//export const removeScore = AddScore.onNext;
export function removeScore(points){
  removeScore$.onNext(points);
}

Rx.Observable
  .combineLatest(aspectRatio$, rendererStereoEffect$, 
    function (aspectRatio, rendererStereoEffect) {
      return { aspectRatio, rendererStereoEffect };
    }
  )
  .subscribe(function({ aspectRatio, rendererStereoEffect }){
    if(rendererStereoEffect){
      scoreHolder.position.z = -200;
      aspectRatio /= 2;
    } else {
      scoreHolder.position.z = -100;
    }
    
    scoreHolder.position.x = 90 * aspectRatio;
  });