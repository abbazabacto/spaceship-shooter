import THREE from 'three';
import Rx from 'rx';
import '../../lib/OrbitControls';
import '../../lib/DeviceOrientationControls';

import { camera } from './camera';
import { renderer } from './renderer';

import { fullscreen } from '../utils';

const OrbitControlsSubject = new Rx.BehaviorSubject(); 
OrbitControlsSubject.onNext(new THREE.OrbitControls(camera, renderer.domElement));

const orbitControls$ = OrbitControlsSubject
  .map(function(orbitControls){
    orbitControls.target.set(
      camera.position.x,
      camera.position.y,
      camera.position.z + 0.0001
    );
    
    orbitControls.noPan = true;
    orbitControls.noZoom = true;
    
    return orbitControls;
  });

const deviceOrientationControls$ = Rx.Observable
  .fromEvent(window, 'deviceorientation')
  .filter(event => event.alpha)
  .map(function(){
    const deviceOrientationControls = new THREE.DeviceOrientationControls(camera, true);
    deviceOrientationControls.connect();
    deviceOrientationControls.update();
    
    return deviceOrientationControls;
  })
  .takeUntil(Rx.Observable.fromEvent(window, 'deviceorientation'))
  .share();

deviceOrientationControls$
  .flatMapLatest(function(){
    return Rx.Observable.fromEvent(renderer.domElement, 'click');
  })
  .subscribe(function(){
    fullscreen(renderer.domElement);
  });

export const controls$ = Rx.Observable.merge(orbitControls$, deviceOrientationControls$);
