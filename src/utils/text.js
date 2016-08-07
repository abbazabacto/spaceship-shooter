import THREE from 'three';
import '../../lib/text/GeometryUtils';
import '../../lib/text/TextGeometry';
import '../../lib/text/FontUtils';
import '../../res/fonts/helvetiker_bold.typeface';
import '../../res/fonts/helvetiker_regular.typeface';

export function createTextMesh(text, settings, align = 'left') {
  settings = settings || {};
  
  settings.height = settings.height || 1;
  settings.size = settings.size || 10;
  settings.curveSegments = settings.curveSegments || 4;
  settings.bevelThickness = settings.bevelThickness || 0.5;
  settings.bevelSize = settings.bevelSize || 0.25;
  settings.bevelSegments = settings.bevelSegments || 3;
  settings.bevelEnabled = settings.bevelEnabled || true;
  settings.font = settings.font || "helvetiker"; // helvetiker, optimer, gentilis, droid sans, droid serif
  settings.weight = settings.weight || "bold"; // normal bold
  settings.style = settings.style || "normal"; // normal italic
  
  settings.material = 0;
  settings.extrudeMaterial = 1;
  
  const textGeometry = new THREE.TextGeometry(text, settings);
  textGeometry.computeBoundingBox();
  textGeometry.computeVertexNormals();
  
  const material = new THREE.MeshFaceMaterial([
    new THREE.MeshBasicMaterial({ color: 0xf1f1f1 }),
    new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
  ]);
  
  const textMesh = new THREE.Mesh(textGeometry, material);
  
  if(align === 'center'){
    textMesh.position.x = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
  }
  
  if(align === 'right'){
    textMesh.position.x = -1 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
  }
  
  const zeroPointer = new THREE.Object3D();
  zeroPointer.add(textMesh);
  
  return zeroPointer;
}