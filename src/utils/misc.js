import Rx from 'rx';
import 'rx-dom';

export function getRad(deg) {
  return deg * (Math.PI / 180);
};

export function getDeg(rad) {
  return rad / (Math.PI / 180);
};

export function getNow() {
  return (new Date()).getTime();
};

export function randomFromRange(min, max){
  const diff = Math.abs(min - max);
  return parseInt(Math.random() * diff) + min;
}

export const DomReady = Rx.DOM.ready().shareReplay(1);