const MAP_DATA = require('data/map.json')

import * as topo from 'topojson-client'

export class Data {
	construct() {
		console.info('Map data loaded!', MAP_DATA)
	}
	
	getShapes(type: LayerType, filter?: (properties: Object) => boolean) {
		return this.getFeatures(type, filter)
	}
	
	getBoundaries(type: LayerType, filter?: (properties: Object) => boolean) {
		return this.getFeatures(type, filter)
	}
	
	getMapTransforms() {
		return MAP_DATA.bbox // transform as MapTransform
	}
	
	getFeatures(type: LayerType, filter?: (properties: Object) => boolean) {
		let target: any[]
		switch (type) {
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
			features = features.filter(f => filter(f['properties']))
		}
		
		return features
	}
}
