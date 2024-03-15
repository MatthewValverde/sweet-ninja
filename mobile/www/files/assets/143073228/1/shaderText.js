var ShaderText = pc.createScript('shaderText');

ShaderText.attributes.add('colors', { type: 'rgb', array: true, title: 'custom colors' });

ShaderText.attributes.add('scale', { type: 'number', default: 1.0 });

ShaderText.attributes.add('move', { type: 'boolean', default: true });

ShaderText.attributes.add('speed', { type: 'number', default: 1 });

ShaderText.attributes.add('colorKey', {
    type: 'string',
    default: 'customColors',
    enum: [
        { 'customColors': 'customColors' },
        { 'primary': 'primary' },
        { 'secondary': 'secondary' },
        { 'text': 'text' },
        { 'widget': 'widget' }
    ]
});

ShaderText.prototype.initialize = function () {
    if (this.colors.length == 0) return;

    // convert colors to an array of pixel data
    var pixelData = new Uint8Array(this.colors.length * 4);
    for (var i = 0; i < this.colors.length; i++) {
        pixelData[i * 4 + 0] = this.colors[i].r * 255;
        pixelData[i * 4 + 1] = this.colors[i].g * 255;
        pixelData[i * 4 + 2] = this.colors[i].b * 255;
        pixelData[i * 4 + 3] = 255; // alpha value, set to 255 (fully opaque)
    }

    // create a 1D texture with the pixel data
    var texture = new pc.Texture(this.app.graphicsDevice, {
        width: this.colors.length,
        height: 1,
        format: pc.PIXELFORMAT_R8_G8_B8_A8, // use RGBA format
        autoMipmap: false // we don't need mipmaps for a 1D texture
    });

    // lock the texture, set the pixel data, and unlock the texture
    var pixels = texture.lock();
    pixels.set(pixelData);
    texture.unlock();

    var mat;
    mat = this.entity.element._text._material.clone();
    mat.chunks.APIVersion = pc.CHUNKAPI_1_62;

    // SIMPLE SHADER VERSION
    /*mat.chunks.emissivePS = `
          uniform float iGlobalTime;
          void getEmission() {
              vec2 p = -1.0 + 2.0 * (vUv0 * 15.0);
              float x = p.x;
              float y = p.y;
              float mov0 = x+y+cos(sin(iGlobalTime)*2.0)*100.+sin(x/100.)*1000.;
              float mov1 = y / 0.9 +  iGlobalTime;
              float mov2 = x / 0.2;
              float c1 = abs(sin(mov1+iGlobalTime)/2.+mov2/2.-mov1-mov2+iGlobalTime);
              float c2 = abs(sin(c1+sin(mov0/1000.+iGlobalTime)+sin(y/40.+iGlobalTime)+sin((x+y)/100.)*3.));
              float c3 = abs(sin(c2+cos(mov1+mov2+c2)+cos(mov2)+sin(x/1000.)));
              dEmission = vec3(c1, c2, c3);
          }
      `;*/

    // ADV SHADER VERSION
    mat.chunks.emissivePS = `
        uniform float iGlobalTime;
        uniform float scale;
        uniform sampler2D colorTexture; // 1D texture containing your array of colors
        uniform int colorCount; // Number of colors in your array

        void getEmission() {
            vec2 p = -1.0 + 2.0 * (vUv0 * scale);

            float x = p.x;
            float y = p.y;
            float mov0 = x+y+cos(sin(iGlobalTime)*2.0)*100.+sin(x/100.)*1000.;
            float mov1 = y / 0.9 +  iGlobalTime;
            float mov2 = x / 0.2;
            float c1 = abs(sin(mov1+iGlobalTime)/2.+mov2/2.-mov1-mov2+iGlobalTime);
            float c2 = abs(sin(c1+sin(mov0/1000.+iGlobalTime)+sin(y/40.+iGlobalTime)+sin((x+y)/100.)*3.));
            float c3 = abs(sin(c2+cos(mov1+mov2+c2)+cos(mov2)+sin(x/1000.)));

            // Use c1, c2, and c3 to index into your array of colors.
            // We normalize these values to the range [0, colorCount-1] and divide by colorCount to get texture coordinates.
            float colorCountFloat = float(colorCount);
            float index1 = mod(c1 * colorCountFloat, colorCountFloat) / colorCountFloat;
            float index2 = mod(c2 * colorCountFloat, colorCountFloat) / colorCountFloat;
            float index3 = mod(c3 * colorCountFloat, colorCountFloat) / colorCountFloat;

            // Retrieve the colors from the texture
            vec3 color1 = texture2D(colorTexture, vec2(index1, 0.5)).rgb;
            vec3 color2 = texture2D(colorTexture, vec2(index2, 0.5)).rgb;
            vec3 color3 = texture2D(colorTexture, vec2(index3, 0.5)).rgb;

            dEmission = (color1 + color2 + color3) / 3.0; // Combine the colors in some way
        }
      `;

    mat.diffuseMap = new pc.Texture(this.app.graphicsDevice, {
        width: 1,
        height: 1,
        format: pc.PIXELFORMAT_R8_G8_B8
    });
    mat.depthWrite = false;
    this.entity.element._text._setMaterial(mat);
    mat.setParameter('iGlobalTime', 0);
    mat.setParameter('scale', this.scale);
    mat.setParameter('colorTexture', texture);
    mat.setParameter('colorCount', this.colors.length);
    mat.update();

    this.mat = mat;
    this.time = 0;
    this.app.on('initializationComplete', this.postInit, this);
};

ShaderText.prototype.postInit = function () {
    this.app.observers.push(this);
};

ShaderText.prototype.updateFrame = function (dt) {
    if (!this.move) return;

    this.time += (dt * this.speed);
    if (this.mat) this.mat.setParameter('iGlobalTime', this.time);
};
