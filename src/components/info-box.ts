import { ComponentBase, D3Selection, D3DataSelection } from 'components'

export type InfoBoxState = 'legend' | 'sidebar' | 'pinned'

const FADE_DURATION = 300

export class InfoBox extends ComponentBase {
	wrapper = {
		type: 'div',
		classes: ['info-box']
	}
	
	state: InfoBoxState = 'legend'
	
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
	
	expand() {
		this.state = 'sidebar'
		this.root.classed('expanded', true)
		setTimeout(this.initDetails, FADE_DURATION * 2)
	}
	
	remove() {
		this.fadeOut()
	}
	
	private initDetails = () => {
		this.title
			.append('div')
			.classed('subtitle', true)
			.text(d => d.properties.type)
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
}
