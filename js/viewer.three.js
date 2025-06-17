class Viewer {
  static ViewerControl = undefined;
  static Init() {
    Viewer.ViewerControl = new ViewerControl();
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
    // console.log("Viewer settings:", this.settings);

    THREE.Object3D.DefaultUp.set(0, 0, 1);
    if (this.settings.up)
    {
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
    this.renderer.setSize(window.innerWidth / 4, window.innerHeight / 4);

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
    if (this.settings.cube)
      this.CreateCube();

    this.Render();
  }

  SetRotateControls(rotate)
  {
    if (this.controls) {
      if (typeof rotate === 'boolean')
      {
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
    else
    {
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
        var value = decodeURIComponent(pair[1] || '');
        // contains `,` split by `,`
        if (value.includes(',')) {
          value = value.split(',').map(v => v.trim());
          // convert to float if possible
          value = value.map(v => {
            var num = parseFloat(v);
            return isNaN(num) ? v : num;
          });
        }
        if (value === 'true') {
          value = true;
        }
        else if (value === 'false') {
          value = false;
        }
        settings[decodeURIComponent(pair[0])] = value;
      }
    }
    return settings;
  }

  CreateCamera() // "perspective" or "orthographic"
  {
    var cameraType = this.settings.camera || "orthographic";
    var aspectRatio = window.innerWidth / window.innerHeight;
    var camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);

    if (cameraType === "orthographic") {
      var viewSize = 10;
      camera = new THREE.OrthographicCamera(
        -aspectRatio * viewSize / 2, aspectRatio * viewSize / 2,
        viewSize / 2, -viewSize / 2,
        0.1, 1000);
    }

    var cameraDistance = 100;
    camera.position.set(cameraDistance, -cameraDistance, cameraDistance);

    return camera;
  }
  SetEdges(enableEdges) {
    if (typeof enableEdges === 'boolean')
    {
      this.enableEdges = enableEdges;
    }
  }
  AddModel(model) {
    this.models.push(model);

    if (this.enableEdges) {
      var edges = new THREE.EdgesGeometry(model.geometry);
      model.edges = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
      model.edges.position.copy(model.position);
      this.scene.add(model.edges);
    }

    this.scene.add(model);
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
