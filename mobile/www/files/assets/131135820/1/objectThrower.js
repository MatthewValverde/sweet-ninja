var ObjectThrower = pc.createScript('objectThrower');

ObjectThrower.attributes.add('xSpeed', { type: 'number', default: 0 });
ObjectThrower.attributes.add('ySpeed', { type: 'number', default: 0 });
ObjectThrower.attributes.add('zAdd', { type: 'number', default: 0 });
ObjectThrower.attributes.add('forceMultiplier', { type: 'vec3', default: [1, 1, 1] });
ObjectThrower.attributes.add('torqueMultiplier', { type: 'vec3', default: [0, 0, 0] });
ObjectThrower.attributes.add('linearFactor', { type: 'vec3', default: [1, 1, 1] });
ObjectThrower.attributes.add('angularFactor', { type: 'vec3', default: [1, 1, 1] });
ObjectThrower.attributes.add('throwOnLaunch', { type: 'boolean', title: 'Throw On Launch', default: true });

// initialize code called once per entity
ObjectThrower.prototype.initialize = function () {
    if (this.throwOnLaunch) this.throwObject();
};

ObjectThrower.prototype.init = function () {
    //return;
    setTimeout(() => {
        this.throwObject();
    }, 100);
};

ObjectThrower.prototype.throwObject = function () {
    this.throwThis(this.xSpeed, this.ySpeed, this.zAdd);
};

ObjectThrower.prototype.throwThis = function (x, y, z) {
    let rig = this.entity.rigidbody;
    let impulseForce = new pc.Vec3(x * this.forceMultiplier.x, y * this.forceMultiplier.y, (-y * this.forceMultiplier.z) + z);
    rig.linearFactor = this.linearFactor;
    rig.angularFactor = this.angularFactor;
    rig.applyImpulse(impulseForce);
    rig.applyTorqueImpulse(this.torqueMultiplier.x, this.torqueMultiplier.y, this.torqueMultiplier.z);
};
