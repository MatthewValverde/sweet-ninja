var SplitObject = pc.createScript('splitObject');

SplitObject.attributes.add('type', {
    type: 'string',
    default: 'standard',
    title: 'point type',
    enum: [
        { 'standard': 'standard' },
        { 'starpower': 'starpower' },
        { 'explosion': 'explosion' },
        { 'frenzy': 'frenzy' },
        { 'splitter': 'splitter' },
        { 'negative': 'negative' },
        { 'superslash': 'superslash' },
        { 'macaroon': 'macaroon' }
    ]
});

SplitObject.attributes.add('sound', {
    type: 'string',
    default: 'donut',
    title: 'sound type',
    enum: [
        { 'donut': 'donutAudio' },
        { 'cannoli': 'cannoliAudio' },
        { 'cookie': 'cookieAudio' },
        { 'cupcake': 'cupcakeAudio' },
        { 'croissant': 'croissantAudio' },
        { 'starcookie': 'starcookieAudio' },
        { 'glass': 'glassAudio' },
        { 'negative': 'negativeAudio' },
        { 'rocket': 'rocketAudio' },
        { 'macaroon': 'macaroonAudio' }
    ]
});

SplitObject.attributes.add('entities', {
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

SplitObject.attributes.add('wholeObject', { type: 'entity', title: 'Whole Object' });

SplitObject.attributes.add('randomizePower', { type: 'boolean', title: 'Randomize Power' });

SplitObject.attributes.add('hasSplatFX', { type: 'boolean', title: 'Has Splat FX', default: true });

SplitObject.attributes.add('entitiesToShutOff', { type: 'entity', title: 'Entities To Shut Off', array: true });

SplitObject.prototype.initialize = function () {
    this.hasSplit = false;
    this.autoSplitSet = false;
    this.app.on('fireStarpower', this.fireStarpower, this);
};

SplitObject.prototype.autoSplit = function () {
    this.autoSplitSet = true;
    setTimeout(() => {
        this.split(null, true);
    }, 1250);
};

SplitObject.prototype.split = function (e, isPartOfExplosion = false) {
    if (this.hasSplit) return;

    this.hasSplit = true;

    if (this.type === 'negative') {
        if (isPartOfExplosion || this.autoSplitSet) {
            return;
        }
    }

    if (isPartOfExplosion) {
        this.type = 'standard'
        this.sound = 'donutAudio';
    }

    if (this.type === 'starpower') {
        this.app.fire('starpowerFired', e);
    } else if (this.type === 'negative') {
        if (this.autoSplit) this.app.fire('negativeFired', e);
    } else if (this.type === 'explosion') {
        if (this.autoSplit) this.app.fire('explosionFired');
    }

    this.app.fire('sliceAudio');

    this.app.fire(this.sound);

    this.app.fire('score', this.type, e);

    this.app.fire('powermeter', this.hasSplit);

    this.app.fire(this.type, this.entity.getLocalPosition());

    if (this.entity.particlesystem) this.entity.particlesystem.play();
    for (let i = 0; i < this.entities.length; i++) {
        let obj = this.entities[i].object;
        obj.enabled = true;
        let speedX = (this.randomizePower) ? this.randomFloat(-this.entities[i].speed.x, this.entities[i].speed.x) : this.entities[i].speed.x;
        let forceX = (this.randomizePower) ? this.randomFloat(0, this.entities[i].force.x) : this.entities[i].force.x;
        let speedY = (this.randomizePower) ? this.randomFloat(-this.entities[i].speed.y, this.entities[i].speed.y) : this.entities[i].speed.y;
        let forceY = (this.randomizePower) ? this.randomFloat(0, this.entities[i].force.y) : this.entities[i].force.y;
        let speedZ = (this.randomizePower) ? this.randomFloat(-this.entities[i].speed.z, this.entities[i].speed.z) : this.entities[i].speed.z;
        let forceZ = (this.randomizePower) ? this.randomFloat(0, this.entities[i].force.z) : this.entities[i].force.z;
        let torqueX = (this.randomizePower) ? this.randomFloat(0, this.entities[i].torque.x) : this.entities[i].torque.x;
        let torqueY = (this.randomizePower) ? this.randomFloat(0, this.entities[i].torque.y) : this.entities[i].torque.y;
        let torqueZ = (this.randomizePower) ? this.randomFloat(0, this.entities[i].torque.z) : this.entities[i].torque.z;

        if (obj.collision) obj.collision.enabled = true;
        if (obj.rigidbody) {
            obj.rigidbody.enabled = true;
            obj.rigidbody.applyImpulse(speedX * forceX, speedY * forceY, speedZ * forceZ);
            obj.rigidbody.applyTorqueImpulse(torqueX, torqueY, torqueZ);
        }

        if (this.hasSplatFX && this.entity.rigidbody) {
            this.entity.rigidbody.enabled = false;
            this.entity.rigidbody.applyImpulse(0, 0, 0);
            this.entity.rigidbody.applyTorqueImpulse(0, 0, 0);
        }

        if (this.entitiesToShutOff) {
            for (let j = 0; j < this.entitiesToShutOff.length; j++) {
                this.entitiesToShutOff[j].enabled = false;
            }
        }

        if (obj.particlesystem) obj.particlesystem.play();
    }

    this.playChildrenParticles(this.entity);

    if (this.wholeObject) {
        this.wholeObject.enabled = false;
    }

    if (this.entity.script && this.entity.script.containerThrower) {
        this.entity.script.containerThrower.throwContainerObjects();
    }
};

SplitObject.prototype.playChildrenParticles = function (obj) {
    for (let i = 0; i < obj.children.length; i++) {
        let child = obj.children[i];
        if (child.particlesystem) {
            child.particlesystem.play();
        }
        this.playChildrenParticles(child);
    }
};

SplitObject.prototype.fireStarpower = function () {
    if (this.autoSplitSet) return;
    this.split(null, true);
};

SplitObject.prototype.randomFloat = function (min, max) {
    return this.app.random.real(min, max, true);
    //return Math.random() * (max - min) + min;
};
