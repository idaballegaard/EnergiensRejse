import * as THREE from 'three'
import WindTurbine from './components/WindTurbine'

export default class World {
  turbine: WindTurbine

  constructor(scene: THREE.Scene) {
    this.turbine = new WindTurbine(scene)
  }

  update() {
    this.turbine.update()
  }
}