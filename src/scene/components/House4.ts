import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const HOUSE_4_SCALE = 1
const HOUSE_4_INSTANCES: [number, number, number][] = [
	// gul
	[22, -23, Math.PI], // done
	[33, -29, Math.PI / 2], // done
	[43.5, -17, Math.PI], // done
	[27, -34, -Math.PI / 2], // done
	[17, -30, 0], // done
]

export default class House4 {
	model: THREE.Group | null = null

	constructor(scene: THREE.Scene) {
		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/house_4.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			for (const [x, z, yRotation] of HOUSE_4_INSTANCES) {
				const house = gltf.scene.clone(true)
				house.scale.setScalar(HOUSE_4_SCALE)

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
