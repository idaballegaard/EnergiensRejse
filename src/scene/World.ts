import * as THREE from 'three'
import WindTurbine from './components/WindTurbine'
import Landscape from './components/Landscape'
import Sky from './components/Sky'
import ElectricalTransformer from './components/ElectricalTransformer'

export default class World {
  turbine: WindTurbine
  sky: Sky
  transformer: ElectricalTransformer

  constructor(scene: THREE.Scene) {
    new Landscape(scene)
    this.sky = new Sky(scene)
    this.turbine = new WindTurbine(scene)
    this.transformer = new ElectricalTransformer(scene)
  }

  update(camera: THREE.Camera) {
    this.sky.update(camera)
    this.turbine.update()
  }
}