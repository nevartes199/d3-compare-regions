const MAP_DATA = require('data/map.json')

import * as topo from 'topojson-client'

export class Data {
	constructor() {
	}
	
	getShapes(type: LayerType, context?: FeatureData) {
		let data = this.getData(type)
		let featureCollection = topo.feature(MAP_DATA, data) as FeatureCollection
		
		if (context) {
			featureCollection.features = featureCollection.features.filter((f: Feature) => f.properties[context.type] === context.name)
		}
		
		return featureCollection
	}
	
	getBoundaries(type: LayerType, context?: FeatureData) {
		// TODO: parementer for mesh filter: both, inner and outer
		let data = this.getData(type)
		
		if (context) {
			data = {
				geometries: data.geometries.filter(g => {
					let p = g.properties as FeatureData
					return p[context.type] === context.name
				}),
				type: data.type
			}
		}
		
		return topo.mesh(MAP_DATA, data, (a, b) => a !== b)
	}
	
	private getData(type: LayerType) {
		if (!MAP_DATA.objects[type]) {
			throw `Unknown layer type ${type}`
		}
		
		return MAP_DATA.objects[type]
	}
}
