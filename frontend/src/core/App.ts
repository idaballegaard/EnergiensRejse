import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import World from '../scene/World'
import CameraController from '../interaction/CameraController'
import InfoOverlay, { type Hotspot } from '../ui/InfoOverlay'
import ChatPanel from '../ui/ChatPanel'
import { setupLighting } from './setup/setupLighting'
import { setupRenderer } from './setup/setupRenderer'
import { setupCameraControls } from './setup/setupCameraControls'

const HOTSPOTS: Hotspot[] = [
  {
    id: 1,
    label: 'Vindmøllen producerer strøm',
    description: 'Vinden får møllens vinger til at dreje rundt. En generator i møllen omdanner bevægelsen til elektricitet.',
    worldPosition: new THREE.Vector3(-30, 7, -31),
    cameraPosition: new THREE.Vector3(-18, 8, -20),
    cameraLookAt: new THREE.Vector3(-30, 2, -31),
  },
  {
    id: 2,
    label: 'Strømmen bliver opgraderet i transformeren',
    description: 'En transformer ved møllen øger spændingen, så strømmen kan sendes langt af sted med mindre tab.',
    worldPosition: new THREE.Vector3(-18, 4, -23),
    cameraPosition: new THREE.Vector3(-9, 5, -14),
    cameraLookAt: new THREE.Vector3(-18, 1, -23),
  },
  {
    id: 3,
    label: 'Strømmen sendes ud i elnettet via højspænding',
    description: 'Strømmen sendes ud i højspændingsnettet (typisk 60–400 kV) gennem store elmaster over store afstande.',
    worldPosition: new THREE.Vector3(-8, 5, 5),
    cameraPosition: new THREE.Vector3(2, 7, 14),
    cameraLookAt: new THREE.Vector3(-8, 2, 5),
  },
  {
    id: 4,
    label: 'På en transformerstation bliver spændingen sænket',
    description: 'På transformerstationen bliver spændingen sænket til et niveau, der kan sendes sikkert videre ud i lokalnettet.',
    worldPosition: new THREE.Vector3(10, 4, 25),
    cameraPosition: new THREE.Vector3(14, 7, 36),
    cameraLookAt: new THREE.Vector3(10, 1, 25),
  },
  {
    id: 5,
    label: 'Strømmen sendes videre ud i lokalnettet',
    description: 'Strømmen sendes gennem mindre kabler og luftledninger ud til byer, landsbyer og boliger.',
    worldPosition: new THREE.Vector3(15, 5, 10),
    cameraPosition: new THREE.Vector3(24, 6, 20),
    cameraLookAt: new THREE.Vector3(15, 1, 10),
  },
  {
    id: 6,
    label: 'Strømmen kommer ind i dit hus',
    description: 'Strømmen går ind i din bolig gennem eltavlen. Herfra kan du bruge strømmen til lys, varme, computere og meget andet.',
    worldPosition: new THREE.Vector3(33, 7, -14),
    cameraPosition: new THREE.Vector3(22, 6, -4),
    cameraLookAt: new THREE.Vector3(33, 1, -14),
  },
]

const OVERVIEW_CAMERA_POSITION = new THREE.Vector3(0, 20, 42)
const OVERVIEW_CAMERA_LOOK_AT = new THREE.Vector3(0, 0, 5)

export default class App {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  world: World
  cameraController: CameraController
  overlay: InfoOverlay
  chatPanel: ChatPanel

  constructor() {
    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#87ceeb')
    this.scene.fog = new THREE.Fog('#87ceeb', 70, 180)

    setupLighting(this.scene)

    // Renderer
    this.renderer = setupRenderer()

    // Camera + controls
    const { camera, controls } = setupCameraControls(
      this.renderer.domElement,
      OVERVIEW_CAMERA_POSITION,
      OVERVIEW_CAMERA_LOOK_AT
    )
    this.camera = camera
    this.controls = controls

    // Camera controller
    this.cameraController = new CameraController(this.camera, this.controls)

    // Info overlay
    this.overlay = new InfoOverlay(
      HOTSPOTS,
      (hotspot) => {
        this.cameraController.moveTo(hotspot.cameraPosition, hotspot.cameraLookAt)
      },
      () => {
        this.cameraController.moveTo(OVERVIEW_CAMERA_POSITION, OVERVIEW_CAMERA_LOOK_AT)
      }
    )

    // Chat panel
    this.chatPanel = new ChatPanel()

    // World
    this.world = new World(this.scene)

    // Resize
    window.addEventListener('resize', this.onResize)

    // Start loop
    this.animate()
  }

  onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate = () => {
    requestAnimationFrame(this.animate)

    this.controls.update()
    this.cameraController.update()
    this.world.update(this.camera)
    this.overlay.update(this.camera)
    this.renderer.render(this.scene, this.camera)
  }
}