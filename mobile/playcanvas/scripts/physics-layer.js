var PhysicsLayer = pc.createScript('physicsLayer');

PhysicsLayer.attributes.add('groupA', {type: 'boolean', default: false, title: 'Group A'});
PhysicsLayer.attributes.add('groupB', {type: 'boolean', default: false, title: 'Group B'});
PhysicsLayer.attributes.add('groupC', {type: 'boolean', default: false, title: 'Group C'});
PhysicsLayer.attributes.add('groupD', {type: 'boolean', default: false, title: 'Group D'});

PhysicsLayer.attributes.add('maskAll', {type: 'boolean', default: true, title: 'Mask All'});
PhysicsLayer.attributes.add('maskA', {type: 'boolean', default: false, title: 'Mask A'});
PhysicsLayer.attributes.add('maskB', {type: 'boolean', default: false, title: 'Mask B'});
PhysicsLayer.attributes.add('maskC', {type: 'boolean', default: false, title: 'Mask C'});
PhysicsLayer.attributes.add('maskD', {type: 'boolean', default: false, title: 'Mask D'});

// initialize code called once per entity
PhysicsLayer.prototype.initialize = function() {
    var body = this.entity.rigidbody;
    
    // Groups
    if (this.groupA) {
        body.group |= (1 << 10);
    }

    if (this.groupB) {
        body.group |= (1 << 11);
    }

    if (this.groupC) {
        body.group |= (1 << 12);
    }

    if (this.groupD) {
        body.group |= (1 << 13);
    }
    
    // Masks
    // Reset the mask to 0 so that the engine defaults aren't used
    body.mask = pc.BODYGROUP_TRIGGER;
    
    if (this.maskAll) {
        body.mask |= (pc.BODYMASK_ALL);
    }
    
    if (this.maskA) {
        body.mask |= (pc.BODYGROUP_USER_1);
    }

    if (this.maskB) {
        body.mask |= (pc.BODYGROUP_USER_2);
    }

    if (this.maskC) {
        body.mask |= (pc.BODYGROUP_USER_3);
    }

    if (this.maskD) {
        body.mask |= (pc.BODYGROUP_USER_4);
    }
};
