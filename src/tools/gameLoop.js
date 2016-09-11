import Rx from 'rx';

import { _animationFrame$ } from './animationFrame';

export const createGameLoop = (actors) => {
  const actorsKeysList = Object.keys(actors);
  const actorsList = actorsKeysList.map(key => actors[key]);

  return Rx.Observable.combineLatest(
    _animationFrame$,
    ...actorsList,
    createActorCombiner([
      'animationFrame',
      ...actorsKeysList,
    ])
  )
  //only update when frame is ready to render
  //otherwise frames could drop on overloading changes in other observables
  .distinctUntilChanged(({ animationFrame }) => animationFrame.timestamp);
}

function createActorCombiner(keys) {
  const strippedKeys = keys.map(key => key.replace(/\$$/, ''));

  return function actorCombiner() {
    const args = [...arguments];
    const actors = {};

    args.forEach((arg, index) => {
      actors[strippedKeys[index]] = arg;
    });

    return actors;
  }
}
