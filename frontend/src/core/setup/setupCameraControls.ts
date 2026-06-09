import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function setupCameraControls(
  rendererElement: HTMLCanvasElement,
  startPosition: THREE.Vector3,
  lookAt: THREE.Vector3
): { camera: THREE.PerspectiveCamera; controls: OrbitControls } {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    220
  )
  camera.position.copy(startPosition)
  camera.lookAt(lookAt)

  const controls = new OrbitControls(camera, rendererElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.target.copy(lookAt)

  return { camera, controls }
}
