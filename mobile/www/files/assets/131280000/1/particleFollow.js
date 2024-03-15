var ParticleFollow = pc.createScript('particleFollow');

ParticleFollow.attributes.add('fadeOut', { type: 'number', title: 'Fade Out Speed', default: 0.33 });
ParticleFollow.attributes.add('cameraEntity', { type: 'entity', title: 'Camera Entity' });

ParticleFollow.prototype.initialize = function () {
    this.entity.particlesystem.stop();
    this.entity.particlesystem.reset();
    this.entity.enabled = false;

    this.app.on('touchDown', this.onMouseDown, this);
    this.app.on('touchMove', this.onMouseMove, this);
    this.app.on('touchUp', this.onMouseUp, this);

    /* if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
    }
    // Listen to when the user moves 
    else if (this.app.mouse) {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    }


    this.on('destroy', function () {
        if (this.app.touch) {
            this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
            this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
            this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        }
        else if (this.app.mouse) {
            this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
            this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        }

    }, this); */
};

ParticleFollow.prototype.updateFromScreen = function (screenPosition) {
    var position = this.entity.getPosition();
    var distance = 1.5;
    this.cameraEntity.camera.screenToWorld(screenPosition.x, screenPosition.y, distance, position);
    this.entity.setPosition(position);
};

ParticleFollow.prototype.onMouseDown = function (e) {
    //if (this.app.swipeLock) return;
    this.entity.particlesystem.play();
    this.updateFromScreen(e);
    this.entity.enabled = true;
    this.app.fire('slideAudio', true);
    //e.event.preventDefault();
};

ParticleFollow.prototype.onMouseMove = function (e) {

    //if (this.app.swipeLock) return;
    this.updateFromScreen(e);
    //e.event.preventDefault();
};

ParticleFollow.prototype.onMouseUp = function (e) {

    //setTimeout(() => {
    this.entity.particlesystem.stop();
    this.entity.particlesystem.reset();
    this.entity.enabled = false;
    //}, this.fadeOut * 1000);

    this.app.fire('slideAudio', false);
    //e.event.preventDefault();
};

/* ParticleFollow.prototype.onTouchStart = function (e) {
    //if (this.app.swipeLock) return;
    //if (e.touches.length == 1) {
    this.entity.particlesystem.play();
    this.updateFromScreen(e.touches[0]);
    this.entity.enabled = true;
    e.event.preventDefault();
    // }
};

ParticleFollow.prototype.onTouchMove = function (e) {
    //if (this.app.swipeLock) return;
    this.updateFromScreen(e.touches[0]);
    e.event.preventDefault();
};

ParticleFollow.prototype.onTouchEnd = function (e) {
    this.entity.particlesystem.stop();
    this.entity.particlesystem.reset();
    this.entity.enabled = false;
    e.event.preventDefault();
};
 */