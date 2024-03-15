var SwipeDetector = pc.createScript('swipeDetector');

SwipeDetector.prototype.initialize = function () {
    this.counter = 0;
    this.startPoint = null;
    this.currentDirection = null;
    this.sensitivity = 10;

    this.minimumSwipeLength = 4;
    this.canFireWhip = true;

    // Touch Events
    /* if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchDown, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchUp, this);
    }

    // Mouse Events
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this); */


    this.app.on('touchDown', this.onMouseDown, this);
    this.app.on('touchMove', this.onMouseMove, this);
    this.app.on('touchUp', this.onMouseUp, this);
};

SwipeDetector.prototype.onMouseDown = function (event) {
    let e = event;
    if (!this.initialTouchPos) {
        this.setInitialPos(e.x, e.y);
    }
    // event.event.preventDefault();
};

SwipeDetector.prototype.onMouseMove = function (event) {
    let e = event;
    if (this.initialTouchPos) {
        this.setRecurringPos(e.x, e.y);
        this.updateSwipeDirection(e.x, e.y);
    }
    // event.event.preventDefault();
};

SwipeDetector.prototype.onMouseUp = function (event) {
    let e = event;
    if (this.initialTouchPos) {
        this.updateSwipeDirection(e.x, e.y);
        this.initialTouchPos = null;
    }
    // event.event.preventDefault();
};

/* SwipeDetector.prototype.onTouchDown = function (event) {
    let e = event.changedTouches[0];
    if (!this.initialTouchPos) {
        this.setInitialPos(e.x, e.y);
    }
    event.event.preventDefault();
};

SwipeDetector.prototype.onTouchMove = function (event) {
    let e = event.changedTouches[0];
    if (this.initialTouchPos) {
        this.setRecurringPos(e.x, e.y);
        this.updateSwipeDirection(e.x, e.y);
    }
    event.event.preventDefault();
};

SwipeDetector.prototype.onTouchUp = function (event) {
    let e = event.changedTouches[0];
    if (this.initialTouchPos) {
        this.updateSwipeDirection(e.x, e.y);
        this.initialTouchPos = null;
    }
    event.event.preventDefault();
}; */

SwipeDetector.prototype.setInitialPos = function (x, y) {
    this.cSwordDirection = this.app.swipeDirection;
    this.initialTouchPos = {
        x: x,
        y: y
    };
    this.iTouchArray = [];
    this.iTouchArray.push(this.initialTouchPos);
};

SwipeDetector.prototype.setRecurringPos = function (x, y) {
    let recurringTouchPos = {
        x: x,
        y: y
    };
    this.iTouchArray.push(recurringTouchPos);
};

SwipeDetector.prototype.updateSwipeDirection = function (x, y) {
    if (!this.app.gameRunning) return;

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

    if (degree < -110 || degree > 110) this.app.swipeDirection = "left";
    else if (degree > -110 && degree < -70) this.app.swipeDirection = "up";
    else if (degree > -70 && degree < 70) this.app.swipeDirection = "right";
    else if (degree > 70 && degree < 110) this.app.swipeDirection = "down";

    this.updateSwordSound();
};

SwipeDetector.prototype.updateSwordSound = function () {
    /*if (this.cSwordDirection !== this.app.swipeDirection) {
        if (this.app.swipeDirection === "left" || this.app.swipeDirection === "right") {
            console.log("FIRE", this.app.swipeDirection);
            this.app.fire('whipAudio');
        }
    }*/

    if (this.canFireWhip)
        if (this.cSwordDirection !== this.app.swipeDirection) {
            if (this.app.swipeDirection === "left" || this.app.swipeDirection === "right") {
                this.canFireWhip = false;
                //console.log("FIRE", this.app.swipeDirection);
                setTimeout(() => {
                    this.canFireWhip = true;
                }, 150);
                this.app.fire('whipAudio');
            }
        }

    this.cSwordDirection = this.app.swipeDirection;
};

var vectorMagnitude = function (p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
};

var vectorAngleDegree = function (p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
};
