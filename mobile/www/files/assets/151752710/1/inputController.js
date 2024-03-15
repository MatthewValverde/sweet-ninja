var InputController = pc.createScript('inputController');

InputController.prototype.initialize = function () {
    this.setUpInput();
};

InputController.prototype.setUpInput = function () {
    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.handleTouchMove, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.handleTouchUp, this);
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.handleTouchDown, this);
    }
    else if (this.app.mouse) {
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.handleMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.handleMouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.handleMouseDown, this);
    }
};

InputController.prototype.handleMouseDown = function (event) {
    if (event.buttons[pc.MOUSEBUTTON_LEFT]) this.app.fire('touchDown', event);
};

InputController.prototype.handleTouchDown = function (event) {
    this.app.fire('touchDown', this.getTouchEvent(event));
};

InputController.prototype.handleMouseMove = function (event) {
    if (event.buttons[pc.MOUSEBUTTON_LEFT]) this.app.fire('touchMove', event);
};

InputController.prototype.handleTouchMove = function (event) {
    this.app.fire('touchMove', this.getTouchEvent(event));
};

InputController.prototype.handleMouseUp = function (event) {
    this.app.fire('touchUp', event);
};

InputController.prototype.handleTouchUp = function (event) {
    this.app.fire('touchUp', this.getTouchEvent(event));
};

InputController.prototype.getTouchEvent = function (e) {
    return {
        x: (e.changedTouches[0]) ? e.changedTouches[0].x : e.touches[0].x,
        y: (e.changedTouches[0]) ? e.changedTouches[0].y : e.touches[0].y
    };
};
