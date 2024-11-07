import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Grid2D } from './Grid2D.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x555555);

let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
let pointLight0 = new THREE.PointLight(0xffffff, 100);
pointLight0.position.set(5,4,5);
scene.add(pointLight0);

const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 50 );
camera.position.set( 2, 2, 6 );

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.autoClear = false;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enablePan = false;
orbitControls.enableRotate = false;
orbitControls.target.set(2, 2, 0);
orbitControls.update()





const grid2d = new Grid2D(4, 4, 2);
scene.add(grid2d)
const grid2d0 = new Grid2D(4, 1, 5, );
scene.add(grid2d0)

const point0 = new THREE.Vector3(-0.5, -0.1, 0);
const point1 = new THREE.Vector3(4.5, 4, 0);

const points = [point0, point1];
let maxLength = point0.distanceTo(point1)

const rayGeometry = new THREE.BufferGeometry().setFromPoints([point0, point1]);
const rayMaterial = new THREE.LineBasicMaterial({
    color: 0x4080ff,
    linewidth: 3,
});
const rayMesh = new THREE.Line(rayGeometry, rayMaterial);
scene.add(rayMesh)
const rayPositions = rayMesh.geometry.attributes.position;

const ray = {
  direction: new THREE.Vector3(),
  origin: new THREE.Vector3(),
}

function updateRay(pId, pos) {
  const index = pId * 3;
  rayPositions.array[index] = pos.x;
  rayPositions.array[index+1] = pos.y;
  rayPositions.array[index+2] = pos.z;

  rayPositions.needsUpdate = true;

  points[pId].copy(pos)


}

updateRay(0, point0)
updateRay(1, point1)

const sphereGeometry = new THREE.SphereGeometry( 0.05, 16, 16 );
const sphereMaterial = new THREE.MeshPhongMaterial( { color: 0x4499FF, transparent: true, opacity: 0.5 } );
const spheres = [
  new THREE.Mesh(sphereGeometry, sphereMaterial),
  new THREE.Mesh(sphereGeometry, sphereMaterial),
]

spheres[0].position.copy(point0);
spheres[1].position.copy(point1);

scene.add(...spheres);


const backgroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100));







const dir2 = ray.direction.clone().multiply(ray.direction);

const stepVector = new THREE.Vector3(
  Math.min(Math.sqrt(1 + (dir2.y + dir2.z) / dir2.x), Number.MAX_VALUE),
  Math.min(Math.sqrt(1 + (dir2.x + dir2.z) / dir2.y), Number.MAX_VALUE),
  Math.min(Math.sqrt(1 + (dir2.y + dir2.x) / dir2.z), Number.MAX_VALUE),
);


console.log(ray)
console.log(dir2)
console.log(stepVector)
const sphereGeometry2 = new THREE.SphereGeometry( 0.025, 16, 16 );
const sphereMaterial2 = new THREE.MeshPhongMaterial( { color: 0x2244AA, wireframe: true } );

let inter0 = new THREE.Mesh(sphereGeometry2, sphereMaterial2)
let inter1 = new THREE.Mesh(sphereGeometry2, sphereMaterial2)
scene.add(inter0)
scene.add(inter1)


function computeEntryPoint04(ray) {
  const invDirection = (new THREE.Vector3(1,1,1)).divide(ray.direction);
  const t0 = new THREE.Vector3(0, 0, 0);
  t0.sub(ray.origin).multiply(invDirection);
  const t1 = new THREE.Vector3(4, 4, 0);
  t1.sub(ray.origin).multiply(invDirection);

  const tMin = new THREE.Vector3(
    Math.max(0, invDirection.x < 0 ? t1.x : t0.x), 
    Math.max(0, invDirection.y < 0 ? t1.y : t0.y), 
    Math.max(0, invDirection.z < 0 ? t1.z : t0.z) 
  );

  const tMax = new THREE.Vector3(
    Math.min(Number.MAX_VALUE, invDirection.x < 0 ? t0.x : t1.x), 
    Math.min(Number.MAX_VALUE, invDirection.y < 0 ? t0.y : t1.y), 
    Math.min(Number.MAX_VALUE, invDirection.z < 0 ? t0.z : t1.z) 
  );


  let maxMin = Math.max(Math.max(tMin.x, tMin.y), 0);
  let maxMax = Math.min(Math.min(tMax.x, tMax.y), Number.MAX_VALUE);

  inter0.position.copy(ray.origin).addScaledVector(ray.direction, maxMin);
  inter1.position.copy(ray.origin).addScaledVector(ray.direction, maxMax);

}


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2( 1, 1 );
let selectedPoint = -1;

function setMouse(px, py) {
  mouse.set( ( px / window.innerWidth ) * 2 - 1, - ( py / window.innerHeight ) * 2 + 1 );
}

function onPointerDown(event) {
  setMouse(event.clientX, event.clientY);

  raycaster.setFromCamera(mouse, camera);
  if(raycaster.intersectObject(spheres[0]).length)
    selectedPoint = 0;
  else if (raycaster.intersectObject(spheres[1]).length){
    selectedPoint = 1;
  }

  if(selectedPoint != -1){
    document.addEventListener( 'pointerup', onPointerUp );
    document.removeEventListener( 'pointerdown', onPointerDown );
    document.addEventListener( 'pointermove', onPointerMove );
    console.log(`selected point ${selectedPoint}`);
  }
}

function onPointerMove(event) {
  setMouse(event.clientX, event.clientY);
  raycaster.setFromCamera(mouse, camera);
  const point = raycaster.intersectObject(backgroundPlane)[0].point;

  spheres[selectedPoint].position.copy(point);
  updateRay(selectedPoint, point);

  ray.direction.copy(point1).sub(point0).normalize();
  ray.origin.copy(point0);
  maxLength = point0.distanceTo(point1)

  computeEntryPoint04(ray)

}

function onPointerUp(event) {
  console.log(`deselected point ${selectedPoint}`);
  selectedPoint = -1;
  document.removeEventListener( 'pointermove', onPointerMove );
  document.addEventListener( 'pointerdown', onPointerDown );
}


document.addEventListener( 'pointerdown', onPointerDown );

window.addEventListener('resize', function() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});


function animate() {
  renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );





