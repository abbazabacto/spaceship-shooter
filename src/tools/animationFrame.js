import THREE from 'three';
import Rx from 'rx';
import 'rx-dom';

import { getNow } from '../utils';

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
  
export { animationFrame$, clock };