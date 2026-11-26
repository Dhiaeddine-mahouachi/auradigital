import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createAuri } from '../src/auri-studio/components/auri.js';

window.renderAuriParts = async () => {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(800, 920);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;

  const scene = new THREE.Scene();
  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = generator.fromScene(room, .045);
  scene.environment = environment.texture;
  scene.environmentIntensity = .72;
  scene.add(new THREE.HemisphereLight(0xe0fff0, 0x676355, 1.3));
  for (const [color, intensity, position] of [
    [0xffe6c7, 15.6, [-3.4, 5, 4]],
    [0xd8f6e8, 5.4, [3.7, 3.3, 4.5]],
    [0x9fffd1, 10.8, [2.6, 4.1, -2.8]],
  ]) {
    const light = new THREE.SpotLight(color, intensity, 20, .72, .54, 1.35);
    light.position.set(...position);
    light.target.position.set(0, .93, 0);
    scene.add(light, light.target);
  }

  const rig = await createAuri();
  scene.add(rig.root);
  for (const group of Object.values(rig.props)) group.visible = false;
  rig.arms.forEach(({ arm, elbow }, i) => {
    const side = i ? 1 : -1;
    arm.rotation.z = side * .25;
    elbow.rotation.z = side * .10;
  });
  const headFace = [];
  rig.head.traverse(object => { if (object.renderOrder === 3) headFace.push(object); });
  const body = rig.torso.children.filter(object => object !== rig.head &&
    !rig.arms.some(({ arm }) => arm === object));
  const groups = {
    body,
    head: [rig.head],
    armL: [rig.arms[0].arm],
    armR: [rig.arms[1].arm],
    legL: [rig.legs[0].leg],
    legR: [rig.legs[1].leg],
  };
  const meshes = Object.values(groups).flat();
  const camera = new THREE.OrthographicCamera(-1.5 * 400 / 460, 1.5 * 400 / 460, 1.5, -1.5, .1, 30);
  camera.position.set(0, 1.335, 7);
  camera.lookAt(0, 1.335, 0);
  const output = {};
  for (const [name, active] of Object.entries(groups)) {
    meshes.forEach(object => { object.visible = active.includes(object); });
    headFace.forEach(object => { object.visible = false; });
    renderer.render(scene, camera);
    output[name] = renderer.domElement.toDataURL('image/png').split(',')[1];
  }
  meshes.forEach(object => { object.visible = true; });
  headFace.forEach(object => { object.visible = true; });
  renderer.render(scene, camera);
  output.full = renderer.domElement.toDataURL('image/png').split(',')[1];
  meshes.forEach(object => { object.visible = object === rig.head; });
  renderer.render(scene, camera);
  output.avatar = renderer.domElement.toDataURL('image/png').split(',')[1];
  renderer.dispose();
  generator.dispose();
  room.dispose();
  environment.dispose();
  return output;
};
