import * as THREE from 'three'

type Cloud = {
	mesh: THREE.Mesh
	speed: number
}

export default class Sky {
	private clouds: Cloud[] = []
	private dome: THREE.Mesh | null = null
	private static readonly CLOUD_X_LIMIT = 170
	private static readonly CLOUD_COUNT = 16
	private static readonly SKY_DOME_RADIUS = 180
	private static readonly SKY_DOME_Y_OFFSET = 0
	private static readonly CLOUD_BASE_Y = 34
	private static readonly CLOUD_Y_VARIATION = 12
	private static readonly FAR_CLOUD_Z_NEGATIVE_MIN = -140
	private static readonly FAR_CLOUD_Z_NEGATIVE_MAX = -65
	private static readonly FAR_CLOUD_Z_POSITIVE_MIN = 60
	private static readonly FAR_CLOUD_Z_POSITIVE_MAX = 140

	constructor(scene: THREE.Scene) {
		this.addSkyDome(scene)
		this.addCloudLayer(scene)
	}

	update(camera: THREE.Camera) {
		if (this.dome) {
			this.dome.position.copy(camera.position)
			this.dome.position.y += Sky.SKY_DOME_Y_OFFSET
		}

		for (const cloud of this.clouds) {
			cloud.mesh.position.x += cloud.speed
			cloud.mesh.lookAt(camera.position)

			if (cloud.mesh.position.x > Sky.CLOUD_X_LIMIT) {
				cloud.mesh.position.x = -Sky.CLOUD_X_LIMIT
			}
		}
	}

	private addSkyDome(scene: THREE.Scene) {
		const geometry = new THREE.SphereGeometry(Sky.SKY_DOME_RADIUS, 48, 24)
		const material = new THREE.ShaderMaterial({
			side: THREE.BackSide,
			depthWrite: false,
			uniforms: {
				topColor: { value: new THREE.Color('#6fbdf5') },
				horizonColor: { value: new THREE.Color('#bfe8ff') },
				bottomColor: { value: new THREE.Color('#e6f6ff') },
			},
			vertexShader: `
				varying vec3 vWorldPosition;

				void main() {
					vec4 worldPosition = modelMatrix * vec4(position, 1.0);
					vWorldPosition = worldPosition.xyz;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform vec3 topColor;
				uniform vec3 horizonColor;
				uniform vec3 bottomColor;
				varying vec3 vWorldPosition;

				void main() {
					float h = normalize(vWorldPosition).y * 0.5 + 0.5;
					vec3 sky = mix(bottomColor, horizonColor, smoothstep(0.0, 0.45, h));
					sky = mix(sky, topColor, smoothstep(0.45, 1.0, h));
					gl_FragColor = vec4(sky, 1.0);
				}
			`,
		})

		this.dome = new THREE.Mesh(geometry, material)
		this.dome.position.y = Sky.SKY_DOME_Y_OFFSET
		scene.add(this.dome)
	}

	private addCloudLayer(scene: THREE.Scene) {
		const texture = this.createCloudTexture()
		const cloudCount = Sky.CLOUD_COUNT

		for (let index = 0; index < cloudCount; index += 1) {
			const size = 14 + Math.random() * 9
			const material = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				opacity: 0.52,
				depthWrite: false,
			})
			const geometry = new THREE.PlaneGeometry(size * 2.4, size)
			const mesh = new THREE.Mesh(geometry, material)
			const useNegativeBand = index % 2 === 0
			const z = useNegativeBand
				? Sky.FAR_CLOUD_Z_NEGATIVE_MIN + Math.random() * (Sky.FAR_CLOUD_Z_NEGATIVE_MAX - Sky.FAR_CLOUD_Z_NEGATIVE_MIN)
				: Sky.FAR_CLOUD_Z_POSITIVE_MIN + Math.random() * (Sky.FAR_CLOUD_Z_POSITIVE_MAX - Sky.FAR_CLOUD_Z_POSITIVE_MIN)

			mesh.position.set(
				-Sky.CLOUD_X_LIMIT + (index / cloudCount) * (Sky.CLOUD_X_LIMIT * 2),
				Sky.CLOUD_BASE_Y + Math.random() * Sky.CLOUD_Y_VARIATION,
				z
			)
			mesh.rotation.y = Math.PI

			this.clouds.push({
				mesh,
				speed: 0.01 + Math.random() * 0.015,
			})

			scene.add(mesh)
		}
	}

	private createCloudTexture() {
		const canvas = document.createElement('canvas')
		canvas.width = 512
		canvas.height = 256

		const context = canvas.getContext('2d')

		if (!context) {
			return new THREE.CanvasTexture(canvas)
		}

		context.clearRect(0, 0, canvas.width, canvas.height)

		const blobs = [
			{ x: 150, y: 150, r: 75 },
			{ x: 220, y: 120, r: 85 },
			{ x: 300, y: 145, r: 70 },
			{ x: 370, y: 140, r: 60 },
			{ x: 250, y: 170, r: 65 },
		]

		for (const blob of blobs) {
			const gradient = context.createRadialGradient(
				blob.x,
				blob.y,
				blob.r * 0.2,
				blob.x,
				blob.y,
				blob.r
			)
			gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
			gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

			context.fillStyle = gradient
			context.beginPath()
			context.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2)
			context.fill()
		}

		const texture = new THREE.CanvasTexture(canvas)
		texture.needsUpdate = true
		texture.minFilter = THREE.LinearFilter
		texture.magFilter = THREE.LinearFilter

		return texture
	}
}
