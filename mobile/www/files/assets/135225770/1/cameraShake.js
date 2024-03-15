var CameraShake = pc.createScript('cameraShake');

CameraShake.attributes.add("shakeInterval", { type: "number", default: 0.1, title: "Camera Shake Interval" });
CameraShake.attributes.add("maxShakeDistance", { type: "number", default: 0.1, title: "Max Shake Distance" });
CameraShake.attributes.add("duration", { type: "number", default: 1, title: "Duration" });

// initialize code called once per entity
CameraShake.prototype.initialize = function () {
    this.time = this.duration;
    this.timeSinceLastShake = 0;

    this.startPosition = this.entity.getPosition().clone();

    // Listen to the event that will trigger the camera shake
    this.app.on("camera_shake", this.onStartShake, this);
    this.app.on('initializationComplete', this.postInit, this);
};

CameraShake.prototype.postInit = function () {
    this.app.observers.push(this);
};

// update code called every frame
CameraShake.prototype.updateFrame = function (dt) {
    this.time += dt;

    if (this.time < this.duration) {
        this.timeSinceLastShake += dt;

        if (this.timeSinceLastShake >= this.shakeInterval) {
            // Use this to reduce the maximum shake distance over the duration of the effect
            var v = 1 - pc.math.clamp(this.time / this.duration, 0, 1);

            // Find a point in a disc to offset the camera by
            // Taken from http://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
            var t = 2 * Math.PI * pc.math.random(0, 1);
            var u = pc.math.random(0, this.maxShakeDistance) * v + pc.math.random(0, this.maxShakeDistance) * v;
            var r = u > 1 ? 2 - u : u;

            var x = r * Math.cos(t);
            var y = r * Math.sin(t);

            this.entity.setLocalPosition(this.startPosition.x + x, this.startPosition.y + y, this.startPosition.z);
            this.timeSinceLastShake -= this.shakeInterval;
        }
    }
};

CameraShake.prototype.onStartShake = function () {
    this.startPosition = this.entity.getPosition().clone();
    this.time = 0;
};