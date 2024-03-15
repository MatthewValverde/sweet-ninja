var CollisionDetector = pc.createScript('collisionDetector');

CollisionDetector.prototype.initialize = function () {
    if (this.entity.rigidbody) {
        this.entity.collision.on('collisionstart', this.onCollisionStart, this);
    }
};

CollisionDetector.prototype.onCollisionStart = function (result) {
    if (result.other) {
        this.interactWith(result.other);
    }
};

CollisionDetector.prototype.interactWith = function (otherEntity) {
    if (this.app.gameRunning && otherEntity.script && otherEntity.script.splitObject) {
        if (!otherEntity.script.splitObject.hasSplit) this.app.fire('powermeter', otherEntity.script.splitObject.hasSplit);
    }

    otherEntity.destroy();
};
