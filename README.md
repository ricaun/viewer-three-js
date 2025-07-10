# viewer.three.js

This is a simple viewer using three version 147. This version allow to run in a single page application.

## Settings

### position

`position` allow change the camera position in the main viewer.

* `position=0,0,100` change camera position to z down. 
* `position=100,-100,100` change camera position look (x,-y,z). (default position)

### edges

`edges` allow to change the edges in the models.

* `edges=false` disable edges in the models viewer.

### camera

`camera` allow o change to `perspective` or `orthographic` camera.

* `camera=perspective` change camera to perspective.
* `camera=orthographic` change camera to orthographic. (default camera)

### light

`light` allow to enable light in `directional`.

* `light=directional` enable directional light.

### color

`color` allow to change background color.

* `color=eeeeee` change background to color `eeeeee`.
* `color=222` change background to color `222`. (default color)

### model

`model` allow to create a model in the main viewer.

The `model` pattern is similar like [OFF (file format)](https://en.wikipedia.org/wiki/OFF_(file_format)).

* `model={"vertices":[...],"faces"=[[...]]}`

```
model={ "vertices": [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1], "faces": [[0, 2, 1, 2, 0, 3, "#ff0000"], [4, 5, 6, 4, 6, 7, "#00ff00"], [0, 1, 5, 0, 5, 4, "#ff00ff"], [1, 2, 6, 1, 6, 5, "#00ffff"], [2, 3, 7, 2, 7, 6, "#ff8800"], [3, 0, 4, 3, 4, 7, "#8800ff"]] }
```

### cube

`cube` allow to create random cube in the main viewer.
* `cube=0` create one cube with color.
* `cube=1` create one cube.
* `cube=2` create two cubes.
* `cube=$` create any cubes.

--- 

## Reference

This project is based in the [dotbim.three.js](https://github.com/ricaun/dotbim.three.js)

## License

This package is [licensed](LICENSE) under the [MIT License](https://en.wikipedia.org/wiki/MIT_License).

---

Do you like this package? Please [star this project on GitHub](../../stargazers)!

---

Copyright © ricaun 2025
