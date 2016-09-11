import THREE from 'three';
import Rx from 'rx';
import 'rx-dom';

import { getNow } from '../utils';

import { requestAnimationFrame, cancelAnimationFrame } from './renderer';

const clock = new THREE.Clock();
const startTimestamp = getNow();

const animationFrame$ = Rx.Observable
  .generate(
    0,
    function (x) { return true; },
    function (x) { return x + 1 },
    function (x) { return x; },
    Rx.Scheduler.requestAnimationFrame
  )
  .timestamp()
  .map(function (frame) {
    frame.elapsed = frame.timestamp - startTimestamp;
    frame.delta = clock.getDelta();
    return frame;
  })
  .shareReplay();

const _animationFrame$ = Rx.Observable.create(observer => {
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
})

export { animationFrame$, _animationFrame$, clock };