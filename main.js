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





const grid2d = new Grid2D(4, 4);
scene.add(grid2d)


const point0 = new THREE.Vector3(-0.5, 0, 0);
const point1 = new THREE.Vector3(4.5, 4, 0);

const rayGeometry = new THREE.BufferGeometry().setFromPoints([point0, point1]);
const rayMaterial = new THREE.LineBasicMaterial({
    color: 0x4080ff,
    linewidth: 3,
});
const ray = new THREE.Line(rayGeometry, rayMaterial);
scene.add(ray)
const rayPositions = ray.geometry.attributes.position;

function updateRay(pId, pos) {
  const index = pId * 3;
  rayPositions.array[index] = pos.x;
  rayPositions.array[index+1] = pos.y;
  rayPositions.array[index+2] = pos.z;

  rayPositions.needsUpdate = true;
}

const sphereGeometry = new THREE.SphereGeometry( 0.05, 16, 16 );
const sphereMaterial = new THREE.MeshPhongMaterial( { color: 0x4499FF } );
const spheres = [
  new THREE.Mesh(sphereGeometry, sphereMaterial),
  new THREE.Mesh(sphereGeometry, sphereMaterial),
]

spheres[0].position.copy(point0);
spheres[1].position.copy(point1);

scene.add(...spheres);


const backgroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100));



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





