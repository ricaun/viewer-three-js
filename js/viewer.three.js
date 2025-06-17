class Viewer {
  static ViewerControl = undefined;
  static Init() {
    Viewer.ViewerControl = new ViewerControl();
  }
  static Clear() {
    if (Viewer.ViewerControl) {
      Viewer.ViewerControl.ClearModels();
    } else {
      console.error("ViewerControl is not initialized.");
    }
  }
  static Cube() {
    if (Viewer.ViewerControl) {
      Viewer.ViewerControl.CreateCube();
    } else {
      console.error("ViewerControl is not initialized.");
    }
  }
  static Model(data) {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("Error parsing model JSON:", e);
        return;
      }
    }
    if (Viewer.ViewerControl) {
      Viewer.ViewerControl.CreateMesh(data);
    } else {
      console.error("ViewerControl is not initialized.");
    }
  }
}

class ViewerControl {
  models = [];
  settings = {};

  enableEdges = true;

  controls = undefined;
  camera = undefined;
  scene = undefined;
  renderer = undefined;
  light = undefined;

  constructor() {
    this.settings = this.GetSettingHash();
    console.log("Viewer settings:", this.settings);

    THREE.Object3D.DefaultUp.set(0, 0, 1);
    if (this.settings.up) {
      var up = this.settings.up;
      if (Array.isArray(up) && up.length === 3) {
        THREE.Object3D.DefaultUp.set(up[0], up[1], up[2]);
      }
    }

    this.camera = this.CreateCamera();
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    // Configure renderer clear color
    this.SetColor(this.settings.color);

    // PixelRatio
    if (window.devicePixelRatio) {
      this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    // Configure renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', () => { this.Render(); });
    this.controls.update();

    this.SetRotateControls(this.settings.rotate);

    // Handle double-click to zoom fit
    this.renderer.domElement.addEventListener('dblclick', (event) => {
      this.Render(true);
      event.preventDefault();
    });

    this.SetPosition(this.settings.position);
    this.SetEdges(this.settings.edges);

    this.CreateLight();

    var cube = this.settings.cube;
    if (cube) {
      for (let i = 0; i < cube; i++) {
        this.CreateCube();
      }
    }

    if (this.settings.model) {
      this.CreateMesh(this.settings.model)
    }

    this.Render();
  }

  CreateMesh(data) {
    try {
      var { vertices, faces, position, rotation, quaternion, scale } = data;
      var model = new Model3d();
      model.AddVertices(vertices);
      model.AddFaces(faces);
      var mesh = model.CreateMesh();
      if (rotation && Array.isArray(rotation) && rotation.length === 3) {
        mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
      }
      if (quaternion && Array.isArray(quaternion) && quaternion.length === 4) {
        mesh.quaternion.set(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
      }
      if (position && Array.isArray(position) && position.length === 3) {
        mesh.position.set(position[0], position[1], position[2]);
      }
      if (scale && Array.isArray(scale) && scale.length === 3) {
        mesh.scale.set(scale[0], scale[1], scale[2]);
      }
      this.AddModel(mesh, true);
    } catch (error) {
      console.error("Error creating mesh from data:", error);
    }
  }

  SetRotateControls(rotate) {
    if (this.controls) {
      if (typeof rotate === 'boolean') {
        this.controls.enableRotate = rotate;
        this.controls.update();
        this.Render();
      }
    } else {
      console.error("Controls are not initialized.");
    }
  }

  SetPosition(position) {
    if (this.camera) {
      if (position && Array.isArray(position) && position.length === 3) {
        var x = position[0];
        var y = position[1];
        var z = position[2];
        this.camera.position.set(x, y, z);
        this.camera.updateProjectionMatrix();
        this.Render();
      }
    } else {
      console.error("Camera is not initialized.");
    }
  }

  SetColor(color) {
    if (typeof color === 'string') {
      color = color.trim().toLowerCase();
      if (!color.startsWith('#')) color = '#' + color;
      color = new THREE.Color(color);
    }
    else {
      color = "#222"; // Default color if not provided
    }
    this.renderer.setClearColor(color);
    this.Render();
  }

  CreateLight() {
    if (this.settings.light === "directional") {
      var light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
      light.position.set(0.5, -1.5, 3);
    } else {
      var light = new THREE.HemisphereLight(0xffffff);
    }
    if (this.light !== undefined) {
      this.scene.remove(this.light);
    }
    this.light = light;
    this.scene.add(this.light);
  }

  CreateCube(color = undefined) {
    var material = new THREE.MeshNormalMaterial();
    if (color !== undefined) {
      material = new THREE.MeshStandardMaterial({
        color: color,
      });
    }

    var cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      material
    );
    cube.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
    this.AddModel(cube);
    this.Render(true);
  }

  GetSettingHash() {
    var settings = {};
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      var parts = hash.substring(1).split('&');
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split('=');
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair.slice(1).join('='));
        if (value.startsWith('{') && value.endsWith('}')) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.error("Error parsing JSON value:", value, e);
            value = {};
          }
        }
        else if (value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.error("Error parsing JSON array value:", value, e);
            value = [];
          }
        }
        else if (value.includes(',')) {
          value = value.split(',').map(v => v.trim());
          // convert to float if possible
          value = value.map(v => {
            var num = parseFloat(v);
            return isNaN(num) ? v : num;
          });
        }
        else if (value === 'true') {
          value = true;
        }
        else if (value === 'false') {
          value = false;
        }
        settings[key] = value;
      }
    }
    return settings;
  }

  CreateCamera() // "perspective" or "orthographic"
  {
    var cameraType = this.settings.camera || "orthographic";
    var aspectRatio = window.innerWidth / window.innerHeight;
    var viewSize = 10;
    var camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);

    if (cameraType === "orthographic") {
      camera = new THREE.OrthographicCamera(
        -aspectRatio * viewSize / 2, aspectRatio * viewSize / 2,
        viewSize / 2, -viewSize / 2,
        0.1, 1000);
    }

    var cameraDistance = 100;
    camera.position.set(cameraDistance, -cameraDistance, cameraDistance);

    // Resize
    window.addEventListener("resize", () => {
      var aspect = window.innerWidth / window.innerHeight;
      if (this.camera.aspect) {
        this.camera.aspect = aspect;
      }

      if (this.camera.left) {
        this.camera.left = -aspect * viewSize / 2;
        this.camera.right = aspect * viewSize / 2;
        this.camera.top = viewSize / 2;
        this.camera.bottom = -viewSize / 2;
      }

      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.Render(true)
    })

    return camera;
  }
  SetEdges(enableEdges) {
    if (typeof enableEdges === 'boolean') {
      this.enableEdges = enableEdges;
    }
  }
  AddModel(model, zoomFit = false) {
    if (!model)
      return;

    this.models.push(model);

    if (this.enableEdges && model.geometry) {
      var edges = new THREE.EdgesGeometry(model.geometry);
      model.edges = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
      model.edges.position.copy(model.position);
      model.edges.rotation.copy(model.rotation);
      model.edges.scale.copy(model.scale);
      model.edges.quaternion.copy(model.quaternion);
      this.scene.add(model.edges);
    }

    this.scene.add(model);
    this.Render(zoomFit);
  }
  RemoveModel(model) {
    const index = this.models.indexOf(model);
    if (index !== -1) {
      this.models.splice(index, 1);
      this.scene.remove(model);
      if (model.edges) {
        this.scene.remove(model.edges);
      }
    } else {
      console.warn("Model not found in the scene.");
    }
  }
  ClearModels() {
    for (const model of this.models) {
      this.scene.remove(model);
      if (model.edges) {
        this.scene.remove(model.edges);
      }
    }
    this.models = [];
    this.Render();
  }
  Render(zoomFit = false) {
    if (zoomFit) {
      this.ZoomFit();
    }

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    } else {
      console.error("Renderer is not initialized.");
    }
  }
  ZoomFit() {
    function zoomCameraToSelection(camera, controls, selection, fitOffset = 1.2) {
      const box = new THREE.Box3();

      for (const object of selection) box.expandByObject(object);

      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const aspect = window.innerWidth / window.innerHeight;

      if (camera.isPerspectiveCamera) {
        const maxSize = Math.max(size.x, size.y, size.z);
        const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
        const fitWidthDistance = fitHeightDistance / camera.aspect;
        const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

        const direction = controls.target.clone()
          .sub(camera.position)
          .normalize()
          .multiplyScalar(distance);

        controls.maxDistance = distance * 10;
        controls.target.copy(center);

        camera.near = distance / 100;
        camera.far = distance * 100;

        camera.updateProjectionMatrix();

        camera.position.copy(controls.target).sub(direction);

        controls.update();
      }
      else if (camera.isOrthographicCamera) {
        var radius = Math.max(size.x, size.y, size.z) * 1.5;
        if (radius === 0) {
          radius = 1; // prevent division by zero
        }

        var viewHeight = camera.top - camera.bottom;
        var viewWidth = camera.right - camera.left;

        if (aspect > 1.0) {
          // if view is wider than it is tall, zoom to fit height
          camera.zoom = viewHeight / (radius * fitOffset)
        }
        else {
          // if view is taller than it is wide, zoom to fit width
          camera.zoom = viewWidth / (radius * fitOffset)
        }

        var moveCameraToCenter = center.clone().sub(controls.target);
        camera.position.add(moveCameraToCenter);
        camera.updateProjectionMatrix();

        controls.target.copy(center);
        controls.update();
      }
    }

    if (!this.camera || !this.controls || !this.scene) {
      console.error("Camera, control, or scene is not initialized.");
      return;
    }
    zoomCameraToSelection(this.camera, this.controls, this.scene.children);
    this.Render(false);
  }

}


class Model3d {
  constructor() {
    this.vertices = [];
    this.faces = [];
  }
  AddVertex(x, y, z) {
    this.vertices.push({ x: x, y: y, z: z });
  }
  AddVertices(vertices) {
    if (!vertices)
      return;

    if (Array.isArray(vertices)) {
      for (let i = 0; i < vertices.length; i += 3) {
        if (i + 2 < vertices.length) {
          this.AddVertex(vertices[i], vertices[i + 1], vertices[i + 2]);
        }
      }
      return;
    }

    this.vertices.push(...vertices);
  }
  AddFace(indices, color = undefined) {

    if (!Array.isArray(indices)) {
      console.error("Indices must be an array.");
      return;
    }

    // check if last indices[indices.lenght] is string
    if (typeof indices[indices.length - 1] === 'string') {
      color = indices.pop(); // remove last element if it's a color string
    }
    this.faces.push({ indices: indices, color: this.ConvertColor(color) });
  }
  AddFaces(faces) {
    if (!faces)
      return;

    for (const face of faces) {
      if (Array.isArray(face)) {
        this.AddFace(face);
        continue;
      }
      const indices = face.indices ?? [];
      const color = this.ConvertColor(face.color);
      this.faces.push({ indices: indices, color: color });
    }
  }
  ConvertColor(c) {
    var color = { r: 0.5, g: 0.5, b: 0.5, a: 1.0 }; // Default gray color
    if (c === undefined || c === null) {
      return color;
    }
    if (typeof c === 'object') {
      const { r, g, b, a } = c;
      color.r = r;
      color.g = g;
      color.b = b;
      color.a = a !== undefined ? a : 1.0; // Default alpha to 1.0 if not provided
    }
    else if (typeof c === 'string') {
      // If color is a string, parse it as a hex color
      const hexColor = new THREE.Color(c);
      color.r = hexColor.r;
      color.g = hexColor.g;
      color.b = hexColor.b;
      color.a = 1.0; // Default alpha to 1.0
    }
    else if (typeof c === 'number') {
      // If color is a number, assume it's a hex value
      const hexColor = new THREE.Color(c);
      color.r = hexColor.r;
      color.g = hexColor.g;
      color.b = hexColor.b;
      color.a = 1.0; // Default alpha to 1.0
    }
    return color;
  }
  CreateMesh() {
    if (this.vertices.length === 0 || this.faces.length === 0) {
      console.error("Model3d must have at least one vertex and one face.");
      return null;
    }

    const geometry = new THREE.BufferGeometry();

    const vertices = this.vertices.flatMap(vertex => [vertex.x, vertex.y, vertex.z]);
    const faces = this.faces.map(f => {
      const indices = f.indices ?? [];
      const color = {
        r: f.color.r ?? 1.0,
        g: f.color.g ?? 1.0,
        b: f.color.b ?? 1.0,
        a: f.color.a ?? 1.0
      };
      return { indices, color };
    });

    const materials = [];
    for (const face of faces) {
      const color = new THREE.Color(face.color.r, face.color.g, face.color.b);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: face.color.a < 1.0,
        opacity: face.color.a
      });
      materials.push(material);
    }

    const indices = [];
    var index = 0;
    for (const face of faces) {
      // for each 3 indices
      var currentIndex = indices.length;
      indices.push(...face.indices);
      geometry.addGroup(currentIndex, indices.length - currentIndex, index);
      index++;
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, materials);

    return mesh;
  }
}