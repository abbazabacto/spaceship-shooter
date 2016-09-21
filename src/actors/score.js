import Rx from 'rx';

import { camera, rendererStereoEffect$, addRenderer, removeRenderer } from '../tools';
import { createTextMesh, aspectRatio$, getRad, getNow } from '../utils';

const addScore$ = new Rx.Subject();

const removeScore$ = new Rx.Subject();

const INIT_SCORE = 0;

export const score$ = Rx.Observable
  .merge(
    addScore$,
    removeScore$.map(points => points * -1)
  )
  .scan((score, points) => score + points, INIT_SCORE)
  .startWith(INIT_SCORE)
  .shareReplay();

const scoreHolder = new THREE.Object3D();
scoreHolder.position.x = 90;
scoreHolder.position.y = 80;
scoreHolder.position.z = -100;
camera.add(scoreHolder);

export const scoreMesh$ = score$
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

export const levelMesh$ = level$
  .map(function(currenLevel){
    levelHolder.position.y = 120;
    levelHolder.remove(levelHolder.children[0]);
    levelHolder.add(createTextMesh(`Level ${currenLevel}`, {}, 'center'));
    return levelHolder;
  });

level$.skip(1)
  .subscribe(() => {
    const timestampStart = getNow();

    const animateLevelMesh = ({ delta, timestamp, actors: { levelMesh } }) => {
      const elapsed = timestampStart - timestamp;
      if (elapsed < -5000) {
        removeRenderer(animateLevelMesh);
      }
      levelMesh.position.y -= Math.cos(Math.PI * (elapsed / 5000));
    };

    addRenderer(animateLevelMesh);
  });

const minScore = 10;
const maxScore = 100;

export function addScore(ships, shotIndex){
  const pointDeduction = shotIndex * minScore;
  addScore$.onNext(ships * (pointDeduction > maxScore - minScore ? minScore : maxScore - pointDeduction));
}

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
      scoreHolder.position.z = -150;
    }
    
    scoreHolder.position.x = 90 * aspectRatio;
  });