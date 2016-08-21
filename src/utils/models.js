import THREE from 'three';
import Rx from 'rx';

import '../../lib/loaders/DDSLoader';
import '../../lib/loaders/MTLLoader';
import '../../lib/loaders/OBJLoader';

const JSON_EXT = '.json';
const OBJECT_EXT = '.obj';
const MATERIAL_EXT = '.mtl';

const models = {};

const loader = new THREE.JSONLoader();
const mtlLoader = new THREE.MTLLoader();
const objLoader = new THREE.OBJLoader();

export const createModel = url => {
  const { path, file, ext } = splitUrl(url);

  if (!models[url]) {
    const progressXhr$ = new Rx.ReplaySubject(1);
    const mesh$ = new Rx.ReplaySubject(1);
    const object$ = new Rx.ReplaySubject(1);

    if (ext === JSON_EXT) {
      loader.load(url,
        (geometry, materials) => {
          if (materials) {
            mesh$.onNext(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials)));
          } else {
            mesh$.onNext(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial()));
          }
        },
        xhr => progressXhr$.onNext(xhr) //,
        // xhr => observer.onError(xhr)
      );
    } else if (ext === OBJECT_EXT) {
      mtlLoader.setPath(path);
      mtlLoader.load(`${file}${MATERIAL_EXT}`, materials => {
        materials.preload();
        objLoader.setMaterials(materials);

        objLoader.setPath(path);
        objLoader.load(`${file}${OBJECT_EXT}`,
          object => object$.onNext(object), 
          xhr => progressXhr$.onNext(xhr) //,
          // xhr => observer.onError(xhr)
        );
      });
    } else {
      return;
    }

    const progress$ = progressXhr$
      .filter(xhr => xhr && xhr.lengthComputable)
      .map(xhr => xhr.loaded ? Math.round(xhr.loaded / xhr.total, 2) : 0);

    const model = {
      progress$,
      object$: Rx.Observable.merge(object$, mesh$),
    };

    models[url] = model;
  }
  return models[url];
};

function splitUrl(url) {
  const [, path, file, ext] = url.match(/(.*\/)([^\/]*)(\.(?:[a-z])*)$/);
  return { path, file, ext };
}
