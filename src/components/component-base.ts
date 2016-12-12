import * as d3 from 'd3'
import { App } from '../app'
import { Data } from '../data'

export type D3Selection = d3.Selection<d3.BaseType, any, any, any>
export type Resizer = (rect: ClientRect) => void

export interface ComponentWrapper {
	type?: string
	id?: string
	classes?: string[]
}

export abstract class ComponentBase {
	wrapper: ComponentWrapper
	
	relative = false
	resizers: Resizer[] = []
	rect: ClientRect
	
	get app(): App {
		return window['app'] as App
	}
	
	get data(): Data {
		return this.app.data
	}
	
	constructor(public root: D3Selection) {
	}
	
	abstract onInit()
	onResize(rect: ClientRect) {}
	
	init() {
		this.applyOptions(this.wrapper, {
			'type': (t) => {
				this.root = this.root.append(t)
			},
			'classes': (c) => {
				c.forEach(name => this.root.classed(name,  true))
			},
			'id': (i) => {
				this.root.attr('id', i)
			}
		})
		
		this.onInit()
	}
	
	resize(appRect: ClientRect) {
		let rect = appRect
		
		if (this.relative) {
			let rootEl = this.root.node() as Element
			rect = rootEl.getBoundingClientRect()
		}
		
		this.rect = rect
		this.resizers.forEach(r => r(rect))
		this.onResize(rect)
	}
	
	addResizer(resizer: Resizer, execute = false) {
		this.resizers.push(resizer)
		if (execute) {
			resizer(this.rect)
		}
	}
	
	applyOptions(options, appliers) {
		for (let optionName in appliers) {
			if (optionName in options) {
				appliers[optionName](options[optionName])
			}
		}
	}
}