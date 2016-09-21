import THREE from 'three';
import Rx from 'rx';

import { getNow } from '../utils';

import { requestAnimationFrame, cancelAnimationFrame } from './renderer';

const clock = new THREE.Clock();
const startTimestamp = getNow();

export const animationFrame$ = Rx.Observable.create(observer => {
  let animationFrame;

  const nextFrame = () => {
    animationFrame = requestAnimationFrame(nextFrame);

    const timestamp = getNow();

    observer.next({
      timestamp,
      elapsed: timestamp - startTimestamp,
      delta: clock.getDelta(),
    });
  }

  nextFrame();

  return () => window.cancelAnimationFrame(animationFrame);
});
