import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const POWER_LINES_SCALE = 0.16
const POWER_LINES_COUNT = 2
const POWER_LINES_START_X = -3
const POWER_LINES_START_Z = 0

export default class PowerLines {
	group: THREE.Group

	constructor(scene: THREE.Scene) {
		this.group = new THREE.Group()
		scene.add(this.group)

		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/power_lines.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			const reference = gltf.scene.clone(true)
			reference.scale.setScalar(POWER_LINES_SCALE)
			const referenceBounds = new THREE.Box3().setFromObject(reference)
			const spacingZ = (referenceBounds.max.z - referenceBounds.min.z) * 0.5

			for (let index = 0; index < POWER_LINES_COUNT; index += 1) {
				const instance = gltf.scene.clone(true)
				instance.scale.setScalar(POWER_LINES_SCALE)

				const x = POWER_LINES_START_X
				const z = POWER_LINES_START_Z + index * spacingZ
				const groundY = Landscape.getHeight(x, z)
				instance.position.set(x, groundY, z)

				instance.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true
						child.receiveShadow = true
					}
				})

				const bounds = new THREE.Box3().setFromObject(instance)
				instance.position.y += groundY - bounds.min.y

				this.group.add(instance)
			}
		})
	}
}
