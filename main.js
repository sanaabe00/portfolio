// --- Three.js imports (CDN, no bundler needed)
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js';

// ------- DOM
const canvas = document.getElementById('c');
const drop = document.getElementById('drop');
const fileInput = document.getElementById('file');
const btnReset  = document.getElementById('btnReset');
const chkAuto   = document.getElementById('chkAuto');
const chkGrid   = document.getElementById('chkGrid');
const chkShadow = document.getElementById('chkShadow');
const envRange  = document.getElementById('envRange');

// ------- Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ------- Scene & Camera
const scene = new THREE.Scene();
scene.background = null; // let CSS gradient shine through

const camera = new THREE.PerspectiveCamera(50, 2, 0.1, 2000);
camera.position.set(3.5, 2.2, 4.8);

// ------- Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// ------- Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.8);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(3, 8, 5);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
dir.shadow.normalBias = 0.02;
scene.add(dir);

// Environment intensity controller
let envIntensity = 1;

// ------- Ground + Grid
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.ShadowMaterial({ opacity: 0.28 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(200, 200, 0x3a4a6a, 0x1e293b);
grid.material.opacity = 0.25;
grid.material.transparent = true;
grid.position.y = 0.001;
scene.add(grid);

// ------- Loaders
const gltfLoader = new GLTFLoader();
const fbxLoader  = new FBXLoader();

// ------- State
let currentObject = null;
let mixer = null;
let clock = new THREE.Clock();

// ------- Resize
function onResize() {
  const width = drop.clientWidth;
  const height = drop.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);
onResize();

// ------- Helpers
function clearCurrent() {
  if (currentObject) {
    scene.remove(currentObject);
    currentObject.traverse?.(o => {
      if (o.isMesh) {
        o.geometry?.dispose?.();
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.());
        else o.material?.dispose?.();
      }
    });
    currentObject = null;
  }
  if (mixer) { mixer.stopAllAction(); mixer.uncacheRoot(mixer.getRoot()); mixer = null; }
}

function centerAndScaleToFit(object, size = 2.5) {
  // Compute bounds
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const diagonal = box.getSize(new THREE.Vector3()).length();
  const scale = diagonal > 0 ? (size / diagonal) : 1;

  object.position.sub(center); // center at origin
  object.scale.setScalar(scale);

  // Move ground to object base
  const newBox = new THREE.Box3().setFromObject(object);
  const minY = newBox.min.y;
  object.position.y -= minY; // place on ground

  // Reposition camera nicely
  const dist = (newBox.getSize(new THREE.Vector3()).length()) * 1.2 + 1.5;
  camera.position.set(dist * 0.7, dist * 0.45, dist);
  controls.target.set(0, Math.max(0.6, newBox.getSize(new THREE.Vector3()).y * 0.4), 0);
  controls.update();
}

function setShadows(root, enabled) {
  root.traverse?.(o => {
    if (o.isMesh || o.isSkinnedMesh) {
      o.castShadow = enabled;
      o.receiveShadow = enabled && (o.material?.transparent !== true);
    }
  });
}

function setEnvIntensity(root, intensity) {
  root.traverse?.(o => {
    if (o.isMesh || o.isSkinnedMesh) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        if (!m) return;
        if ('envMapIntensity' in m) m.envMapIntensity = intensity;
        m.needsUpdate = true;
      });
    }
  });
}

// ------- Loading
async function loadFromFile(file) {
  if (!file) return;

  const url = URL.createObjectURL(file);
  const ext = file.name.toLowerCase().split('.').pop();

  clearCurrent();

  try {
    let root;
    if (ext === 'glb' || ext === 'gltf') {
      const gltf = await gltfLoader.loadAsync(url);
      root = gltf.scene || gltf.scenes[0];
      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(root);
        // Play first animation by default
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }
    } else if (ext === 'fbx') {
      const fbx = await fbxLoader.loadAsync(url);
      root = fbx;
      // FBX often has baked anims
      if (fbx.animations?.length) {
        mixer = new THREE.AnimationMixer(fbx);
        const action = mixer.clipAction(fbx.animations[0]);
        action.play();
      }
    } else {
      alert('Unsupported file type. Please use .glb, .gltf or .fbx');
      return;
    }

    currentObject = root;
    setShadows(currentObject, chkShadow.checked);
    setEnvIntensity(currentObject, envIntensity);
    scene.add(currentObject);
    centerAndScaleToFit(currentObject);
  } catch (err) {
    console.error(err);
    alert('Failed to load model. If .gltf uses external textures, prefer a single-file .glb.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ------- Drag & Drop
['dragenter','dragover'].forEach(evt => {
  drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.add('dragover'); });
});
['dragleave','drop'].forEach(evt => {
  drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.remove('dragover'); });
});
drop.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files?.[0];
  loadFromFile(file);
});

// ------- UI wiring
fileInput.addEventListener('change', e => loadFromFile(e.target.files?.[0]));
btnReset.addEventListener('click', () => {
  controls.reset();
  controls.autoRotate = chkAuto.checked = true;
});
chkAuto.addEventListener('change', e => controls.autoRotate = e.target.checked);
chkGrid.addEventListener('change', e => grid.visible = e.target.checked);
chkShadow.addEventListener('change', e => {
  const enabled = e.target.checked;
  renderer.shadowMap.enabled = enabled;
  setShadows(currentObject ?? scene, enabled);
});
envRange.addEventListener('input', e => {
  envIntensity = parseFloat(e.target.value);
  if (currentObject) setEnvIntensity(currentObject, envIntensity);
});

// ------- Animation loop
function render() {
  const delta = clock.getDelta();
  controls.update();
  if (mixer) mixer.update(delta);

  // simple fake environment by modulating directional light intensity
  dir.intensity = 0.8 + envIntensity * 0.6;
  hemi.intensity = 0.5 + envIntensity * 0.5;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

