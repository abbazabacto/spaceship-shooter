import THREE from 'three';
import Rx from 'rx';
import '../../lib/effects/StereoEffect';
import WEBVR from 'webvr';
import '../../lib/effects/VREffect';

export const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  // alpha: true,
});
// renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setPixelRatio(2);
// renderer.setClearColor( 0xffffff, 0);

const stereoEffect = new THREE.StereoEffect(renderer);
const vrEffect = new THREE.VREffect(renderer);

export const rendererStereoEffect$ = new Rx.BehaviorSubject();

const buttons = document.getElementsByTagName('button');

if (WEBVR.isAvailable() === true) {
  buttons[1].style.display = 'block';
  buttons[1].addEventListener('click', () => {
    vrEffect.isPresenting ? vrEffect.exitPresent() : vrEffect.requestPresent()
  });
}

export const effectRenderer$ = rendererStereoEffect$
  .map((renderStereoEffect) => {
    if(renderStereoEffect){
      const seperator = document.createElement('div');
      seperator.id = 'stereo-seperator';
      seperator.style.height = '100%';
      seperator.style.width = '2px';
      seperator.style.position = 'absolute';
      seperator.style.top = '0';
      seperator.style.left = '50%';
      seperator.style.marginLeft = '-1px';
      seperator.style.backgroundColor = '#333';
      document.body.appendChild(seperator);
      
      return stereoEffect;
    } else {
      const seperator = document.getElementById('stereo-seperator');
      if (seperator) {
        document.body.removeChild(seperator);
      }
      return vrEffect;
    }
  });

export function setRenderEffect(enable){
  rendererStereoEffect$.onNext(enable);
}

const buttons$ = new Rx.BehaviorSubject(buttons);

// add tabindex -1 so parentNode can be used for unfocusing buttons on click
buttons$.subscribe(buttons =>
  Array.prototype.forEach.call(buttons, button =>
    button.parentNode.setAttribute('tabindex', '-1'))
);

const click$ = buttons$
  .filter(buttons => buttons)
  .map(buttons => buttons[0])
  .flatMap(button => Rx.Observable.fromEvent(button, 'click'));

click$
  .flatMap((clickEvent) =>
    rendererStereoEffect$
      .take(1)
      .map(effectRenderer => !effectRenderer)
      .map(effectRenderer => {
        return { effectRenderer, clickEvent };
      })
  )
  .subscribe(({ effectRenderer, clickEvent }) => {
    setRenderEffect(effectRenderer);
    // unfocus on parentNode
    clickEvent.srcElement.parentNode.focus();
    clickEvent.stopPropagation();
  });
