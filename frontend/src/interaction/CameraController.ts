import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class CameraController {
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private animating = false
  private targetPos = new THREE.Vector3()
  private targetLookAt = new THREE.Vector3()

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera
    this.controls = controls
  }

  moveTo(position: THREE.Vector3, lookAt: THREE.Vector3): void {
    this.targetPos.copy(position)
    this.targetLookAt.copy(lookAt)
    this.animating = true
    this.controls.enabled = false
  }

  update(): void {
    if (!this.animating) return

    this.camera.position.lerp(this.targetPos, 0.06)
    this.controls.target.lerp(this.targetLookAt, 0.06)

    if (this.camera.position.distanceTo(this.targetPos) < 0.05) {
      this.camera.position.copy(this.targetPos)
      this.controls.target.copy(this.targetLookAt)
      this.animating = false
      this.controls.enabled = true
    }
  }
}
