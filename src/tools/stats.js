import THREE from 'three';
import Rx from 'rx';
import Stats from '../../lib/stats/stats.min';
import THREEx from '../../lib/stats/threex.rendererstats';
import dat from 'dat';

const _stats$ = Rx.Observable.of(new Stats())

export const stats$ = _stats$;
// export const stats$ = Rx.Observable.combineLatest(
//   _stats$,
//   Rx.Observable.interval(2000),
//   (stats, index) => {
//     return { stats, index };
//   }
// )
// .do(({ stats, index }) => stats.showPanel(index % 3))
// .map(({ stats }) => stats)
// .distinctUntilChanged((statsX, statsY) => statsX !== statsY);

export const rendererStats$ = Rx.Observable.of(new THREEx.RendererStats());

const gui = new dat.GUI();
export const createGui = (label, val, ...settings) => {
  var subj = new Rx.Subject();
  var obj = { [label]: val };
  var controller = gui.add.call(gui, obj, label, ...settings);
  controller.onChange(val => subj.onNext(val));
  controller.onFinishChange(val => subj.onNext(val));
  // addGui$.onNext({ obj, prop, settings });
  return subj;
};
