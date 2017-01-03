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
	overlay: MapOverlay
	
	constructor(public host: Element) {
		this.data = new Data()
		
		this.root = d3.select(this.host)
		this.root.classed('viz-container', true)
		
		this.map = new Map(this.root)
		this.overlay = new MapOverlay(this.root)
		
		this.components = [
			this.map,
			this.overlay
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
		let selection = this.map.selection
		if (selection && selection.data === data) {
			this.deselect()
		} else {
			this.overlay.showSidebar(data)
			this.map.select(data, d3.select(shape))
		}
	}
	
	deselect = () => {
		let selection = this.map.selection
		if (selection) {
			let parent = selection.layer.parent
			if (parent) {
				this.overlay.showSidebar(parent.data)
				this.map.select(parent.data, parent.shape)
			} else {
				this.overlay.removeSidebar()
				this.map.clearSelection()
			}
		}
	}
	
	compare = () => {
		let selection = this.map.selection
		if (!selection || !this.overlay.canCompare(selection.data)) {
			return
		}
		
		this.overlay.addToComparison(selection.data, selection.shape.node() as SVGPathElement)
		setTimeout(() => {
			this.map.clearSelection()
			this.overlay.removeLegend()
		}, 300)
	}
	
	removeComparison(box: InfoBox) {
		this.overlay.removeFromComparison(box)
		this.map.cameraRefresh()
	}
}
