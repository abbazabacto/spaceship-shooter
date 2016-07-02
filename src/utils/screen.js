import Rx from 'rx';
import 'rx-dom';

//import { renderer } from '../tools'
import { renderer } from '../tools/renderer'; 
//otherwise itsnt loading before
//renderer then is undefined
//circulair dependency

import { DomReady } from './misc';

const createGetAspectRatio = container => {
  return function getAspectRatio() {
    if(container.innerWidth){
      return container.innerWidth / container.innerHeight;
    }
    
    return container.offsetWidth / container.offsetHeight;
  }
}

export const getAspectRatio = createGetAspectRatio(window);

export const aspectRatio$ = Rx.Observable.merge(
  DomReady,
  Rx.Observable.fromEvent(window, 'resize')
)
.map(getAspectRatio)
.startWith(getAspectRatio())
.shareReplay(1);

export const fullscreen = (container) => {
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
