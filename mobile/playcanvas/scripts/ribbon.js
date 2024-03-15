var Ribbon = pc.createScript('ribbon');

Ribbon.attributes.add("lifetime", { type: "number", default: 0.5 });
Ribbon.attributes.add("xoffset", { type: "number", default: -0.8 });
Ribbon.attributes.add("yoffset", { type: "number", default: 1 });
Ribbon.attributes.add("height", { type: "number", default: 0.4 });
Ribbon.attributes.add("camera", { type: "entity" });
Ribbon.attributes.add("layer", { type: "string", default: "World" });
Ribbon.attributes.add("billboard", { type: "boolean" });
Ribbon.attributes.add("texture", { type: "asset", assetType: "texture" }); // new attribute for texture


var MAX_VERTICES = 600;
var VERTEX_SIZE = 4;

Ribbon.prototype.initialize = function () {
    /*var shaderDefinition = {
        attributes: {
            aPositionAge: pc.SEMANTIC_POSITION
        },
        vshader: [
            "attribute vec4 aPositionAge;",
            "",
            "uniform mat4 matrix_viewProjection;",
            "uniform float trail_time;",
            "",
            "varying float vAge;",
            "",
            "void main(void)",
            "{",
            "    vAge = trail_time - aPositionAge.w;",
            "    gl_Position = matrix_viewProjection * vec4(aPositionAge.xyz, 1.0);",
            "}"
        ].join("\n"),
        fshader: [
            "precision mediump float;",
            "",
            "varying float vAge;",
            "",
            "uniform float trail_lifetime;",
            "",
            "vec3 rainbow(float x)",
            "{",
            "float level = floor(x * 6.0);",
            "float r = float(level <= 2.0) + float(level > 4.0) * 0.5;",
            "float g = max(1.0 - abs(level - 2.0) * 0.5, 0.0);",
            "float b = (1.0 - (level - 4.0) * 0.5) * float(level >= 4.0);",
            "return vec3(r, g, b);",
            "}",
            "void main(void)",
            "{",
            "    gl_FragColor = vec4(rainbow(vAge / trail_lifetime), (1.0 - (vAge / trail_lifetime)) * 0.5);",
            "}"
        ].join("\n")
    };

              
            "{",
            "float level = floor(x * 6.0);",
            "float r = 1.0;",
            "float g = 1.0;",
            "float b = 1.0;",
            "return vec3(r, g, b);",
            "}",        
    */

    var ribbonMesh = {
        attributes: {
            aPositionAge: pc.SEMANTIC_POSITION,
            aUV: pc.SEMANTIC_TEXCOORD0 // new attribute for UV coordinates
        },
        vshader: [
            "attribute vec4 aPositionAge;",
            "attribute vec2 aUV;", // new attribute in vertex shader
            "",
            "uniform mat4 matrix_viewProjection;",
            "uniform float trail_time;",
            "",
            "varying float vAge;",
            "varying vec2 vUV;", // new varying to pass UV to fragment shader
            "",
            "void main(void)",
            "{",
            "    vAge = trail_time - aPositionAge.w;",
            "    vUV = aUV;", // pass UV coordinates to fragment shader
            "    gl_Position = matrix_viewProjection * vec4(aPositionAge.xyz, 1.0);",
            "}"
        ].join("\n"),
        fshader: [
            "precision mediump float;",
            "",
            "uniform sampler2D uTexture;", // new uniform for the texture
            "varying float vAge;",
            "varying vec2 vUV;", // new varying to get UV in fragment shader
            "uniform float trail_lifetime;",
            "",
            "void main(void)",
            "{",
            "    vec4 color = texture2D(uTexture, vUV);", // sample the texture using UV coordinates
            "    float edgeAlpha = smoothstep(0.0, 0.1, vUV.x) * (1.0 - smoothstep(0.9, 1.0, vUV.x));", // compute alpha gradient for the edges
            "    color.a *= (1.0 - (vAge / trail_lifetime)) * edgeAlpha * 0.75;", // modify the alpha based on the age and the edge alpha
            "    gl_FragColor = color;", // set the fragment color to the sampled texture color
            "}"
        ].join("\n")
    };


    var shaderDefinition = {
        attributes: {
            aPositionAge: pc.SEMANTIC_POSITION,
            aUV: pc.SEMANTIC_TEXCOORD0 // new attribute for UV coordinates
        },
        vshader: [
            "attribute vec4 aPositionAge;",
            "attribute vec2 aUV;", // new attribute in vertex shader
            "",
            "uniform mat4 matrix_viewProjection;",
            "uniform float trail_time;",
            "",
            "varying float vAge;",
            "varying vec2 vUV;", // new varying to pass UV to fragment shader
            "",
            "void main(void)",
            "{",
            "    vAge = trail_time - aPositionAge.w;",
            "    vUV = aUV;", // pass UV coordinates to fragment shader
            "    gl_Position = matrix_viewProjection * vec4(aPositionAge.xyz, 1.0);",
            "}"
        ].join("\n"),
        fshader: [
            "precision mediump float;",
            "",
            "uniform sampler2D uTexture;", // new uniform for the texture
            "varying float vAge;",
            "varying vec2 vUV;", // new varying to get UV in fragment shader
            "uniform float trail_lifetime;",
            "",
            "void main(void)",
            "{",
            "    vec4 color = texture2D(uTexture, vUV);", // sample the texture using UV coordinates
            "    color.a *= (1.0 - (vAge / trail_lifetime)) * 0.75;", // modify the alpha based on the age
            "    gl_FragColor = color;", // set the fragment color to the sampled texture color
            "}"
        ].join("\n")
    };

    var shader = new pc.Shader(this.app.graphicsDevice, shaderDefinition);
    this.material = new pc.Material();
    this.material.shader = shader;
    this.material.setParameter('trail_time', 0);
    this.material.setParameter('trail_lifetime', this.lifetime);
    this.material.setParameter('uTexture', this.texture.resource); // set texture to material
    this.material.cull = pc.CULLFACE_NONE;
    this.material.blend = true;
    this.material.blendSrc = pc.BLENDMODE_SRC_ALPHA;
    this.material.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
    this.material.blendEquation = pc.BLENDEQUATION_ADD;
    this.material.depthWrite = false;

    this.timer = 0;

    // The generated ribbon vertices data
    this.vertices = [];

    this.mesh = new pc.Mesh(this.app.graphicsDevice);
    this.clear();

    // Create the mesh instance
    var meshInstance = new pc.MeshInstance(this.mesh, this.material);

    this.entity.addComponent('render', {
        meshInstances: [meshInstance],
        layers: [this.app.scene.layers.getLayerByName(this.layer).id]
    });

    this.entity.render.enabled = false;

    /* this.isTouch = this.app.touch;
    if (this.isTouch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onMouseDown2, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onMouseMove2, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onMouseUp2, this);
    } else {
        // Mouse Events
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown2, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove2, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp2, this);
    } */

    this.app.on('touchDown', this.onMouseDown2, this);
    this.app.on('touchMove', this.onMouseMove2, this);
    this.app.on('touchUp', this.onMouseUp2, this);

    this.startPoint = new pc.Vec3();
    this.endPoint = new pc.Vec3();

    this.drawLine = false;
    this.app.on('initializationComplete', this.postInit, this);
};

Ribbon.prototype.postInit = function () {
    this.app.observers.push(this);
};

Ribbon.prototype.clear = function () {
    // Vertex array to use with Mesh API and update the mesh
    this.vertexData = new Float32Array(MAX_VERTICES * VERTEX_SIZE);

    // Create the array for the vertex positions
    this.vertexIndexArray = [];
    for (var i = 0; i < this.vertexData.length; ++i) {
        this.vertexIndexArray.push(i);
    }

    // Prepare the mesh to be created into a mesh instance
    this.mesh.clear(true, false);
    this.mesh.setPositions(this.vertexData, VERTEX_SIZE, MAX_VERTICES);
    this.mesh.setIndices(this.vertexIndexArray, MAX_VERTICES);
    this.mesh.update(pc.PRIMITIVE_TRISTRIP);
};

Ribbon.prototype.reset = function () {
    this.timer = 0;
    this.vertices = [];
};

Ribbon.prototype.spawnNewVertices = function () {
    var node = this.entity;
    var pos = node.getPosition();
    if (!this.swipeDirection) return;
    var yaxis = 0;
    if (this.swipeDirection === "left" || this.swipeDirection === "right") {
        //yaxis = node.up.clone().scale(this.height);
    } else if (this.swipeDirection === "up" || this.swipeDirection === "down") {
        //yaxis = node.right.clone().scale(this.height);
    }
    yaxis = node.right.clone().scale(this.height / 2);
    var s = this.xoffset;
    var e = this.yoffset;

    var spawnTime = this.timer;
    var vertexPair = [
        pos.x + yaxis.x * s, pos.y + yaxis.y * s, pos.z + yaxis.z * s,
        pos.x + yaxis.x * e, pos.y + yaxis.y * e, pos.z + yaxis.z * e
    ];

    // Get the current camera
    var camera = this.camera;
    if (this.billboard && camera) {

        // Calculate the direction from the camera to the entity
        var direction = pos.clone().sub(camera.getPosition()).normalize();

        var newUp = new pc.Vec3().cross(direction, camera.right);
        // Calculate the new right vector for the entity

        // Use the new up and right vectors to adjust the positions of the vertices
        var offset = newUp.clone().scale(this.height / 2);
        vertexPair[0] = pos.x + offset.x * s;
        vertexPair[1] = pos.y + offset.y * s;
        vertexPair[2] = pos.z + offset.z * s;
        vertexPair[3] = pos.x + offset.x * e;
        vertexPair[4] = pos.y + offset.y * e;
        vertexPair[5] = pos.z + offset.z * e;
    }

    this.vertices.unshift({ spawnTime, vertexPair });
};

Ribbon.prototype.clearOldVertices = function () {
    for (var i = this.vertices.length - 1; i >= 0; i--) {
        var vp = this.vertices[i];
        if (this.timer - vp.spawnTime >= this.lifetime) {
            this.vertices.pop();
        } else {
            break;
        }
    }
};

/*Ribbon.prototype.prepareVertexData = function () {
    for (var i = 0; i < this.vertices.length; i++) {
        var vp = this.vertices[i];

        this.vertexData[i * 8 + 0] = vp.vertexPair[0];
        this.vertexData[i * 8 + 1] = vp.vertexPair[1];
        this.vertexData[i * 8 + 2] = vp.vertexPair[2];
        this.vertexData[i * 8 + 3] = vp.spawnTime;

        this.vertexData[i * 8 + 4] = vp.vertexPair[3];
        this.vertexData[i * 8 + 5] = vp.vertexPair[4];
        this.vertexData[i * 8 + 6] = vp.vertexPair[5];
        this.vertexData[i * 8 + 7] = vp.spawnTime;

        if (this.vertexData.length === i) {
            break;
        }
    }
};*/

Ribbon.prototype.prepareVertexData = function () {
    for (var i = 0; i < this.vertices.length; i++) {
        var vp = this.vertices[i];

        this.vertexData[i * 8 + 0] = vp.vertexPair[0];
        this.vertexData[i * 8 + 1] = vp.vertexPair[1];
        this.vertexData[i * 8 + 2] = vp.vertexPair[2];
        this.vertexData[i * 8 + 3] = vp.spawnTime;

        this.vertexData[i * 8 + 4] = vp.vertexPair[3];
        this.vertexData[i * 8 + 5] = vp.vertexPair[4];
        this.vertexData[i * 8 + 6] = vp.vertexPair[5];
        this.vertexData[i * 8 + 7] = vp.spawnTime;

        // Calculate UV coordinates based on the dimensions of the texture and the current vertex
        var uv = i / this.vertices.length;
        this.vertexData[i * 8 + 8] = uv; // UV x
        this.vertexData[i * 8 + 9] = uv; // UV y

        if (this.vertexData.length === i) {
            break;
        }
    }
};

/* Ribbon.prototype.prepareVertexData = function () {
    for (var i = 0; i < this.vertices.length; i++) {
        var vp = this.vertices[i];

        this.vertexData[i * 8 + 0] = vp.vertexPair[0];
        this.vertexData[i * 8 + 1] = vp.vertexPair[1];
        this.vertexData[i * 8 + 2] = vp.vertexPair[2];
        this.vertexData[i * 8 + 3] = vp.spawnTime;

        this.vertexData[i * 8 + 4] = vp.vertexPair[3];
        this.vertexData[i * 8 + 5] = vp.vertexPair[4];
        this.vertexData[i * 8 + 6] = vp.vertexPair[5];
        this.vertexData[i * 8 + 7] = vp.spawnTime;

        // Calculate UV coordinates based on the dimensions of the texture and the current vertex
        var uv = i / (this.vertices.length - 1);

        // Assuming the UV coordinates for each vertex should be either 0 or 1 depending on if it's an even or odd vertex.
        // This will map UVs correctly to 0 or 1 across the ribbon width.
        var uvX = i % 2 === 0 ? 0 : 1;

        this.vertexData[i * 8 + 0] = uvX; // UV x
        this.vertexData[i * 8 + 1] = uv;  // UV y
    }
}; */

Ribbon.prototype.prepareVertexData2 = function () {
    for (var i = 0; i < this.vertices.length; i++) {
        var vp = this.vertices[i];

        this.vertexData[i * 8 + 0] = vp.vertexPair[0];
        this.vertexData[i * 8 + 1] = vp.vertexPair[1];
        this.vertexData[i * 8 + 2] = vp.vertexPair[2];
        this.vertexData[i * 8 + 3] = vp.spawnTime;

        this.vertexData[i * 8 + 4] = vp.vertexPair[3];
        this.vertexData[i * 8 + 5] = vp.vertexPair[4];
        this.vertexData[i * 8 + 6] = vp.vertexPair[5];
        this.vertexData[i * 8 + 7] = vp.spawnTime;

        // Calculate UV coordinates based on the dimensions of the texture and the current vertex
        var uv = i / this.vertices.length;
        this.vertexData[i * 8 + 8] = uv; // UV x
        this.vertexData[i * 8 + 9] = 10; // UV y

        if (this.vertexData.length === i) {
            break;
        }
    }
};

Ribbon.prototype.updateFrame = function (dt) {
    this.timer += dt;
    this.material.setParameter('trail_time', this.timer);
    if (!this.drawLine) return;
    this.updateVert();
};

Ribbon.prototype.updateVert = function () {
    // Remove any old vertices at the end of the trail based on the timer value
    this.clearOldVertices();

    // Create new vertices on the updated position of the beginning of the trail
    this.spawnNewVertices();

    // Update the mesh
    if (this.vertices.length > 1) {
        this.prepareVertexData();
        var currentLength = this.vertices.length * 2;
        var limit = MAX_VERTICES;

        if (currentLength < limit) {
            limit = currentLength;
        }

        this.mesh.setPositions(this.vertexData, VERTEX_SIZE, limit);
        this.mesh.setIndices(this.vertexIndexArray, limit);
        this.mesh.update(pc.PRIMITIVE_TRISTRIP);
        this.entity.render.enabled = true;
    }
};

Ribbon.prototype.onMouseDown2 = function (e) {
    // let e = this.getTouchEvent(event);
    this.startPoint.copy(this.getMouseWorldPosition(e));
    this.entity.setLocalPosition(this.startPoint);

    this.updateVert();

    if (!this.initialTouchPos) {
        this.setInitialPos(e.x, e.y);
    }

    this.drawLine = true;
    //event.event.preventDefault();
};

Ribbon.prototype.onMouseMove2 = function (e) {
    if (this.initialTouchPos) { // If mousedown has occurred    
        //let e = this.getTouchEvent(event);
        this.setRecurringPos(e.x, e.y);
        this.updateSwipeDirection(e.x, e.y);
        this.endPoint.copy(this.getMouseWorldPosition(e));
        this.updatePos();
    }
    //event.event.preventDefault();
};

Ribbon.prototype.onMouseUp2 = function (e) {
    //let e = this.getTouchEvent(event);

    if (this.initialTouchPos) {
        this.updateSwipeDirection(e.x, e.y);
        this.initialTouchPos = null;
    }

    this.drawLine = false;
    //event.event.preventDefault();
};

/* Ribbon.prototype.getTouchEvent = function (e) {
    return {
        x: (this.isTouch) ? e.changedTouches[0].x : e.x,
        y: (this.isTouch) ? e.changedTouches[0].y : e.y
    };
}; */

Ribbon.prototype.updatePos = function () {
    this.entity.setLocalPosition(this.endPoint);
    this.startPoint.copy(this.endPoint);
};

Ribbon.prototype.getMouseWorldPosition = function (e) {
    var result = new pc.Vec3();
    var distance = 9;
    this.camera.camera.screenToWorld(e.x, e.y, distance, result);
    return result;
};

Ribbon.prototype.setInitialPos = function (x, y) {
    this.initialTouchPos = {
        x: x,
        y: y
    };

    this.iTouchArray = [];

    this.iTouchArray.push(this.initialTouchPos);
};

Ribbon.prototype.setRecurringPos = function (x, y) {
    let recurringTouchPos = {
        x: x,
        y: y
    };
    this.iTouchArray.push(recurringTouchPos);
};

Ribbon.prototype.updateSwipeDirection = function (x, y) {
    let endTouchPos = {
        x: x,
        y: y
    };

    if (!this.initialTouchPos || !endTouchPos) {
        return;
    }

    let l = (this.iTouchArray) ? this.iTouchArray.length : 0;
    let itp = (l > 5) ? this.iTouchArray[l - 5] : this.initialTouchPos;

    let mag = vectorMagnitude(itp, endTouchPos);
    if (mag < this.minimumSwipeLength) return;
    let degree = vectorAngleDegree(itp, endTouchPos);

    if (degree < -135 || degree > 135) this.swipeDirection = "left";
    else if (degree > -135 && degree < -45) this.swipeDirection = "up";
    else if (degree > -45 && degree < 45) this.swipeDirection = "right";
    else if (degree > 45 && degree < 135) this.swipeDirection = "down";
};

