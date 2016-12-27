const MAP_DATA = require('data/map.json')

import * as topo from 'topojson-client'

export class Data {
	constructor() {
	}
	
	getShapes(type: LayerType, filter?: (properties: TopoObject) => boolean) {
		return this.getFeatures(type, filter)
	}
	
	getBoundaries(type: LayerType, filter?: (properties: TopoObject) => boolean) {
		let objects = MAP_DATA.objects[type] as Feature[]
		// TODO: parementer for mesh filter: both, inner and outer
		return topo.mesh(MAP_DATA, objects, (a, b) => a !== b)
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
		
		return features
	}
}
