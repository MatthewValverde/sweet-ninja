var ContainerThrower = pc.createScript('containerThrower');

ContainerThrower.attributes.add('newParent', { type: 'entity', title: 'New Parent' });

ContainerThrower.attributes.add('entities', {
    type: 'json',
    array: true,
    schema: [
        {
            name: 'object',
            type: 'entity'
        }, {
            name: 'speed',
            type: 'vec3',
            default: [3, 3, 3]
        }, {
            name: 'force',
            type: 'vec3',
            default: [3, 3, 3]
        }, {
            name: 'torque',
            type: 'vec3',
            default: [0.05, 0.05, 0.05]
        }
    ]
});

ContainerThrower.attributes.add('randomizePower', { type: 'boolean', title: 'Randomize Power' });


ContainerThrower.prototype.initialize = function () {
    this.hasThrown = false;
};

ContainerThrower.prototype.throwContainerObjects = function () {
    if (this.hasThrown) return;
    this.hasThrown = true;
    this.app.containerParent.setLocalPosition(this.entity.getLocalPosition());
    for (let i = 0; i < this.entities.length; i++) {
        let obj = this.entities[i].object;
        obj.reparent(this.app.containerParent);
        obj.collision.enabled = true;
        obj.rigidbody.enabled = true;

        let speedX = (this.randomizePower) ? this.randomFloat(-this.entities[i].speed.x, this.entities[i].speed.x) : this.entities[i].speed.x;
        let forceX = (this.randomizePower) ? this.randomFloat(0, this.entities[i].force.x) : this.entities[i].force.x;
        let speedY = (this.randomizePower) ? this.randomFloat(-this.entities[i].speed.y, this.entities[i].speed.y) : this.entities[i].speed.y;
        let forceY = (this.randomizePower) ? this.randomFloat(0, this.entities[i].force.y) : this.entities[i].force.y;
        let speedZ = (this.randomizePower) ? this.randomFloat(-this.entities[i].speed.z, this.entities[i].speed.z) : this.entities[i].speed.z;
        let forceZ = (this.randomizePower) ? this.randomFloat(0, this.entities[i].force.z) : this.entities[i].force.z;
        let torqueX = (this.randomizePower) ? this.randomFloat(0, this.entities[i].torque.x) : this.entities[i].torque.x;
        let torqueY = (this.randomizePower) ? this.randomFloat(0, this.entities[i].torque.y) : this.entities[i].torque.y;
        let torqueZ = (this.randomizePower) ? this.randomFloat(0, this.entities[i].torque.z) : this.entities[i].torque.z;

        obj.rigidbody.applyImpulse(speedX * forceX, speedY * forceY, speedZ * forceZ);
        obj.rigidbody.applyTorqueImpulse(torqueX, torqueY, torqueZ);
    }
};

ContainerThrower.prototype.randomFloat = function (min, max) {
    return this.app.random.real(min, max, true);
    //return Math.random() * (max - min) + min;
};