import THREE from 'three';
import Rx from 'rx';
import '../../lib/controls/OrbitControls';
import '../../lib/controls/DeviceOrientationControls';
import '../../lib/controls/VRControls';
import '../../lib/gamepad/ViveController';

import { scene } from './scene';
import { camera } from './camera';
import { renderer } from './renderer';

const orbitControlsSubject$ = new Rx.BehaviorSubject(); 
orbitControlsSubject$.onNext(new THREE.OrbitControls(camera, renderer.domElement));

const orbitControls$ = orbitControlsSubject$
  .map(function(orbitControls){
    orbitControls.target.set(
      camera.position.x,
      camera.position.y,
      camera.position.z - 0.0001
    );
    
    orbitControls.noPan = true;
    orbitControls.noZoom = true;
    
    return orbitControls;
  });

const vrControlsSubject$ = new Rx.BehaviorSubject();
let hasVRControls = true;
const vrControls = new THREE.VRControls(camera, () => {
  console.log('should be false');
  hasVRControls = false;
});
vrControlsSubject$.onNext(hasVRControls ? vrControls : undefined);

const deviceOrientationControls$ = Rx.Observable
  .fromEvent(window, 'deviceorientation')
  .filter(event => event.alpha)
  .flatMap(() =>
    vrControlsSubject$
      .map((vrControls) => {
        console.log('vrcontrols', vrControls);
        if (vrControls) {
          // vrControls.update();
          vrControls.resetPose();
          return vrControls;
        }

        const deviceOrientationControls = new THREE.DeviceOrientationControls(camera, true);
        deviceOrientationControls.connect();
        deviceOrientationControls.update();
        
        return deviceOrientationControls;
      })
  )
  .takeUntil(Rx.Observable.fromEvent(window, 'deviceorientation'))
  .share();

export const controls$ = Rx.Observable.merge(orbitControls$, deviceOrientationControls$)
  .takeUntil(deviceOrientationControls$);

const controller1 = new THREE.ViveController( 0 );
controller1.standingMatrix = vrControls.getStandingMatrix();
scene.add( controller1 );

const controller2 = new THREE.ViveController( 1 );
controller2.standingMatrix = vrControls.getStandingMatrix();
scene.add( controller2 );

var loader = new THREE.OBJLoader();
loader.setPath( 'res/models/vive/' );
loader.load( 'vive.obj', function ( object ) {
  var loader = new THREE.TextureLoader();
  loader.setPath( 'res/models/vive/' );

  var controller = object.children[ 0 ];
  controller.material.map = loader.load( 'onepointfive_texture.png' );
  controller.material.specularMap = loader.load( 'onepointfive_spec.png' );

  controller1.add( object.clone() );
  controller2.add( object.clone() );
});

