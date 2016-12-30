import * as d3 from 'd3'

import 'styles/map-overlay.scss'

import { ComponentBase, D3Selection, InfoBox } from 'components'

export class MapOverlay extends ComponentBase {
	wrapper = {
		type: 'div',
		id: 'map-overlay'
	}
	
	legend: InfoBox
	info: InfoBox
	
	comparison: InfoBox[]
	
	onInit() {
	}
	
	onResize() {
	}
	
	showLegend = (data: Feature) => {
		this.clearLegend()
		this.legend = new InfoBox(this.root, data)
	}
	
	clearLegend = () => {
		if (this.legend) {
			this.legend.remove()
			this.legend = null
		}
	}
	
	showSidebar = (data: Feature) => {
		if (!this.legend || this.legend.data !== data) {
			this.showLegend(data)
		}
		
		if (this.info) {
			this.hideSidebar()
			// TODO Update infobar instead of replacing
		}
		
		this.info = this.legend
		this.info.expand()
		
		this.legend = null
	}
	
	hideSidebar() {
		if (this.info) {
			this.info.remove()
			this.info = null
		}
	}
}
