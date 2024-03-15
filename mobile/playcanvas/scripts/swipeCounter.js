var SwipeCounter = pc.createScript('swipeCounter');

// Swipe directions
SwipeCounter.DIRECTION = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
    UP: 3,
    DOWN: 4
};

// initialize value
SwipeCounter.prototype.initialize = function () {
    this.swipeDirection = SwipeCounter.DIRECTION.NONE;

    this.app.on('touchDown', this.onMouseDown, this);
    this.app.on('touchMove', this.onMouseMove, this);
    this.app.on('touchUp', this.onMouseUp, this);

    /* if (this.app.touch) {
        // Add event listeners for the touch events
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    } else {
        // Add event listeners for the mouse events
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    } */
};

/* SwipeCounter.prototype.onTouchStart = function (event) {
    this.startPosition = event.touches[0];
    this.previousPosition = event.touches[0];
    event.event.preventDefault();
}; */

SwipeCounter.prototype.onMouseDown = function (event) {
    this.startPosition = event;
    this.previousPosition = event;
    // event.event.preventDefault();
};

/*SwipeCounter.prototype.onTouchEnd = function (event) {
       this.handleSwipeEnd(event.changedTouches[0]);
       event.event.preventDefault();
   }; */

SwipeCounter.prototype.onMouseUp = function (event) {
    this.handleSwipeEnd(event);
    // event.event.preventDefault();
};

SwipeCounter.prototype.onMouseMove = function (event) {
    this.handleSwipeMove(event);
    //event.event.preventDefault();
};

/* SwipeCounter.prototype.onTouchMove = function (event) {
    this.handleSwipeMove(event.touches[0]);
    event.event.preventDefault();
}; */

SwipeCounter.prototype.handleSwipeEnd = function (endPosition) {
    this.swipeDirection = SwipeCounter.DIRECTION.NONE;
    this.previousPosition = null;
};

SwipeCounter.prototype.handleSwipeMove = function (position) {
    if (!this.previousPosition || !this.app.gameRunning) return;
    var dx = position.x - this.previousPosition.x;
    var dy = position.y - this.previousPosition.y;
    this.previousPosition = position;

    // If the movement is larger in the x direction, it's a horizontal swipe
    var isHorizontal = Math.abs(dx) > Math.abs(dy);

    // Define a threshold for minimum swipe distance
    var minSwipeDistance = 3;

    if (isHorizontal) {
        if (Math.abs(dx) > minSwipeDistance) {
            var direction = dx > 0 ? SwipeCounter.DIRECTION.RIGHT : SwipeCounter.DIRECTION.LEFT;
            if (this.swipeDirection !== direction) {
                this.app.swipeCount++;
                this.swipeDirection = direction;
                //console.log('Swipes: ' + this.app.swipeCount, this.app.hitCount);
            }
        }
    } else {
        if (Math.abs(dy) > minSwipeDistance) {
            var direction = dy > 0 ? SwipeCounter.DIRECTION.DOWN : SwipeCounter.DIRECTION.UP;
            if (this.swipeDirection !== direction) {
                this.app.swipeCount++;
                this.swipeDirection = direction;
                //console.log('Swipes: ' + this.app.swipeCount, this.app.hitCount);
            }
        }
    }
};
