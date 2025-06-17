function off_loader()
{
    var cube = {
  "Vertices": [
    {
      "X": 1.632993,
      "Y": 0.0,
      "Z": 1.154701
    },
    {
      "X": 0.0,
      "Y": 1.632993,
      "Z": 1.154701
    },
    {
      "X": -1.632993,
      "Y": 0.0,
      "Z": 1.154701
    },
    {
      "X": 0.0,
      "Y": -1.632993,
      "Z": 1.154701
    },
    {
      "X": 1.632993,
      "Y": 0.0,
      "Z": -1.154701
    },
    {
      "X": 0.0,
      "Y": 1.632993,
      "Z": -1.154701
    },
    {
      "X": -1.632993,
      "Y": 0.0,
      "Z": -1.154701
    },
    {
      "X": 0.0,
      "Y": -1.632993,
      "Z": -1.154701
    }
  ],
  "Faces": [
    {
      "Indices": [
        0,
        1,
        2,
        3
      ],
      "Color": {
        "R": 1.0,
        "G": 0.0,
        "B": 0.0,
        "A": 0.75
      }
    },
    {
      "Indices": [
        7,
        4,
        0,
        3
      ],
      "Color": {
        "R": 0.3,
        "G": 0.4,
        "B": 0.0,
        "A": 0.75
      }
    },
    {
      "Indices": [
        4,
        5,
        1,
        0
      ],
      "Color": {
        "R": 0.2,
        "G": 0.5,
        "B": 0.1,
        "A": 0.75
      }
    },
    {
      "Indices": [
        5,
        6,
        2,
        1
      ],
      "Color": {
        "R": 0.1,
        "G": 0.6,
        "B": 0.2,
        "A": 0.75
      }
    },
    {
      "Indices": [
        3,
        2,
        6,
        7
      ],
      "Color": {
        "R": 0.0,
        "G": 0.7,
        "B": 0.3,
        "A": 0.75
      }
    },
    {
      "Indices": [
        6,
        5,
        4,
        7
      ],
      "Color": {
        "R": 0.0,
        "G": 1.0,
        "B": 0.0,
        "A": 0.75
      }
    }
  ],
  "VerticesCount": 8,
  "FacesCount": 6,
  "EdgesCount": 12,
  "Comments": ""
}



    return cube;
}

function off_mesh(offJson = undefined)
{
    const off = offJson ?? off_loader();
    const {geometry, materials} = off_to_geometry(off);
    const material = new THREE.MeshBasicMaterial({ 
        vertexColors: false, 
        //side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.set(0,0,4);
    return mesh;
}

function off_to_geometry(off)
{
    const geometry = new THREE.BufferGeometry();

    const vertices = off.Vertices.map(v => new THREE.Vector3(v.X, v.Y, v.Z));
    const faces = off.Faces.map(f => {
        const indices = f.Indices;
        const color = new THREE.Color(f.Color.R, f.Color.G, f.Color.B);
        const alpha = f.Color.A || 1.0;
        return { indices, color, alpha };
    });
    
    const materials = [];
    for (const face of faces) {
        const color = new THREE.Color(face.color.r, face.color.g, face.color.b);
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: face.alpha });
        materials.push(material);
    }

    const indices = [];
    var index = 0;
    for (const face of faces) {
        // for each 3 indices
        var currentIndex = indices.length;
        for (let i = 1; i < face.indices.length - 1; i++) {
            var a = face.indices[0];
            var b = face.indices[i];
            var c = face.indices[i + 1];
            indices.push(a, b, c);
        }
        geometry.addGroup(currentIndex, indices.length - currentIndex, index);
        index++;
    }

    //geometry.addGroup(0, indices.length, 0);

    

    const positions = [];
    const colors = [];

    for (const vertex of vertices) {
        positions.push(vertex.x, vertex.y, vertex.z);
    }

    for (const face of faces) {
        for (let i = 0; i < face.indices.length; i++) {
            const index = face.indices[i];
            colors.push(face.color.r, face.color.g, face.color.b);
        }
    }

    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    //geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    geometry.computeVertexNormals();

    return {geometry, materials};
}

function convert_object_lowcase(value)
{
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return value.map(convert_object_lowcase);
        } else {
            const newObj = {};
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    newObj[key.toLowerCase()] = convert_object_lowcase(value[key]);
                }
            }
            return newObj;
        }
    }
    return value;
}