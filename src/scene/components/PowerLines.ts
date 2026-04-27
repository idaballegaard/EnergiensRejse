import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const POWER_LINES_SCALE = 0.19
const POWER_LINES_COUNT = 3
const POWER_LINES_START_X = -3
const POWER_LINES_START_Z = 0
const POWER_LINES_SECOND_MODEL_X_OFFSET = 0.06
const POWER_LINES_GROUP_OFFSET_X = -10
const POWER_LINES_GROUP_OFFSET_Y = 0
const POWER_LINES_GROUP_OFFSET_Z = 0
const POWER_LINES_GROUP_ROTATION_Y = Math.PI / 6

export default class PowerLines {
	group: THREE.Group

	constructor(scene: THREE.Scene) {
		this.group = new THREE.Group()
		scene.add(this.group)
		this.group.position.set(
			POWER_LINES_GROUP_OFFSET_X,
			POWER_LINES_GROUP_OFFSET_Y,
			POWER_LINES_GROUP_OFFSET_Z
		)
		this.group.rotation.y = POWER_LINES_GROUP_ROTATION_Y

		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/power_lines.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			const reference = gltf.scene.clone(true)
			reference.scale.setScalar(POWER_LINES_SCALE)
			const referenceBounds = new THREE.Box3().setFromObject(reference)
			const spacingStepZ = (referenceBounds.max.z - referenceBounds.min.z) * 0.457
			const spacingStepX = POWER_LINES_SECOND_MODEL_X_OFFSET

			for (let index = 0; index < POWER_LINES_COUNT; index += 1) {
				const instance = gltf.scene.clone(true)
				instance.scale.setScalar(POWER_LINES_SCALE)
				if (index >= 1) {
					instance.rotation.y = Math.PI
				}

				const x = POWER_LINES_START_X + index * spacingStepX
				const z = POWER_LINES_START_Z + index * spacingStepZ
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
