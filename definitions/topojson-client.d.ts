declare namespace Topojson {
	export interface Base {
		version: string
		feature(topology: any, object: any): any
		mesh(topology: any, object: any, filter?: any): any
		meshArcs(topology: any, object: any, filter?: any): any
		simplify(topology: any, minWeight?: number)
	}
}

declare module 'topojson-client' {
	let topojson: Topojson.Base
	export = topojson
}
