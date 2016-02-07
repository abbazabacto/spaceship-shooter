import THREE from 'three';
import Rx from 'rx';

const SpaceshipGeometry = new Rx.ReplaySubject(1);
const spaceShipMaterial = new THREE.MeshBasicMaterial({
  color: 0x333333,
});

const loader = new THREE.JSONLoader();

loader.load('res/models/spaceship.json', function (geometry) {
  SpaceshipGeometry.onNext(geometry);
});

export const SpaceshipMesh = SpaceshipGeometry
  .map(function(spaceShipGeometry){
    const spaceShipMesh = new THREE.Mesh(spaceShipGeometry, spaceShipMaterial);
    spaceShipMesh.position.y -= 1;
    spaceShipMesh.scale.set(2, 2, 2);
    
    return spaceShipMesh;
  });
