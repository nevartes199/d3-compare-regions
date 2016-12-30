import * as d3 from 'd3'

import 'styles/app.scss'
import { ComponentBase, Map, D3Selection, MapOverlay, InfoBox } from 'components'
import { Data } from './data'

export class App {
	root: D3Selection
	components: ComponentBase[]
	data: Data
	lastRect: ClientRect
	
	map: Map
	info: MapOverlay
	
	constructor(public host: Element) {
		this.data = new Data()
		
		this.root = d3.select(this.host)
		this.root.classed('viz-container', true)
		
		this.map = new Map(this.root)
		this.info = new MapOverlay(this.root)
		
		this.components = [
			this.map,
			this.info
		]
		
		window['app'] = this
	}
	
	init() {
		this.components.forEach(c => c.init())
		this.resize()
	}
	
	resize() {
		this.lastRect = this.host.getBoundingClientRect()
		this.components.forEach(c => c.resize(this.lastRect))
	}
	
	select = (data: Feature, shape: SVGPathElement) => {
		let newSelection = this.map.select(data, shape)
		this.info.showSidebar(newSelection || data)
	}
	
	deselect = () => {
		let newSelection = this.map.deselect()
		if (newSelection) {
			this.info.showSidebar(newSelection)
		} else {
			this.info.removeSidebar()
		}
	}
	
	compare = () => {
		let selection = this.map.selection
		if (!selection || !this.info.canCompare(selection.data)) {
			return
		}
		
		this.info.addToComparison(selection.data, selection.element.node() as SVGPathElement)
		// TODO: global options with animation durations et al
		this.map.cameraAdjustBounds()
		setTimeout(this.map.clearSelection, 300)
	}
	
	removeComparison(box: InfoBox) {
		this.info.removeFromComparison(box)
		this.map.cameraAdjustBounds(true)
	}
}
