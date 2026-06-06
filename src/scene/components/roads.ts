import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

const ROAD_SCALE = 0.2

// [x, z, yRotation] for each straight road segment.
const ROAD_SEGMENTS: [number, number, number][] = [
  // straights roads in the city - 2.35 units apart in the x direction
  [34.9, -32.8, 0],
  [32.55, -32.8, 0],
  [30.2, -32.8, 0],
  [27.85, -32.8, 0],
  [25.5, -32.8, 0],
  [23.15, -32.8, 0],
  [20.8, -32.8, 0],
  [18.45, -32.8, 0],

  // vertical roads in the city - 2.4 units apart in the z direction
   [18.5, -25.7, Math.PI / 2],
   [18.5, -23.3, Math.PI / 2],
   [18.5, -20.9, Math.PI / 2],
   [18.5, -18.5, Math.PI / 2],
   [18.5, -16.1, Math.PI / 2],
   [18.5, -13.7, Math.PI / 2],
   [18.5, -11.3, Math.PI / 2],

  // straight roads in the city along the powerlines - 2.35 units apart in the x direction
  [18.5, -13.7, 0],
  [20.85, -13.7, 0],
  [23.2, -13.7, 0],
  [25.55, -13.7, 0],
  [27.9, -13.7, 0],
  [30.25, -13.7, 0],
  [32.6, -13.7, 0],
  [34.95, -13.7, 0],


  // vertical segments along the city - 2.4 units apart in the z direction
  [39.71, -40, Math.PI / 2],
  [39.71, -37.6, Math.PI / 2],
  [39.71, -35.2, Math.PI / 2],
  [39.71, -32.8, Math.PI / 2],
  [39.71, -30.4, Math.PI / 2],
  // Round about
  [39.71, -25.65, Math.PI / 2],
  [39.71, -23.25, Math.PI / 2],
  [39.71, -20.85, Math.PI / 2],
  [39.71, -18.45, Math.PI / 2],
  [39.71, -16.05, Math.PI / 2],
  [39.71, -13.65, Math.PI / 2],
  [39.71, -11.25, Math.PI / 2],
  // Round about
  [39.71, -6.6, Math.PI / 2],
  [39.71, -4.2, Math.PI / 2],
  [39.71, -1.8, Math.PI / 2],
  [39.71, 0.6, Math.PI / 2],
  [39.71, 3, Math.PI / 2],
  [39.71, 5.4, Math.PI / 2],
  [39.71, 7.8, Math.PI / 2],
  [39.71, 10.2, Math.PI / 2],
  [39.71, 12.6, Math.PI / 2],
  [39.71, 15, Math.PI / 2],
  [39.71, 17.4, Math.PI / 2],
  [39.71, 19.8, Math.PI / 2],
  [39.71, 22.2, Math.PI / 2],
  [39.71, 24.6, Math.PI / 2],
  [39.71, 27, Math.PI / 2],
  [39.71, 29.4, Math.PI / 2],
  [39.71, 31.8, Math.PI / 2],
  [39.71, 34.2, Math.PI / 2],
  [39.71, 34.6, Math.PI / 2],

  // straight segments along the bottom of the windmills - 2.35 units apart in the x direction
  [-49.6, -47, 0],
  [-47.25, -47, 0],
  [-44.9, -47, 0],
  [-42.55, -47, 0],
  [-40.2, -47, 0],
  [-37.85, -47, 0],
  [-35.5, -47, 0],
  [-33.15, -47, 0],
  [-30.8, -47, 0],
  [-28.45, -47, 0],
  [-26.1, -47, 0],
  [-23.75, -47, 0],
  [-21.4, -47, 0],
  [-19.05, -47, 0],
  [-16.7, -47, 0],
  [-14.35, -47, 0],
  [-11.99, -47, 0],
  [-9.64, -47, 0],
  [-7.29, -47, 0],
  [-4.94, -47, 0],
  [-2.59, -47, 0],
  [-0.24, -47, 0],
  [2.11, -47, 0],
  [4.46, -47, 0],
  [6.81, -47, 0],
  [9.16, -47, 0],
  [11.51, -47, 0],
  [13.86, -47, 0],
  [16.21, -47, 0],
  [18.56, -47, 0],
  [20.91, -47, 0],
  [23.26, -47, 0],
  [25.61, -47, 0],
  [27.96, -47, 0],
  [30.31, -47, 0],
  [32.66, -47, 0],
  [35.01, -47, 0],

  // vertical segments along the left side of the windmills - 2.4 units apart in the z direction
  [-49.5, -11.2, Math.PI / 2],
  [-49.5, -13.6, Math.PI / 2],
  [-49.5, -16, Math.PI / 2],
  [-49.5, -18.4, Math.PI / 2],
  [-49.5, -20.8, Math.PI / 2],
  [-49.5, -23.2, Math.PI / 2],
  [-49.5, -25.6, Math.PI / 2],
  [-49.5, -28, Math.PI / 2],
  [-49.5, -30.4, Math.PI / 2],
  [-49.5, -32.8, Math.PI / 2],
  [-49.5, -35.2, Math.PI / 2],
  [-49.5, -37.6, Math.PI / 2],
  [-49.5, -40, Math.PI / 2],

  // straight segments along the windmills - 2.35 units apart in the x direction
  [-30.8, -13.655, 0],
  [-33.1, -13.655, 0],
  [-35.45, -13.655, 0],
  [-37.8, -13.655, 0],
  [-40.15, -13.655, 0],
  [-42.5, -13.655, 0],
  [-44.85, -13.655, 0],
  [-47.2, -13.655, 0],
  [-49.55, -13.655, 0],

  // vertical segments along the powerlines - 2.4 units apart in the z direction
  [-26.09, -6.5, Math.PI / 2],
  [-26.09, -4.1, Math.PI / 2],
  [-26.09, -1.7, Math.PI / 2],
  [-26.09, 0.6, Math.PI / 2],
  [-26.09, 3, Math.PI / 2],
  [-26.09, 5.4, Math.PI / 2],
  [-26.09, 7.8, Math.PI / 2],
  [-26.09, 10.2, Math.PI / 2],
  [-26.09, 12.6, Math.PI / 2],
  [-26.09, 15, Math.PI / 2],
  [-26.09, 17.4, Math.PI / 2],
  [-26.09, 19.8, Math.PI / 2],
  [-26.09, 21.2, Math.PI / 2],
  [-26.09, 23.6, Math.PI / 2],
  [-26.09, 25, Math.PI / 2],


  // straight segments along the powerlines - 2.35 units apart in the x direction
  [-14.35, 22.43, 0],
  [-16.7, 22.43, 0],
  [-19.05, 22.43, 0],
  [-21.4, 22.43, 0],
  [-23.75, 22.43, 0],
  [-26.1, 22.43, 0],


  // vertical segments along the top of the powerlines - 2.4 units apart in the z direction
  [-9.56, 29.6, Math.PI / 2],
  [-9.56, 32, Math.PI / 2],
  [-9.56, 34.4, Math.PI / 2],

  // straight segments along the transformerstation - 2.35 units apart in the x direction
  [-9.56, 32, 0],
	[-7.17, 32, 0],
  [-4.78, 32, 0],
  [-2.39, 32, 0],
  [0, 32, 0],
	[2.39, 32, 0],
	[4.78, 32, 0],
	[7.17, 32, 0],
	[9.56, 32, 0],
  [11.91, 32, 0],
  [14.26, 32, 0],
  [16.61, 32, 0],
  [18.96, 32, 0],
  [21.31, 32, 0],
  [23.66, 32, 0],
  [26.01, 32, 0],
  [28.36, 32, 0],
  [30.71, 32, 0],
  [33.06, 32, 0],
  [35.41, 32, 0],
]

// [x, z, yRotation] for each curved road segment.
const CURVE_ROAD_SEGMENTS: [number, number, number][] = [
  [-9.56, 32, 0],
  [-7.18, 24.81, Math.PI],
  [-26.1, 22.43, 0],
  [-23.705, -11.28, Math.PI],
  [-49.5, -13.65, 0],
  [-47.125, -47, -Math.PI / 2],
  [42.1, -44.62, Math.PI],
  [39.7, 34.4, Math.PI / 2],
  [20.9, -32.8, -Math.PI / 2],
  [18.5, -13.7, 0],
]

// [x, z, yRotation] for each roundabout road segment.
const ROUNDABOUT_ROAD_SEGMENTS: [number, number, number][] = [
  [34.95, -32.8, 0],
  [34.95, -13.7, 0],
]

export default class Roads {
	group: THREE.Group

	constructor(scene: THREE.Scene) {
		this.group = new THREE.Group()
		scene.add(this.group)

		const loader = new GLTFLoader()
		const modelUrl = `${import.meta.env.BASE_URL}models/low_poly_straight_road.glb`
		const curveModelUrl = `${import.meta.env.BASE_URL}models/low_poly_curve_road.glb`
    const roundaboutModelUrl = `${import.meta.env.BASE_URL}models/low_poly_round_about_road.glb`

		loader.load(modelUrl, (gltf: GLTF) => {
			for (const [x, z, yRotation] of ROAD_SEGMENTS) {
				const instance = gltf.scene.clone(true)
				instance.scale.setScalar(ROAD_SCALE)
				instance.rotation.y = yRotation

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

		loader.load(curveModelUrl, (gltf: GLTF) => {
			for (const [x, z, yRotation] of CURVE_ROAD_SEGMENTS) {
				const instance = gltf.scene.clone(true)
				instance.scale.setScalar(ROAD_SCALE)
				instance.rotation.y = yRotation

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

    loader.load(roundaboutModelUrl, (gltf: GLTF) => {
      for (const [x, z, yRotation] of ROUNDABOUT_ROAD_SEGMENTS) {
        const instance = gltf.scene.clone(true)
        instance.scale.setScalar(ROAD_SCALE)
        instance.rotation.y = yRotation

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
