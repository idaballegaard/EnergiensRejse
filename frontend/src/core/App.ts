import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import World from '../scene/World'
import CameraController from '../interaction/CameraController'
import InfoOverlay from '../ui/InfoOverlay'
import ChatPanel from '../ui/ChatPanel'
import { HOTSPOTS } from '../data/hotspots'
import { setupLighting } from './setup/setupLighting'
import { setupRenderer } from './setup/setupRenderer'
import { setupCameraControls } from './setup/setupCameraControls'

const OVERVIEW_CAMERA_POSITION = new THREE.Vector3(25, 24, 54)
const OVERVIEW_CAMERA_LOOK_AT = new THREE.Vector3(25, 15, 35)

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