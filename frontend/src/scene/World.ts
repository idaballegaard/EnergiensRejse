import * as THREE from 'three'
import WindTurbine from './components/energy/WindTurbine'
import Landscape from './components/environment/Landscape'
import Sky from './components/environment/Sky'
import ElectricalTransformer from './components/energy/ElectricalTransformer'
import PowerLines from './components/energy/PowerLines'
import TransformerStation from './components/energy/TransformerStation'
import House1 from './components/buildings/House1'
import House2 from './components/buildings/House2'
import House3 from './components/buildings/House3'
import House4 from './components/buildings/House4'
import House5 from './components/buildings/House5'
import LocalPowerLines from './components/energy/LocalPowerLines'
import Roads from './components/environment/roads'
import OakTrees from './components/environment/OakTrees'
import Rocks from './components/environment/Rocks'
import GroundDetails from './components/environment/GroundDetails'
import MustangCar from './components/vehicles/MustangCar'
import GreenCar from './components/vehicles/GreenCar'
import Truck from './components/vehicles/Truck'

export default class World {
  turbine: WindTurbine
  sky: Sky
  transformer: ElectricalTransformer
  powerLines: PowerLines
  transformerStation: TransformerStation
  house1: House1
  house2: House2
  house3: House3
  house4: House4
  house5: House5
  localPowerLines: LocalPowerLines
  roads: Roads
  oakTrees: OakTrees
  rocks: Rocks
  groundDetails: GroundDetails
  mustangCar: MustangCar
  mustangCar2: MustangCar
  greenCar: GreenCar
  greenCar2: GreenCar
  truck: Truck
  truck2: Truck

  constructor(scene: THREE.Scene) {
    new Landscape(scene)
    this.sky = new Sky(scene)
    this.turbine = new WindTurbine(scene)
    this.transformer = new ElectricalTransformer(scene)
    this.powerLines = new PowerLines(scene)
    this.transformerStation = new TransformerStation(scene)
    this.house1 = new House1(scene)
    this.house2 = new House2(scene)
    this.house3 = new House3(scene)
    this.house4 = new House4(scene)
    this.house5 = new House5(scene)
    this.localPowerLines = new LocalPowerLines(scene)
    this.roads = new Roads(scene)
    this.oakTrees = new OakTrees(scene)
    this.rocks = new Rocks(scene)
    this.groundDetails = new GroundDetails(scene)
    this.mustangCar = new MustangCar(scene, 0.0)
    this.mustangCar2 = new MustangCar(scene, 0.5)
    this.greenCar = new GreenCar(scene, 0.72)
    this.greenCar2 = new GreenCar(scene, 0.12)
    this.truck = new Truck(scene, 0.32)
    this.truck2 = new Truck(scene, 0.88)
  }

  update(camera: THREE.Camera) {
    this.sky.update(camera)
    this.turbine.update()
    this.mustangCar.update()
    this.mustangCar2.update()
    this.greenCar.update()
    this.greenCar2.update()
    this.truck.update()
    this.truck2.update()
  }
}