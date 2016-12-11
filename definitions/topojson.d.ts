declare namespace Topojson {
	export interface Base {
		version: string
		feature(json: any, collection: any): {features: Array<any>}
		mesh(topology: any, o: any, filter: Function): {type: any, coordinates: Array<any>}
		meshArcs(topology: any, o: any, filter: Function): {type: any, coordinates: Array<any>}
		object(topology: any, o: any): {type: any, coordinates: Array<any>}
		merge(topology: any, objects?: any[]): {type: any, coordinates: Array<any>}
		mergeArcs(topology: any, objects: Array<any>): {type: string, arcs: Array<any>}
		neighbors(objects: Array<any>): Array<any>
		presimplify(topology: any, triangleArea: any): Array<any>
	}
}

declare module 'topojson' {
	let topojson: Topojson.Base
	export = topojson
}
