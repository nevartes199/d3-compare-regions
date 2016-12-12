import * as d3 from 'd3'

import 'styles/viz.scss'
import { ComponentBase, Map } from 'components'
import { Data } from './data'

export class App {
	root: any
	components: ComponentBase[]
	data: Data
	lastRect: ClientRect
	
	constructor(public host: Element) {
		this.data = new Data()
		
		this.root = d3.select(this.host)
		this.root.classed('viz-container', true)
		
		this.components = [
			new Map(this.root)
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
}
