import * as THREE from 'three'

export default class App {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer

  constructor() {
    // Scene
    this.scene = new THREE.Scene()

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.z = 5

    // Renderer
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    // Start loop
    this.animate()
  }

  animate = () => {
    requestAnimationFrame(this.animate)

    this.renderer.render(this.scene, this.camera)
  }
}