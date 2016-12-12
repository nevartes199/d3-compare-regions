const MAP_DATA = require('data/map.json')

import * as topo from 'topojson-client'

export type LayerType = 'regions' | 'countries' | 'states'

export class Data {
	construct() {
		console.info('Map data loaded!', MAP_DATA)
	}
	
	getShapes(type: LayerType, filter?: (feature: Object) => boolean) {
		let features = this.getFeatures(type, filter)
		return features
	}
	
	getBoundaries(type: LayerType, filter?: (feature: Object) => boolean) {
		let features = this.getFeatures(type, filter)
	}
	
	getFeatures(type: LayerType, filter?: (feature: Object) => boolean) {
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
		
		let geoFeature = topo.feature(MAP_DATA, target)
		
		if (!geoFeature.features) {
			console.error('No features found', geoFeature)
		}
		
		return geoFeature.features
	}
}
