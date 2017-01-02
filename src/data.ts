import * as topo from 'topojson-client'
import * as d3 from 'd3'

const MAP_DATA = require('data/map.json')

export class Data {
	colorScale: d3.ScaleLinear<string, string>
	
	constructor() {
		this.colorScale = d3.scaleLinear<string>()
			.domain([0, 0.5, 1])
			.range(['firebrick', 'dodgerblue', 'dodgerblue'])
	}
	
	getFeatures(type: LayerType, context?: ItemData) {
		let data = this.getData(type)
		let featureCollection = topo.feature(MAP_DATA, data) as FeatureCollection
		
		if (context) {
			featureCollection.features = featureCollection.features.filter((f: Feature) => f.properties[context.type] === context.name)
		}
		
		return featureCollection
	}
	
	getMesh(type: LayerType, context?: ItemData) {
		let data = this.getData(type)
		
		if (context) {
			data = {
				geometries: data.geometries.filter(g => {
					let p = g.properties as ItemData
					return p[context.type] === context.name
				}),
				type: data.type
			}
		}
		
		return topo.mesh(MAP_DATA, data, (a, b) => a !== b)
	}
	
	/**
	 * Placeholder for fetching the color of each shape on the heat map
	 * @param feature
	 * @returns {string} heatmap color for the given feature
	 */
	getColor = (feature: Feature) => {
		if (!feature.properties.color) {
			// Random between 0 and 10
			let heatFactor = Math.floor(Math.random() * 10)
			feature.properties.color = this.colorScale(heatFactor / 10)
		}
		
		return feature.properties.color
	}
	
	/**
	 * Placeholder for fetching the selection details data
	 * @param feature
	 * @param callback Callback for when the data has been loaded
	 */
	fetchDetails = (feature: Feature, callback: (data: ItemDetails) => void) => {
		let details: ItemDetails = {
			sample: [
				{ name: 'A', value: Math.random() * 100 },
				{ name: 'B', value: Math.random() * 100 },
				{ name: 'C', value: Math.random() * 100 },
				{ name: 'D', value: Math.random() * 100 },
			]
		}
		
		console.log(details)
		
		// Delay the callback return to feel like a network request is being made
		setTimeout(() => {
			callback(details)
		}, Math.random() * 1500)
	}
	
	private getData(type: LayerType) {
		if (!MAP_DATA.objects[type]) {
			throw `Unknown layer type ${type}`
		}
		
		return MAP_DATA.objects[type]
	}
}
