import * as d3 from 'd3'

import 'styles/map-overlay.scss'

import { ComponentBase, D3Selection } from 'components'

const LEGEND_FADE_NAME = 'lfade'
const LEGEND_FADE_DURATION = 300

export class MapOverlay extends ComponentBase {
	static readonly SIDEBAR_WIDTH = 300
	
	wrapper = {
		type: 'div',
		id: 'map-overlay'
	}
	
	legend: D3Selection
	boxTitle: D3Selection
	
	onInit() {
	}
	
	onResize() {
	}
	
	showLegend = (data: Feature) => {
		this.clearLegend()
		
		this.legend = this.root
			.append('div')
			.datum(data)
			.classed('legend', true)
			.text(d => d.properties.name)
			.style('opacity', 0)
			.style('margin-top', '-20px')
			
		this.legend
			.transition(LEGEND_FADE_NAME)
			.duration(LEGEND_FADE_DURATION)
			.style('opacity', 1)
			.style('margin-top', '0px')
	}
	
	clearLegend = () => {
		if (this.legend) {
			this.legend
				.transition(LEGEND_FADE_NAME)
				.duration(LEGEND_FADE_DURATION)
				.style('opacity', 0)
				.style('margin-top', '20px')
				.on('end', function () {
					d3.select(this).remove()
				})
		}
		
		this.legend = null
	}
	
	showSidebar = (data: Feature) => {
		if (!this.legend || this.legend.datum() !== data) {
			this.showLegend(data)
		}
		
		if (this.boxTitle) {
			this.hideSidebar()
		}
		
		this.boxTitle = this.legend
		this.legend = null
		
		this.boxTitle.classed('expanded', true)
	}
	
	hideSidebar() {
		console.log('hiding sidebar')
		if (this.boxTitle) {
			this.boxTitle
				.transition()
				.duration(LEGEND_FADE_DURATION)
				.style('opacity', 0)
				.on('end', function () {
					d3.select(this).remove()
				})
			
			this.boxTitle = null
		}
	}
}
