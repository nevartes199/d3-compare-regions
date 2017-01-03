import { ComponentBase, D3Selection, D3DataSelection, LAYER_ORDER, InfoThumb, InfoDetails } from 'components'

import '../styles/info-box.scss'

export type InfoBoxState = 'legend' | 'sidebar' | 'comparison'

const FADE_DURATION = 300

export class InfoBox extends ComponentBase {
	wrapper = {
		type: 'div',
		classes: ['info-box']
	}
	
	state: InfoBoxState = 'legend'
	
	thumb: InfoThumb
	details: InfoDetails
	
	title: D3DataSelection<Feature>
	
	constructor(root: D3Selection, public data: Feature) {
		super(root)
		this.init()
	}
	
	onInit() {
		let root = this.root
			.datum(this.data)
			.style('opacity', 0)
			.style('margin-top', '-20px')
		
		this.title = root
			.append('div')
			.classed('title', true)
			.text(d => d.properties.name)
		
		this.fadeIn()
	}
	
	onResize(rect: ClientRect) {
		if (this.thumb) {
			this.thumb.resize(rect)
		}
		
		if (this.details) {
			this.details.resize(rect)
		}
	}
	
	expand() {
		this.state = 'sidebar'
		this.root.classed('expanded', true)
		setTimeout(this.initDetails, FADE_DURATION)
	}
	
	remove = () => {
		this.fadeOut()
	}
	
	pin(shape: SVGPathElement) {
		this.root.classed('pinned', true)
		
		this.root
			.append('div')
			.classed('close', true)
			.text('×')
			.on('click', () => {
				this.app.removeComparison(this)
			})
		
		this.thumb = new InfoThumb(this.root)
		this.thumb.init()
	}
	
	
	addComparisonButton = () => {
		this.root
			.append('button')
			.classed('compare', true)
			.text('Compare with other region')
			.on('click', this.app.compare)
	}
	
	private initDetails = () => {
		if (this.data.properties.type !== 'region') {
			this.title
				.append('div')
				.classed('subtitle', true)
				.text(this.getSubtitle)
		}
		
		this.details = new InfoDetails(this.root)
		this.details.init()
		
		if (this.app.overlay.canCompare(this.data)) {
			this.addComparisonButton()
		}
	}
	
	private fadeIn() {
		this.root
			.transition()
			.duration(FADE_DURATION)
			.style('opacity', 1)
			.style('margin-top', '0px')
	}
	
	private fadeOut() {
		if (this.state === 'legend') {
			this.root
				.transition()
				.duration(FADE_DURATION)
				.style('opacity', 0)
				.style('margin-top', '32px')
				.on('end', () => this.root.remove())
		} else {
			this.root.remove()
		}
	}
	
	private getSubtitle(data: Feature) {
		let type = data.properties.type
		let idx = LAYER_ORDER.indexOf(type)
		return data.properties[LAYER_ORDER[idx - 1]] || type
	}
}
