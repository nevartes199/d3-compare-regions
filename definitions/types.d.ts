declare type LayerType = 'world' | 'region' | 'country' | 'state'

declare interface TopoObject {
	features: Feature[]
}

declare interface FeatureCollection {
	features: Feature[]
	type: string
}

declare interface Feature {
	geometry?: any
	properties: ItemData
	type?: string
}

declare interface ItemData {
	name: string
	type: LayerType
	has_sublayer: boolean
	color?: string
}

/**
 * TODO: Describe here the data needed for showing the selection details
 */
declare interface ItemDetails {
	sample: {
		name: string
		value: number
	}[]
}
