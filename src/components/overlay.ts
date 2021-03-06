import { ComponentBase, InfoBox } from 'components'

const COMPARISON_MAX_ITEMS = 3

export class MapOverlay extends ComponentBase {
	wrapper = {
		type: 'div',
		id: 'map-overlay'
	}
	
	legend: InfoBox = null
	sidebar: InfoBox = null
	
	comparison: InfoBox[] = []
		
	onResize(rect: ClientRect) {
		if (this.sidebar) {
			this.sidebar.resize(rect)
		}
		
		this.comparison.forEach(comparisonBox => comparisonBox.resize(rect))
	}
	
	showLegend = (data: Feature) => {
		this.removeLegend()
		
		if (this.sidebar && this.sidebar.data === data) {
			return
		}
		
		this.legend = new InfoBox(this.root, data)
	}
	
	removeLegend = () => {
		if (this.legend) {
			this.legend.remove()
			this.legend = null
		}
	}
	
	showSidebar = (data: Feature) => {
		if (!this.legend || this.legend.data !== data) {
			this.showLegend(data)
		}
		
		this.removeSidebar()
		this.sidebar = this.legend
		this.sidebar.expand()
		
		this.legend = null
	}
	
	removeSidebar() {
		if (this.sidebar) {
			this.sidebar.remove()
			this.sidebar = null
		}
	}
	
	canCompare(data: Feature) {
		if (this.comparison.length >= COMPARISON_MAX_ITEMS) {
			return false
		}
		
		for (let box of this.comparison) {
			let target = data.properties
			let boxData = box.data.properties
			if (
				target.type === boxData.type &&
				target.name === boxData.name
			) {
				return false
			}
		}
		
		return true
	}
	
	addToComparison(data: Feature, shape: SVGPathElement) {
		if (!this.sidebar || this.sidebar.data !== data) {
			throw 'This shouldn\'t happen'
		}
		
		let box = this.sidebar
		this.sidebar = null
		
		this.comparison.push(box)
		box.pin(shape)
	}
	
	removeFromComparison(box: InfoBox) {
		this.comparison.splice(this.comparison.indexOf(box), 1)
		box.remove()
		
		if (this.sidebar && this.comparison.length === COMPARISON_MAX_ITEMS - 1) {
			this.sidebar.addComparisonButton()
		}
	}
}
