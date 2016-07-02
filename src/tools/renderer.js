import THREE from 'three';
import Rx from 'rx';
import '../../lib/StereoEffect';

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);

const effect = new THREE.StereoEffect(renderer);

export const rendererStereoEffect$ = new Rx.BehaviorSubject();

export const effectRenderer$ = rendererStereoEffect$
  .map(function(renderStereoEffect){
    if(renderStereoEffect){
      var seperator = document.createElement('div');
      seperator.id = 'stereo-seperator';
      seperator.style.height = '100%';
      seperator.style.width = '2px';
      seperator.style.position = 'absolute';
      seperator.style.top = '0';
      seperator.style.left = '50%';
      seperator.style.marginLeft = '-1px';
      seperator.style.backgroundColor = '#fff';
      document.body.appendChild(seperator);
      
      return effect;
    } else {
      var seperator = document.getElementById('stereo-seperator');
      if (seperator) {
        document.body.removeChild(seperator);
      }
      return renderer;
    }
  });

export function setRenderEffect(enable){
  rendererStereoEffect$.onNext(enable);
}

const buttons$ = new Rx.BehaviorSubject(document.getElementsByTagName('button'));

const click$ = buttons$
  .filter(buttons => buttons)
  .map(buttons => buttons[0])
  .flatMap(button => Rx.Observable.fromEvent(button, 'click'))

click$
  .flatMap(() => rendererStereoEffect$.take(1))
  .map(effectRenderer => !effectRenderer)
  .subscribe((toggledEffectRenderer) => {
    setRenderEffect(toggledEffectRenderer);
  });
