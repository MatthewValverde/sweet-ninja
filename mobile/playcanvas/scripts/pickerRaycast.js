var PickerRaycast = pc.createScript('pickerRaycast');

PickerRaycast.prototype.initialize = function () {
    this.isSwiping = false;

    this.app.on('touchDown', this.onDown, this);
    this.app.on('touchMove', this.onMove, this);
    this.app.on('touchUp', this.onUp, this);

    /* this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMove, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onUp, this);

    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
    }

    this.on('destroy', function () {
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMove, this);
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onUp, this);

        if (this.app.touch) {
            this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
            this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
            this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        }
    }, this); */

};

PickerRaycast.prototype.onDown = function (e) {
    this.isSwiping = true;
    // e.event.preventDefault();
};

PickerRaycast.prototype.onMove = function (e) {
    if (!this.isSwiping) {
        return;
    }
    this.move(e);
    // e.event.preventDefault();
};

PickerRaycast.prototype.onUp = function (e) {
    this.isSwiping = false;
    // e.event.preventDefault();
};

/* PickerRaycast.prototype.onTouchStart = function (e) {
    if (e.touches.length == 1) {
        this.isSwiping = true;
        e.event.preventDefault();
    }
};

PickerRaycast.prototype.onTouchMove = function (e) {
    if (!this.isSwiping) {
        return;
    }
    this.move(e.touches[0]);
    e.event.preventDefault();
};

PickerRaycast.prototype.onTouchEnd = function (e) {
    this.isSwiping = false;
    e.event.preventDefault();
}; */

PickerRaycast.prototype.move = function (e) {
    if (this.app.swipeLock || !this.app.gameRunning) return;

    let f = this.entity.camera.screenToWorld(e.x, e.y, this.entity.camera.nearClip);
    let t = this.entity.camera.screenToWorld(e.x, e.y, this.entity.camera.farClip);

    let result = this.app.systems.rigidbody.raycastFirst(f, t);
    if (result) {
        let pickedEntity = result.entity;
        if (pickedEntity.script && pickedEntity.script.splitObject) {
            this.app.hitCount++;
            pickedEntity.script.splitObject.split(e);
        }
    }
};
