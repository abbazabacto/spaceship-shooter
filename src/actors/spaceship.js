import THREE from 'three';
import Rx from 'rx';

const SpaceshipGeometry = new Rx.ReplaySubject(1);
const spaceShipMaterial = new THREE.MeshBasicMaterial({
  color: 0x333333,
});

const loader = new THREE.JSONLoader();

loader.load('res/models/spaceship.json', function (geometry, materials) {
  SpaceshipGeometry.onNext({geometry, materials});
});

export const SpaceshipMesh = SpaceshipGeometry
  .map(function({geometry, materials}){
    const mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
    mesh.position.y -= 1;
    mesh.scale.set(2, 2, 2);
    
    return mesh;
  });
