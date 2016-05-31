import Rx from 'rx';
import 'rx-dom';

//import { renderer } from '../tools'
import { renderer } from '../tools/renderer'; 
//otherwise itsnt loading before
//renderer then is undefined
//circulair dependency

import { DomReady } from './misc';

function createGetAspectRatio(container){
  return function getAspectRatio() {
    if(container.innerWidth){
      return container.innerWidth / container.innerHeight;
    }
    
    return container.offsetWidth / container.offsetHeight;
  }
}

export const getAspectRatio = createGetAspectRatio(renderer.domElement);

export const aspectRatio$ = DomReady.flatMap(function(){
  return Rx.Observable
    .fromEvent(window, 'resize')
    .map(getAspectRatio)
    .startWith(getAspectRatio())
    .shareReplay(1);
}); 

export function fullscreen(container){
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}
