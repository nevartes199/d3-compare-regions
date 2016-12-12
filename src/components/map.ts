import * as d3 from 'd3'

import { ComponentBase } from 'components'

const EQR_WIDTH = 640
const LNG_OFFSET = -11
const PRECISION = .05

export class Map extends ComponentBase {
	wrapper = { type: 'svg', id: 'map' }
	
	projection: d3.GeoProjection
	path: d3.GeoPath<any, d3.GeoPermissibleObjects>
	
	onInit() {
		this.initGeo()
		
		let ocean = this.root
			.append('rect')
			.classed('ocean', true)
			.on('click', () => {
				console.log('clicked outside')
			})
		
		let regionsData = this.data.getFeatures('regions')
		let regions = this.root
			.append('g')
			.classed('regions', true)
			.selectAll('.region')
			.data(regionsData)
			.enter()
			.append('g')
			.classed('region', true)
			.attr('data-region', d => d['properties']['region'])
			.append('path')
		
		this.addResizer((rect) => {
			ocean
				.attr('width', rect.width)
				.attr('height', rect.height)
			
			regions
				.attr('d', this.path)
		})
	}
	
	initGeo() {
		this.projection = d3.geoEquirectangular()
			.rotate([LNG_OFFSET, 0])
			.precision(PRECISION)
		
		this.path = d3.geoPath()
			.projection(this.projection)
		
		this.addResizer((rect) => {
			this.projection
				.scale((rect.width / EQR_WIDTH) * 100)
				.translate([rect.width / 2, rect.height / 2]);
		})
	}
}
