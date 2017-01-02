import * as d3 from 'd3'

import '../styles/info-details.scss'

import { ComponentBase, D3Selection } from 'components'

export class InfoDetails extends ComponentBase {
	wrapper = {
		type: 'div',
		classes: ['details']
	}
	
	onInit() {
		this.root.html('Loading...')
		let data = this.host.datum() as any as Feature
		this.app.data.fetchDetails(data, this.onDataLoaded)
	}
	
	onDataLoaded = (data: ItemDetails) => {
		let scale = d3.scaleLinear()
			.domain([0, d3.max(data.sample, d => d.value)])
			.range([0, 100])
		
		this.root.html('Sample Chart')
		
		let bars = this.root.selectAll('.bar')
			.data(data.sample)
			.enter()
			.append('div')
			.classed('bar', true)
			.style('width', '0%')
		
		bars.transition()
			.duration(600)
			.ease(d3.easeExpOut)
			.style('width', d => scale(d.value) + '%')
	}
}
