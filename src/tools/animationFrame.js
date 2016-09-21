import THREE from 'three';
import Rx from 'rx';

import { getNow } from '../utils';

import { requestAnimationFrame, cancelAnimationFrame } from './renderer';

const clock = new THREE.Clock();
const startTimestamp = getNow();

export const animationFrame$ = Rx.Observable.create(observer => {
  let animationFrame;

  const run = () => {
    animationFrame = requestAnimationFrame(run);

    const timestamp = getNow();

    observer.next({
      timestamp,
      elapsed: timestamp - startTimestamp,
      delta: clock.getDelta(),
    });
  }

  run();

  return () => {
    window.cancelAnimationFrame(animationFrame);
  };
});
