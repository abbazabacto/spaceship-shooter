import THREE from 'three';
import Rx from 'rx';
import '../../lib/effects/StereoEffect';
import WEBVR from 'webvr';
import '../../lib/effects/VREffect';
import { fullscreen } from '../utils/screen';
import { webRtcVideo$ } from '../utils/webrtc';

import { enableStarField } from '../actors/planets';

const gameElement = document.getElementsByTagName('game')[0];
const buttons = document.getElementsByTagName('button');

export const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio || 1);
// renderer.setClearColor( 0x000000, 1);
renderer.shadowMap.enabled	= true

const stereoEffect = new THREE.StereoEffect(renderer);
const vrEffect = new THREE.VREffect(renderer);

export const rendererStereoEffect$ = new Rx.BehaviorSubject(false);

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
      gameElement.appendChild(seperator);

      return stereoEffect;
    } else {
      const seperator = document.getElementById('stereo-seperator');
      if (seperator) {
        gameElement.removeChild(seperator);
      }
      return vrEffect;
    }
  });

export function setRenderEffect(enable){
  rendererStereoEffect$.onNext(enable);
}

// add tabindex -1 so parentNode can be used for unfocusing buttons on click
Array.prototype.forEach.call(buttons, button => {
  button.parentNode.setAttribute('tabindex', '-1');
  button.parentNode.style.outline = 'none';
});

const enableStereoRender$ = toggleButton(buttons[0]);
const enableWebRtc$ = toggleButton(buttons[2]).share();

if (WEBVR.isAvailable() === true) {
  buttons[1].style.display = 'block';

  toggleButton(buttons[1]).subscribe((enableWebVr) => {
    vrEffect.disabled = false;
    if (vrEffect.isPresenting) {
      // renderer.setClearColor( 0x000000, 0);
      // renderer.domElement.style.background = '';
      vrEffect.exitPresent();
    } else {
      // renderer.setClearColor( 0x000000, 1);
      // renderer.domElement.style.background = '#000';
      vrEffect.requestPresent();
    }
    enableWebVr && fullscreen(gameElement);
  });

  enableStereoRender$
    .subscribe(enableStereoRender => {
      vrEffect.disabled = enableStereoRender;
    });

  // prevent VREffect from kicking in on fullscreen event
  enableWebRtc$
    .subscribe(enableWebRtc => {
      vrEffect.disabled = enableWebRtc;
    });
}

enableStereoRender$
  // need side-effect as fullscreen needs to happen direct after click as initiator
  .do(enableStereoRender => enableStereoRender && fullscreen(gameElement))
  .withLatestFrom(
    rendererStereoEffect$.map(effectRenderer => !effectRenderer),
    (clickEvent, effectRenderer) => ({ clickEvent, effectRenderer })
  )
  .subscribe(({ effectRenderer, clickEvent }) => {
    setRenderEffect(effectRenderer);
  });

webRtcVideo$.take(1).subscribe(() => {
  buttons[2].style.display = 'block';
});

enableWebRtc$.subscribe(enableWebRtc => {
  enableWebRtc && fullscreen(gameElement);
  enableStarField(!enableWebRtc);
});

// toggle webrtc stereo render
Rx.Observable.combineLatest(
  rendererStereoEffect$,
  enableWebRtc$.flatMapLatest(enableWebRtc =>
    enableWebRtc ? webRtcVideo$ : Rx.Observable.of(undefined)
  ),
  (rendererStereoEffect, webRtcVideo) => ({ rendererStereoEffect, webRtcVideo })
)
.filter(({ webRtcVideo }) => !!webRtcVideo)
.subscribe(({ rendererStereoEffect, webRtcVideo }) => {
  webRtcVideo(rendererStereoEffect);
});

function toggleButton(button, initState) {
  return Rx.Observable.of(initState || false)
    .flatMap(state =>
      Rx.Observable.fromEvent(button, 'click').do(removeFocus)
        .do(() => (state = !state))
        .map(() => state)
        .do(state => button.classList[state ? 'add' : 'remove']('enabled'))
    );
}

const buttonHolder = buttons[0].parentElement;
function removeFocus() {
  buttonHolder.focus();
}

const addRenderer$ = new Rx.ReplaySubject(1);
const removeRenderer$ = new Rx.ReplaySubject(1);

export const renderers$ = Rx.Observable.merge(
  addRenderer$
    .map(renderer => (renderers) => renderers.concat([renderer])),
  removeRenderer$
    .map(renderer => (renderers) => renderers.filter(r => !renderer))
)
.scan((renderers, operation) => operation(renderers), [])
.startWith([]);

export const addRenderer = (renderer) => addRenderer$.onNext(renderer);
export const removeRenderer = renderer => removeRenderer$.onNext(renderer);
