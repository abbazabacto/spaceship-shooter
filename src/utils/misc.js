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

export function range(start, end) {
  return Array.apply(null, {length: end - start})
    .map(Number.call, Number)
    .map(i => i + start);
}

export const DomReady = Rx.DOM.ready().shareReplay(1);