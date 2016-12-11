To parse the map data, make sure you have [Node.js v6.x](https://nodejs.org/en/) installed and install mapshaper command line tool with:
```
npm install --global mapshaper
```

In your terminal go to this `data` folder and run the command './parse'. A file named `map.json` should be generated.

You can edit the [`parse`](./parse) file to select which countries should have a state/province layer, Use the [country's Alpha-3 code](https://en.wikipedia.org/wiki/ISO_3166-1#Current_codes) fot that like this:
```
#!/usr/bin/env bash

PROVINCES_FOR='["USA", "JPN", "GBR", "CHN"]'
...
```

A lot of other options can be changed in the mapshaper script and you can find more info about [here](https://github.com/mbloch/mapshaper/wiki/Command-Reference).

To visualize the generated map and its layers, goto http://mapshaper.org/ and import the `map.json`. Use the "i" button to select each shape and the top center dropdown to select each layer.