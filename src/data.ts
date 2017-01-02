import * as topo from 'topojson-client'
import * as d3 from 'd3'

const MAP_DATA = require('data/map.json')

export class Data {
	colorScale: d3.ScaleLinear<string, string>
	
	constructor() {
		this.colorScale = d3.scaleLinear<string>()
			.domain([0, 0.5, 1])
			.range(['crimson', 'gray', 'gray'])
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
	
	/**
	 * Placeholder for fetching the color of each shape
	 */
	getColor = (feature: Feature) => {
		if (!feature.properties.color) {
			// Random between 0 and 10
			let heatFactor = Math.floor(Math.random() * 10)
			feature.properties.color = this.colorScale(heatFactor / 10)
		}
		
		return feature.properties.color
	}
	
	private getData(type: LayerType) {
		if (!MAP_DATA.objects[type]) {
			throw `Unknown layer type ${type}`
		}
		
		return MAP_DATA.objects[type]
	}
}
