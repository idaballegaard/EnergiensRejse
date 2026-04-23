import * as THREE from 'three'
import WindTurbine from './components/WindTurbine'
import Landscape from './components/Landscape'
import Sky from './components/Sky'

export default class World {
  turbine: WindTurbine
  sky: Sky

  constructor(scene: THREE.Scene) {
    new Landscape(scene)
    this.sky = new Sky(scene)
    this.turbine = new WindTurbine(scene)
  }

  update(camera: THREE.Camera) {
    this.sky.update(camera)
    this.turbine.update()
  }
}