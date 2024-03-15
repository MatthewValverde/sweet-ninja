var SplatController = pc.createScript('splatController');

SplatController.attributes.add('color', { type: 'rgb' });

SplatController.prototype.initialize = function () {
    let length = this.app.splatParticles.length;
    if (length == 0) return;
    //console.log('length:', length);
    let index = this.randomInteger(0, length - 1);
    //console.log(index);
    let splatParticle = this.app.splatParticles[index];
    let splat = splatParticle.resource.instantiate();
    //let splat = splatParticle.resource.instantiate();
    //console.log('color:', this.color);
    //console.log('splat.particlesystem.color:', splat.particlesystem.color);

    splat.particlesystem.colorGraph.curves[0].keys[0][1] = this.color.r;
    splat.particlesystem.colorGraph.curves[1].keys[0][1] = this.color.g;
    splat.particlesystem.colorGraph.curves[2].keys[0][1] = this.color.b;
    splat.particlesystem.rebuild();
    this.entity.addChild(splat);
};

SplatController.prototype.randomInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
