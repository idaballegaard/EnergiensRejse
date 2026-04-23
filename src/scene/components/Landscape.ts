import * as THREE from 'three'

export default class Landscape {
  static getHeight(x: number, z: number): number {
    return (
      Math.sin(x * 0.4) * Math.cos(z * 0.3) * 0.9 +
      Math.sin(x * 0.9 + 1.2) * Math.cos(z * 0.7 + 0.8) * 0.4 +
      Math.sin(x * 0.2 + 2.5) * Math.cos(z * 0.5 + 1.1) * 0.6
    )
  }

  constructor(scene: THREE.Scene) {
    const segments = 80
    const size = 60

    const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
    geometry.rotateX(-Math.PI / 2)

    const positions = geometry.attributes['position']
    if (positions) {
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const z = positions.getZ(i)
        positions.setY(i, Landscape.getHeight(x, z))
      }
      positions.needsUpdate = true
    }

    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: '#4a8c3f',
      roughness: 0.95,
      metalness: 0,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true
    scene.add(mesh)
  }
}
