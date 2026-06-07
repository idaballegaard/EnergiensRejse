import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Landscape from './Landscape'

type Cluster = [number, number, number, number]
type KeepOutPoint = [number, number, number]
type KeepOutSegment = [number, number, number, number, number]

const DETAIL_SCALE_MULTIPLIER = 0.06
const DETAIL_POINT_CLEARANCE = 0.7
const DETAIL_SEGMENT_CLEARANCE = 0.95

const CLUSTER_OFFSETS: [number, number][] = [
	[0, 0],
	[0.9, 0.6],
	[-0.8, 0.7],
	[1.2, -0.7],
	[-1.1, -0.6],
	[0.2, 1.1],
]

// [x, z, count, baseScale]
const FLOWER_CLUSTERS: Cluster[] = [
	[-42, -18, 5, 0.14],
	[-54, -56, 3, 0.11],
	[-36, -55, 3, 0.11],
	[-14, -56, 3, 0.11],
	[8, -55, 3, 0.1],
	[30, -56, 3, 0.1],
	[50, -55, 3, 0.1],
	[-30, -8, 4, 0.13],
	[-14, -30, 5, 0.13],
	[8, -22, 4, 0.12],
	[24, -10, 4, 0.12],
	[44, -20, 5, 0.13],
	[12, 34, 4, 0.12],
	[-54, -6, 4, 0.12],
	[-44, 2, 4, 0.12],
	[-34, 12, 4, 0.12],
	[-18, 42, 4, 0.12],
	[6, 44, 4, 0.11],
	[28, 46, 4, 0.11],
	[-12, 10, 3, 0.1],
	[-2, 24, 3, 0.1],
	[12, 30, 3, 0.1],
	[-40, 42, 4, 0.11],
	[-2, 52, 3, 0.1],
	[46, 40, 3, 0.1],
	[-56, 24, 3, 0.1],
	[-26, 50, 3, 0.1],
	[12, 54, 3, 0.1],
	[38, 48, 3, 0.1],
]

const GRASS_CLUSTERS: Cluster[] = [
	[-50, -10, 6, 0.18],
	[-56, -56, 5, 0.15],
	[-46, -54, 5, 0.15],
	[-34, -56, 5, 0.15],
	[-22, -54, 5, 0.15],
	[-10, -56, 5, 0.15],
	[2, -54, 5, 0.15],
	[14, -56, 5, 0.14],
	[26, -54, 5, 0.14],
	[38, -56, 5, 0.14],
	[50, -54, 5, 0.14],
	[-36, -24, 5, 0.17],
	[-20, -14, 6, 0.18],
	[-4, -40, 5, 0.17],
	[16, -16, 6, 0.16],
	[30, -30, 5, 0.17],
	[48, -6, 6, 0.16],
	[38, 22, 5, 0.16],
	[-56, -18, 5, 0.16],
	[-52, 0, 5, 0.16],
	[-46, 14, 5, 0.16],
	[-38, 30, 5, 0.16],
	[-28, 44, 5, 0.15],
	[-10, 48, 5, 0.15],
	[-16, 6, 4, 0.15],
	[-10, 16, 4, 0.15],
	[-2, 8, 4, 0.15],
	[6, 4, 4, 0.15],
	[10, 14, 4, 0.15],
	[0, 26, 4, 0.15],
	[14, 26, 4, 0.14],
	[20, 18, 4, 0.14],
	[10, 48, 4, 0.15],
	[24, 42, 4, 0.15],
	[34, 12, 4, 0.15],
	[52, 22, 4, 0.15],
	[-58, 8, 4, 0.14],
	[-44, 46, 4, 0.14],
	[-20, 52, 4, 0.14],
	[0, 56, 4, 0.14],
	[20, 50, 4, 0.14],
	[54, 34, 4, 0.14],
	[-58, 26, 4, 0.14],
	[-50, 40, 4, 0.14],
	[-34, 54, 4, 0.14],
	[-8, 56, 4, 0.14],
	[8, 56, 4, 0.14],
	[28, 54, 4, 0.14],
	[44, 46, 4, 0.14],
	[56, 14, 4, 0.14],
]

const MUSHROOM_CLUSTERS: Cluster[] = [
	[-46, -28, 4, 0.11],
	[-50, -55, 3, 0.09],
	[-26, -56, 3, 0.09],
	[-2, -55, 3, 0.09],
	[22, -56, 3, 0.09],
	[46, -55, 3, 0.09],
	[-24, -34, 3, 0.1],
	[-8, -18, 4, 0.1],
	[6, -32, 3, 0.1],
	[22, -24, 4, 0.1],
	[40, -34, 3, 0.1],
	[52, 10, 4, 0.1],
	[-50, 8, 3, 0.1],
	[-30, 36, 3, 0.1],
	[-6, 46, 3, 0.09],
	[42, 30, 3, 0.09],
	[-16, 54, 3, 0.09],
	[-8, 22, 3, 0.09],
	[18, 26, 3, 0.09],
	[30, 52, 3, 0.09],
	[-54, 34, 3, 0.09],
	[6, 56, 3, 0.09],
	[50, 42, 3, 0.09],
]

const KEEP_OUT_POINTS: KeepOutPoint[] = [
	[-15, -15, 4.2],
	[12, 20, 4.5],
	[-22, -28, 6.2],
	[-22, -35, 6.2],
	[-30, -24, 6.2],
	[-30, -31, 6.2],
	[-30, -38, 6.2],
	[-38, -28, 6.2],
	[-38, -35, 6.2],
	[28, -9.5, 3.4],
	[23.5, -28.5, 3.4],
	[28, -15.5, 3.4],
	[44, -23, 3.4],
	[23, -17, 3.4],
	[33, -9.7, 3.4],
	[38, -20, 3.4],
	[33, -15.7, 3.4],
	[32.5, -34.5, 3.4],
	[23, -9.5, 3.4],
	[38, -9, 3.4],
	[38, -3, 3.4],
	[38, -15, 3.4],
	[44, -28, 3.4],
	[37.5, -34.5, 3.4],
	[16.5, -20.5, 3.4],
	[16.5, -15, 3.4],
	[22, -23, 3.4],
	[33, -29, 3.4],
	[43.5, -17, 3.4],
	[27, -34, 3.4],
	[17, -30, 3.4],
	[37.5, -24.5, 3.4],
	[28, -28, 3.4],
	[38, -28, 3.4],
	[44.5, -12, 3.4],
	[22, -35, 3.4],
	[16, -25, 3.4],
	[50, 50, 0.7],
	[48.6, 49.4, 0.7],
	[51.5, 49.1, 0.7],
	[49.2, 51.3, 0.7],
	[52.1, 51.6, 0.7],
	[47.8, 50.9, 0.7],
	[50.8, 52.2, 0.7],
	[48.9, 48.1, 0.7],
]

const KEEP_OUT_SEGMENTS: KeepOutSegment[] = [
	[18.45, -32.8, 34.9, -32.8, 1.9],
	[18.5, -25.7, 18.5, -11.3, 1.9],
	[18.5, -13.7, 34.95, -13.7, 1.9],
	[39.71, -40, 39.71, 34.6, 1.9],
	[-49.6, -47, 35.01, -47, 1.9],
	[-49.5, -40, -49.5, -11.2, 1.9],
	[-49.55, -13.655, -30.8, -13.655, 1.9],
	[-26.09, -6.5, -26.09, 25, 2.2],
	[-26.1, 22.43, -14.35, 22.43, 1.9],
	[-9.56, 29.6, -9.56, 34.4, 1.9],
	[-9.56, 32, 35.41, 32, 1.9],
	[20, -10, 20, 4.6, 3.4],
	[-12.8, -1.8, -25.5, 23.5, 3.6],
]

function hash2D(x: number, z: number): number {
	const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123
	return s - Math.floor(s)
}

function distance2D(ax: number, az: number, bx: number, bz: number): number {
	return Math.hypot(ax - bx, az - bz)
}

function distanceToSegment2D(
	px: number,
	pz: number,
	x1: number,
	z1: number,
	x2: number,
	z2: number
): number {
	const dx = x2 - x1
	const dz = z2 - z1
	const lenSq = dx * dx + dz * dz
	if (lenSq === 0) {
		return distance2D(px, pz, x1, z1)
	}
	const t = Math.max(0, Math.min(1, ((px - x1) * dx + (pz - z1) * dz) / lenSq))
	const cx = x1 + t * dx
	const cz = z1 + t * dz
	return distance2D(px, pz, cx, cz)
}

export default class GroundDetails {
	group: THREE.Group

	constructor(scene: THREE.Scene) {
		this.group = new THREE.Group()
		scene.add(this.group)

		const loader = new GLTFLoader()
		this.loadClusters(
			loader,
			`${import.meta.env.BASE_URL}models/low_poly_flowers.glb`,
			FLOWER_CLUSTERS
		)
		this.loadClusters(
			loader,
			`${import.meta.env.BASE_URL}models/low_poly_grass_pack.glb`,
			GRASS_CLUSTERS
		)
		this.loadClusters(
			loader,
			`${import.meta.env.BASE_URL}models/low_poly_mushrooms_amanita_muscaria.glb`,
			MUSHROOM_CLUSTERS
		)
	}

	private loadClusters(loader: GLTFLoader, modelUrl: string, clusters: Cluster[]) {
		loader.load(modelUrl, (gltf: GLTF) => {
			for (const [centerX, centerZ, count, baseScale] of clusters) {
				for (let i = 0; i < count; i += 1) {
					const offset = CLUSTER_OFFSETS[i % CLUSTER_OFFSETS.length]
					if (!offset) {
						continue
					}
					const [dx, dz] = offset
					const jitterX = (hash2D(centerX + i, centerZ - i) - 0.5) * 0.7
					const jitterZ = (hash2D(centerZ - i * 2, centerX + i) - 0.5) * 0.7
					const x = centerX + dx + jitterX
					const z = centerZ + dz + jitterZ
					if (!this.isValidDetailPosition(x, z)) {
						continue
					}

					const instance = gltf.scene.clone(true)
					const scaleJitter = 0.9 + hash2D(x * 1.4, z * 1.9) * 0.2
					instance.scale.setScalar(
						baseScale * scaleJitter * DETAIL_SCALE_MULTIPLIER
					)

					const groundY = Landscape.getHeight(x, z)
					instance.position.set(x, groundY, z)
					instance.rotation.y = hash2D(z, x) * Math.PI * 2

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
			}
		})
	}

	private isValidDetailPosition(x: number, z: number): boolean {
		for (const [ox, oz, radius] of KEEP_OUT_POINTS) {
			if (distance2D(x, z, ox, oz) < radius + DETAIL_POINT_CLEARANCE) {
				return false
			}
		}

		for (const [x1, z1, x2, z2, halfWidth] of KEEP_OUT_SEGMENTS) {
			if (
				distanceToSegment2D(x, z, x1, z1, x2, z2) <
				halfWidth + DETAIL_SEGMENT_CLEARANCE
			) {
				return false
			}
		}

		return true
	}
}
