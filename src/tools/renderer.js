import THREE from 'three';
import Rx from 'rx';
import '../../lib/StereoEffect';

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);

const effect = new THREE.StereoEffect(renderer);

export const RendererStereoEffect = new Rx.BehaviorSubject();

export const EffectRenderer = RendererStereoEffect
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
      return renderer;
    }
  });

export function setRenderEffect(enable){
  RendererStereoEffect.onNext(enable);
}

//setRenderEffect(true);