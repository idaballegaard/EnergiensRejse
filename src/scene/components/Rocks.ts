import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const ROCK_INSTANCES: [number, number, number, number][] = [
	[50, 50, 0.4, 0.01],
	[48.6, 49.4, 1.1, 0.009],
	[51.5, 49.1, -0.7, 0.0105],
	[49.2, 51.3, 2.0, 0.0115],
	[52.1, 51.6, -1.8, 0.0088],
	[47.8, 50.9, 0.2, 0.0097],
	[50.8, 52.2, 2.6, 0.011],
	[48.9, 48.1, -2.3, 0.0085],
]

export default class Rocks {
	group: THREE.Group

	constructor(scene: THREE.Scene) {
		this.group = new THREE.Group()
		scene.add(this.group)

		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/low_polygon_stylized_rock_free.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			for (const [x, z, yRotation, scale] of ROCK_INSTANCES) {
				const rock = gltf.scene.clone(true)
				rock.scale.setScalar(scale)

				const groundY = Landscape.getHeight(x, z)
				rock.position.set(x, groundY, z)
				rock.rotation.y = yRotation

				rock.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true
						child.receiveShadow = true
					}
				})

				const bounds = new THREE.Box3().setFromObject(rock)
				rock.position.y += groundY - bounds.min.y

				this.group.add(rock)
			}
		})
	}
}