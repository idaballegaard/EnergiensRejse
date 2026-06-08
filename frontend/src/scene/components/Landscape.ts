import * as THREE from 'three'

export default class Landscape {
  static readonly SIZE = 120

  static getHeight(x: number, z: number): number {
    void x
    void z
    return 0
  }

  constructor(scene: THREE.Scene) {
    const segments = 120
    const size = Landscape.SIZE
    const textureLoader = new THREE.TextureLoader()

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

    const grassTexture = textureLoader.load(
      `${import.meta.env.BASE_URL}models/grass.jpg`
    )
    grassTexture.colorSpace = THREE.SRGBColorSpace

    const material = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.95,
      metalness: 0,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true
    scene.add(mesh)
  }
}
