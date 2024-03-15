var PulseTween = pc.createScript('pulseTween');

PulseTween.prototype.initialize = function () {
    setTimeout(() => {
        this.entity
            .tween(this.entity.getLocalScale())
            .to(new pc.Vec3(1.15, 1.15, 1), 1.5, pc.SineOut)
            .loop(true)
            .yoyo(true)
            .start();
    }, 1000);
};
