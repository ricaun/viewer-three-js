# viewer.three.js

Simple viewer with [three.js](https://github.com/mrdoob/three.js) using release version [r147](https://github.com/mrdoob/three.js/releases/tag/r147).

Here is an [Online Preview](https://ricaun.github.io/viewer-three-js/#cube=1) with cube.

## Settings

Settings is used to add setting configuration using the url with special # and &.

Like: `https://ricaun.github.io/viewer-three-js/#cube=1&camera=perspective` [Preview](https://ricaun.github.io/viewer-three-js/#cube=1&camera=perspective)

### cube

`cube` allow to create random cube in the main viewer.
* `cube=0` create one cube with color. [Preview](https://ricaun.github.io/viewer-three-js/#cube=0)
* `cube=1` create one cube. [Preview](https://ricaun.github.io/viewer-three-js/#cube=1)
* `cube=2` create two cubes. [Preview](https://ricaun.github.io/viewer-three-js/#cube=2)
* `cube=$` create any cubes. [Preview](https://ricaun.github.io/viewer-three-js/#cube=5)

### position

`position` allow change the camera position in the main viewer.

* `position=0,0,100` change camera position to z down. [Preview](https://ricaun.github.io/viewer-three-js/#cube=1&position=0,0,100)
* `position=100,-100,100` change camera position look (x,-y,z). (default position)

### rotate

`rotate` allow to disable the camera rotation in the main viewer. 

* `rotate=false` disable camera rotation control. [Preview](https://ricaun.github.io/viewer-three-js/#cube=1&rotate=false)

### edges

`edges` allow to change the edges in the models.

* `edges=false` disable edges in the models viewer. [Preview](https://ricaun.github.io/viewer-three-js/#cube=1&edges=false)

### camera

`camera` allow o change to `perspective` or `orthographic` camera.

* `camera=perspective` change camera to perspective. [Preview](https://ricaun.github.io/viewer-three-js/#cube=1&camera=perspective)
* `camera=orthographic` change camera to orthographic. (default camera)

### light

`light` allow to enable light in `directional`.

* `light=directional` enable directional light. [Preview](https://ricaun.github.io/viewer-three-js/#cube=0&light=directional)

### color

`color` allow to change background color.

* `color=eeeeee` change background to color `eeeeee`. [Preview](https://ricaun.github.io/viewer-three-js/#cube=1&color=eeeeee)
* `color=222` change background to color `222`. (default color)

### model

`model` allow to create a model in the main viewer.

The `model` pattern is similar like [OFF (file format)](https://en.wikipedia.org/wiki/OFF_(file_format)).

* `model={"vertices":[...],"faces"=[[...]]}`

#### model example

This is a cube with different color faces: 

* [Preview Json](https://ricaun.github.io/viewer-three-js/#model={%20%22vertices%22:%20[-1,%20-1,%20-1,%201,%20-1,%20-1,%201,%201,%20-1,%20-1,%201,%20-1,%20-1,%20-1,%201,%201,%20-1,%201,%201,%201,%201,%20-1,%201,%201],%20%22faces%22:%20[[0,%202,%201,%202,%200,%203,%20%22#ff0000%22],%20[4,%205,%206,%204,%206,%207,%20%22#00ff00%22],%20[0,%201,%205,%200,%205,%204,%20%22#ff00ff%22],%20[1,%202,%206,%201,%206,%205,%20%22#00ffff%22],%20[2,%203,%207,%202,%207,%206,%20%22#ff8800%22],%20[3,%200,%204,%203,%204,%207,%20%22#8800ff%22]]%20})

* [Preview Base64](https://ricaun.github.io/viewer-three-js/index.html#model=eyAidmVydGljZXMiOiBbLTEsIC0xLCAtMSwgMSwgLTEsIC0xLCAxLCAxLCAtMSwgLTEsIDEsIC0xLCAtMSwgLTEsIDEsIDEsIC0xLCAxLCAxLCAxLCAxLCAtMSwgMSwgMV0sICJmYWNlcyI6IFtbMCwgMiwgMSwgMiwgMCwgMywgIiNmZjAwMDAiXSwgWzQsIDUsIDYsIDQsIDYsIDcsICIjMDBmZjAwIl0sIFswLCAxLCA1LCAwLCA1LCA0LCAiI2ZmMDBmZiJdLCBbMSwgMiwgNiwgMSwgNiwgNSwgIiMwMGZmZmYiXSwgWzIsIDMsIDcsIDIsIDcsIDYsICIjZmY4ODAwIl0sIFszLCAwLCA0LCAzLCA0LCA3LCAiIzg4MDBmZiJdXSB9)

```
model={ "vertices": [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1], "faces": [[0, 2, 1, 2, 0, 3, "#ff0000"], [4, 5, 6, 4, 6, 7, "#00ff00"], [0, 1, 5, 0, 5, 4, "#ff00ff"], [1, 2, 6, 1, 6, 5, "#00ffff"], [2, 3, 7, 2, 7, 6, "#ff8800"], [3, 0, 4, 3, 4, 7, "#8800ff"]] }
```

--- 

## Reference

This project is based in the [dotbim.three.js](https://github.com/ricaun/dotbim.three.js)

## License

This package is [licensed](LICENSE) under the [MIT License](https://en.wikipedia.org/wiki/MIT_License).

---

Do you like this package? Please [star this project on GitHub](../../stargazers)!
