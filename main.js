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

const point0 = new THREE.Vector3(-0.7, -0.1, 0);
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

  ray.origin.copy(points[0])
  ray.direction.copy(points[1]).sub(points[0]).normalize();
  maxLength = points[0].distanceTo(points[1])


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

// const stepVector2 = new THREE.Vector3(
//   Math.min(Math.sqrt(1 + (dir2.y + dir2.z) / dir2.x), Number.MAX_VALUE),
//   Math.min(Math.sqrt(1 + (dir2.x + dir2.z) / dir2.y), Number.MAX_VALUE),
//   Math.min(Math.sqrt(1 + (dir2.y + dir2.x) / dir2.z), Number.MAX_VALUE),
// );

const stepVector = new THREE.Vector3();
const signs = new THREE.Vector3();
function setStepVector() 
{
  signs.set(
    ray.direction.x >= 0 ? 1 : 0,
    ray.direction.y >= 0 ? 1 : 0,
    ray.direction.z >= 0 ? 1 : 0,
  );
  stepVector.set(
    1 / ray.direction.x ?? Infinity,
    1 / ray.direction.y ?? Infinity,
    1 / ray.direction.z ?? Infinity,
  );

  stepVector.x *= signs.x ? 1 : -1;
  stepVector.y *= signs.y ? 1 : -1;
  stepVector.z *= signs.z ? 1 : -1;
}
setStepVector()

console.log(ray)
console.log(dir2)
console.log(stepVector)
// console.log(stepVector2)
const sphereGeometry2 = new THREE.SphereGeometry( 0.025, 16, 16 );
const sphereMaterial2 = new THREE.MeshPhongMaterial( { color: 0x2244AA, wireframe: true } );

let inter0 = new THREE.Mesh(sphereGeometry2, sphereMaterial2)
let inter1 = new THREE.Mesh(sphereGeometry2, sphereMaterial2)
scene.add(inter0)
scene.add(inter1)

// const clamp = (val, min, max) => M

function computeEntryPoint04(ray) {
  const invDirection = (new THREE.Vector3(1,1,1)).divide(ray.direction);
  // const invDirection = 

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


  const maxMin = Math.max(Math.max(tMin.x, tMin.y), 0);
  const maxMax = Math.min(Math.min(tMax.x, tMax.y), Number.MAX_VALUE);

  const entryPoint = ray.origin.clone().addScaledVector(ray.direction, maxMin)
  const exitPoint = ray.origin.clone().addScaledVector(ray.direction, maxMax)
  inter0.position.copy(entryPoint);
  inter1.position.copy(exitPoint);
  console.log(maxMin, maxMax)
  return {point: entryPoint, distance: maxMin}
}

function computeEntryPoint(ray) {

  // console.log(stepVector)
  // console.log(ray.direction)
  
  // console.log(signs)

  const tTo0 = new THREE.Vector3(
    - ray.origin.x / (ray.direction.x != 0 ? ray.direction.x : Infinity),
    - ray.origin.y / (ray.direction.y != 0 ? ray.direction.y : Infinity),
    - ray.origin.z / (ray.direction.z != 0 ? ray.direction.z : Infinity),
  )

  const tTo4 = new THREE.Vector3(
    (4 - ray.origin.x) / (ray.direction.x != 0 ? ray.direction.x : 0),
    (4 - ray.origin.y) / (ray.direction.y != 0 ? ray.direction.y : 0),
    (4 - ray.origin.z) / (ray.direction.z != 0 ? ray.direction.z : 0),
  )
  // console.log(tTo0)
  // console.log(tTo4)
  
  const tMin = new THREE.Vector3(
    Math.max(0, signs.x ? tTo0.x : tTo4.x), 
    Math.max(0, signs.y ? tTo0.y : tTo4.y), 
    Math.max(0, signs.z ? tTo0.z : tTo4.z) 
  );

  const tMax = new THREE.Vector3(
    Math.min(Number.MAX_VALUE, signs.x ? tTo4.x : tTo0.x), 
    Math.min(Number.MAX_VALUE, signs.y ? tTo4.y : tTo0.y), 
    Math.min(Number.MAX_VALUE, signs.z ? tTo4.z : tTo0.z) 
  );
  // console.log(tMin, tMax)

  const entry = Math.max(Math.max(tMin.x, tMin.y), tMin.z);
  const exit = Math.min(Math.min(tMax.x, tMax.y), tMax.z);
  // console.log(entry, exit)

  const entryPoint = ray.origin.clone().addScaledVector(ray.direction, entry)
  const exitPoint = ray.origin.clone().addScaledVector(ray.direction, exit)
  inter0.position.copy(entryPoint);
  inter1.position.copy(exitPoint);

  entryPoint.clamp(new THREE.Vector3(0,0,0), new THREE.Vector3(4,4,4))
  // console.log(entryPoint)
  return {entryPoint, entry, exit}
}



const sphereGeometry3 = new THREE.SphereGeometry( 0.025, 16, 16 );
const sphereMaterial3 = new THREE.MeshPhongMaterial( { color: 0xAA4422, wireframe: true } );
let step1 = new THREE.Mesh(sphereGeometry3, sphereMaterial3)
let steps = [];
for(let i = 0; i < 10; ++i) {
  steps.push(new THREE.Mesh(sphereGeometry3, sphereMaterial3))
  scene.add(steps[i])
}

const epsilon = 0.000001;
function stepThrough(ray, entryPoint, minT, maxT) {
  const nextBoundary = entryPoint.clone().floor().add(signs);
  // nextBoundary.clamp(new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 3, 3))

  console.log(entryPoint);
  console.log(stepVector);
  console.log(nextBoundary);
  console.log(ray.direction);
  console.log(maxT)

  // const firstBoundary = new THREE.Vector3(

  // );

  const closestBoundary = nextBoundary.clone().sub(entryPoint).divide(ray.direction);
  closestBoundary.x += closestBoundary.x < epsilon ? stepVector.x : 0;
  closestBoundary.y += closestBoundary.y < epsilon ? stepVector.y : 0;
  closestBoundary.z += closestBoundary.z < epsilon ? stepVector.z : 0;
  console.log(closestBoundary);

  let t = 0;
  console.log(t+minT)
  let i = 0;
  do {
    if(closestBoundary.x < closestBoundary.y && closestBoundary.x < closestBoundary.z) {
      console.log("x", closestBoundary.x, stepVector.x)
      t = closestBoundary.x;
      closestBoundary.x += stepVector.x;
    } else if(closestBoundary.y < closestBoundary.z) {
      console.log("y", closestBoundary.y, stepVector.y)
      t = closestBoundary.y;
      closestBoundary.y += stepVector.y;
    }
    else {
      console.log("z")
      t = closestBoundary.z;
      closestBoundary.z += stepVector.z;
    }
    console.log(t+minT);
    if(t + minT < maxT - epsilon) steps[i++].position.copy(ray.origin).addScaledVector(ray.direction, t + minT)
  } while(t + minT < maxT - epsilon)
    
  while(i < 10) {
    steps[i++].position.set(Infinity,Infinity,Infinity)

  }



}



function compute(){
  const {entryPoint, entry, exit} = computeEntryPoint(ray);

  stepThrough(ray, entryPoint, entry, exit);
}

compute()

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
  point.z = 0;
  spheres[selectedPoint].position.copy(point);
  updateRay(selectedPoint, point);
  setStepVector();

  compute()
  // const {entryPoint, entry, exit} = computeEntryPoint(ray);

  // stepThrough(ray, entryPoint, entry, exit);
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





