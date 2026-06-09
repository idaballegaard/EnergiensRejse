import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from '../environment/Landscape'

const HOUSE_1_SCALE = 1
const HOUSE_1_INSTANCES: [number, number, number][] = [
	[28, -9.5, Math.PI / 2], // done
	[23.5, -28.5, Math.PI / 2], // done
	[28, -15.5,-Math.PI / 2], // done
	[44, -23, Math.PI], // done
	[23, -17, Math.PI], // done
]

export default class House1 {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/house_1.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			for (const [x, z, yRotation] of HOUSE_1_INSTANCES) {
				const house = gltf.scene.clone(true)
				house.scale.setScalar(HOUSE_1_SCALE)

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
