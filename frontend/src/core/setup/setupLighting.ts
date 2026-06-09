import * as THREE from 'three'

export function setupLighting(scene: THREE.Scene): void {
  const sun = new THREE.DirectionalLight('#fff4e0', 3.0)
  sun.position.set(15, 20, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 0.5
  sun.shadow.camera.far = 80
  sun.shadow.camera.left = -30
  sun.shadow.camera.right = 30
  sun.shadow.camera.top = 30
  sun.shadow.camera.bottom = -30
  sun.shadow.bias = -0.001
  scene.add(sun)

  const skyLight = new THREE.HemisphereLight('#87ceeb', '#4a8c3f', 1.2)
  scene.add(skyLight)
}
