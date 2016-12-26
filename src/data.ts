declare const WORLD: any
const MAP_DATA = require('data/map.json')

import * as topo from 'topojson-client'

export class Data {
	constructor() {
	}
	
	getShapes(type: LayerType, filter?: (properties: TopoObject) => boolean) {
		return this.getFeatures(type, filter)
	}
	
	getBoundaries(type: LayerType, filter?: (properties: TopoObject) => boolean) {
		return this.getFeatures(type, filter)
	}
	
	getMapTransforms() {
		return MAP_DATA.bbox // transform as MapTransform
	}
	
	getFeatures(type: LayerType, filter?: (properties: TopoObject) => boolean) {
		let target
		switch (type) {
			case 'world':
			case 'regions':
			case 'countries':
			case 'states':
				target = MAP_DATA.objects[type]
				break
			default:
				throw `Unknown layer type ${type}`
		}
		
		let object = topo.feature(MAP_DATA, target)
		let features = object.features
		
		if (!features) {
			console.error('No features found', object)
		}
		
		if (filter) {
			features = features.filter(f => filter(f))
		}
		
		return features as Feature[]
	}
}
