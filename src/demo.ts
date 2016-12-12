import 'styles/demo.scss'

import { App } from './app'

let host = document.querySelector('#target')
let app = new App(host)

window.onload = function () {
	app.init()
}

window.onresize = function () {
	app.resize()
}
