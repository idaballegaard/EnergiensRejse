import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from '../environment/Landscape'

const HOUSE_3_SCALE = 1
const HOUSE_3_INSTANCES: [number, number, number][] = [
	[38, -9, 0], // done
	[38, -3, 0], // done
	[38, -15, 0], // done
	[44, -28, Math.PI], // done
	[37.5, -34.5, -Math.PI / 2], // done
	[16.5, -20.5, 0], // done
	[16.5, -15, 0], // done
]

export default class House3 {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/house_3.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			for (const [x, z, yRotation] of HOUSE_3_INSTANCES) {
				const house = gltf.scene.clone(true)
				house.scale.setScalar(HOUSE_3_SCALE)

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
