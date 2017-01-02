import * as d3 from 'd3'

import '../styles/info-thumb.scss'

import { ComponentBase, D3Selection, ROTATION } from 'components'

export class InfoDetails extends ComponentBase {
	wrapper = {
		type: 'div',
		classes: ['details']
	}
	
	constructor(root: D3Selection, public data: Feature) {
		super(root)
		this.init()
	}
	
	onInit() {
	}
}
