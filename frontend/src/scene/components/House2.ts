import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const HOUSE_2_SCALE = 1
const HOUSE_2_INSTANCES: [number, number, number][] = [
	[33, -9.7, Math.PI / 2], // done
	[38, -20, 0], // done
	[33, -15.7, -Math.PI / 2], // done
	[32.5, -34.5, -Math.PI / 2], // done
	[23, -9.5, Math.PI / 2], // done
]

export default class House2 {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/house_2.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			for (const [x, z, yRotation] of HOUSE_2_INSTANCES) {
				const house = gltf.scene.clone(true)
				house.scale.setScalar(HOUSE_2_SCALE)

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
