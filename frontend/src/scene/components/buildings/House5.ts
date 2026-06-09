import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from '../environment/Landscape'

const HOUSE_5_SCALE = 1
const HOUSE_5_INSTANCES: [number, number, number][] = [
	// rød tag + terrasse
	[37.5, -24.5, 0], // done
	[28, -28, Math.PI / 2], // done
	[38, -28, Math.PI / 2], // done
	[44.5, -12, Math.PI], // done
	[22, -35, -Math.PI / 2], // done
	[16, -25, 0], // done
]

export default class House5 {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/house_5.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			for (const [x, z, yRotation] of HOUSE_5_INSTANCES) {
				const house = gltf.scene.clone(true)
				house.scale.setScalar(HOUSE_5_SCALE)

				const groundY = Landscape.getHeight(x, z)
				house.position.set(x, groundY, z)
				house.rotation.y = yRotation

				house.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true
						child.receiveShadow = true
					}
				})

				const bounds = new THREE.Box3().setFromObject(house)
				house.position.y += groundY - bounds.min.y

				scene.add(house)
				if (this.model === null) {
					this.model = house
				}
			}
		})
	}
}
