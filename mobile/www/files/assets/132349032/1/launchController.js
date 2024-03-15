var LaunchController = pc.createScript('launchController');

LaunchController.attributes.add('launchPowerups', { title: 'Launch Powerups', type: 'boolean', default: true });
LaunchController.attributes.add('speedUp', { title: 'Speed Up', type: 'boolean', default: true });
LaunchController.attributes.add('randomizeLaunchTime', { title: 'Randomize Launch Time', type: 'boolean', default: false });
LaunchController.attributes.add('launchTime', { title: 'Launch Time', type: 'number', default: 2 });
LaunchController.attributes.add('launchIntroTime', { title: 'Launch Intro Time', type: 'number', default: 3 });
LaunchController.attributes.add('minTime', { title: 'Minimum Time', type: 'number', default: 0.2 });
LaunchController.attributes.add('starPowerTime', { title: 'Star Power Time', type: 'number', default: 0.2 });
LaunchController.attributes.add('speedIncrement', { title: 'Speed Up Increment', type: 'number', default: 0.75 });
LaunchController.attributes.add('standardObjects', { title: 'Standard Objects', array: true, type: 'asset', assetType: 'template' });
LaunchController.attributes.add('starPowerObject', { title: 'Star Powerup Object', type: 'asset', assetType: 'template' });
LaunchController.attributes.add('explosionObject', { title: 'Explosion Powerup Object', type: 'asset', assetType: 'template' });
LaunchController.attributes.add('splitterObject', { title: 'Splitter Powerup Object', type: 'asset', assetType: 'template' });
LaunchController.attributes.add('splitterObjectClone', { title: 'Splitter Powerup Clone', type: 'asset', assetType: 'template' });
LaunchController.attributes.add('superSlashObject', { title: 'Super Slash Powerup Object', type: 'asset', assetType: 'template' });
LaunchController.attributes.add('negativeObject', { title: 'Negative Powerup Object', type: 'asset', assetType: 'template' });
LaunchController.attributes.add('speedCycle', { title: 'Cycle', type: 'number', default: 5 });
LaunchController.attributes.add('starPowerObjectCycle', { title: 'Star Powerup Cycle', type: 'number', default: 6 });
LaunchController.attributes.add('explosiveObjectCycle', { title: 'Explosion Powerup Cycle', type: 'number', default: 10 });
LaunchController.attributes.add('frenzyObjectCycle', { title: 'Frenzy Powerup Cycle', type: 'number', default: 10 });
LaunchController.attributes.add('splitterObjectCycle', { title: 'Splitter Powerup Cycle', type: 'number', default: 10 });
LaunchController.attributes.add('negativeObjectCycle', { title: 'Negative Powerup Cycle', type: 'number', default: 10 });
LaunchController.attributes.add('frenzyAmount', { title: 'Frenzy Amount', type: 'number', default: 10 });
LaunchController.attributes.add('scaleFactor', { title: 'Scale Factor', type: 'number', default: 1 });
LaunchController.attributes.add('boundries', { title: 'Boundries', type: 'number', default: 2 });

LaunchController.prototype.initialize = function () {
    this.app.on('frenzy', this.launchFrenzy, this);
    this.app.on('splitter', this.launchSplitter, this);
    this.app.on('initializationComplete', this.postInit, this);
    this.setVariables();
};

LaunchController.prototype.postInit = function () {
    this.app.observers.push(this);
};

LaunchController.prototype.setVariables = function () {
    this.firstLaunch = false;
    this.launchIntroCount = 0;
    this.launchCount = 1;
    this.initCount = 0;
    this.standardLaunchCount = this.randomInteger(0, 3);
    this.resetPowerups();
    this.yCoord = -1;
    this.zCoord = 4;
    this.introList = [];
    this.lt = this.launchTime * 1000;
    this.updateDT = 0;
    this.launchDT = -1;
    this.lastindex = -1;
    this.lastStandardX = 0;
};

LaunchController.prototype.launchIntro = function () {
    if (this.launchIntroTimer) {
        clearInterval(this.launchIntroTimer);
        this.launchIntroTimer = null;
    }

    let time = this.launchIntroTime * 1000;
    if (this.launchDT !== this.updateDT) {
        this.launchStandardObject(false, true, (this.launchIntroCount == 0) ? true : false);
        this.launchIntroCount++;
        if (this.launchIntroCount == 1) time = 1;
    }

    this.launchIntroTimer = setTimeout(() => {
        this.launchIntroTimer = null;
        this.launchIntro();
    }, time);

    this.launchDT = this.updateDT;
};

LaunchController.prototype.stopLaunchIntro = function () {
    if (this.launchIntroTimer) {
        clearInterval(this.launchIntroTimer);
        this.launchIntroTimer = null;
    }

    for (let i = this.introList.length - 1; i >= 0; i--) {
        if (this.introList[i]) {
            this.introList[i].destroy();
        }
    }
};

LaunchController.prototype.launch = function () {
    if (this.launchTimer) {
        clearInterval(this.launchTimer);
        this.launchTimer = null;
    }

    let time = this.lt;
    if (this.launchDT !== this.updateDT) {
        if (this.app.starpowerRunning) {
            this.launchStandardObject();
            time = this.starPowerTime * 1000;
        } else {
            if (!this.app.gameRunning) return;
            if (!this.triggerPowerups()) {
                this.launchStandardObject();
            }
            if ((this.launchCount % this.speedCycle === 0)) this.adjustSpeed();

            time = (this.randomizeLaunchTime) ? this.randomInteger(this.lt - 100, this.lt + 100) : this.lt;
        }
        this.launchCount++;
    }

    this.launchTimer = setTimeout(() => {
        this.launchTimer = null;
        this.launch();
    }, time);

    this.launchDT = this.updateDT;
};

LaunchController.prototype.triggerPowerups = function () {
    let pass = false;
    if (!this.launchPowerups) return pass;
    if (this.launchCount % this.starPowerOC === 0) {
        pass = (this.app.starpowerRunning) ? false : this.launchStarPowerdObject();
    }
    if (this.launchCount % this.explosiveOC === 0) {
        if (!this.app.starpowerRunning) this.launchObject(this.explosionObject);
    }
    if (this.launchCount % this.frenzyOC === 0) {
        if (!this.app.starpowerRunning) this.launchFrenzy(2);
    }
    if (this.launchCount % this.splitterOC === 0) {
        pass = (this.app.starpowerRunning) ? false : this.launchObject(this.splitterObject);
    }
    if (this.launchCount % this.negativeOC === 0) {
        if (!this.app.starpowerRunning) this.launchObject(this.negativeObject, 0);
    }
    if (pass) this.lastindex = -1;
    return pass;
};

LaunchController.prototype.resetPowerups = function () {
    this.starPowerOC = this.randomInteger(this.starPowerObjectCycle - 1, this.starPowerObjectCycle + 1);
    this.explosiveOC = this.randomInteger(this.explosiveObjectCycle - 1, this.explosiveObjectCycle + 1);
    this.frenzyOC = this.randomInteger(this.frenzyObjectCycle - 1, this.frenzyObjectCycle + 1);
    this.splitterOC = this.randomInteger(this.splitterObjectCycle - 1, this.splitterObjectCycle + 1);
    this.negativeOC = this.randomInteger(this.negativeObjectCycle - 1, this.negativeObjectCycle + 1);
};

LaunchController.prototype.adjustSpeed = function () {
    this.resetPowerups();

    if (!this.speedUp) return;

    this.lt = this.lt * this.speedIncrement;
    if (this.lt <= this.minTime * 1000) this.lt = this.minTime * 1000;
};

LaunchController.prototype.launchStandardObject = function (randomX = true, isIntro = false, isFirst = false) {
    let amountToLaunch = 1;

    if (isIntro) {
        amountToLaunch = 1;
    }
    else if (this.initCount < 3) {
        this.initCount++;
        amountToLaunch = this.initCount;
    }
    else {
        amountToLaunch = ((this.standardLaunchCount % 4) + 1);
        this.standardLaunchCount++;
    }

    for (let i = 0; i < amountToLaunch; i++) {
        let index = this.randomInteger(0, this.standardObjects.length - 1);
        while (this.lastindex == index) {
            index = this.randomInteger(0, this.standardObjects.length - 1);
        }
        this.lastindex = index;

        let introX = 0;
        let obj = this.standardObjects[index].resource.instantiate();
        let y = (isIntro) ? 3 : this.yCoord;
        let s = (isIntro) ? 2.5 : this.scaleFactor;
        obj.setLocalScale(s, s, s);
        obj.name = this.standardObjects[index].name;

        if (isIntro) {
            if (obj.script && obj.script.objectThrower) {
                obj.script.objectThrower.xSpeed = 1;
                obj.script.objectThrower.ySpeed = 0;
                let fm = new pc.Vec3(1, 0, 0);
                let tm = new pc.Vec3(this.randomFloat(-0.01, 0.01), 0, this.randomFloat(-0.03, 0.03));
                obj.script.objectThrower.forceMultiplier = fm;
                obj.script.objectThrower.torqueMultiplier = tm;
                obj.script.objectThrower.linearFactor = new pc.Vec3(1, 0, 0);
            }
            //this.introSplit(obj);
            this.introList.push(obj);
            introX = (this.introList.length > 1) ? this.introList[this.introList.length - 2].getLocalPosition().x - 4.5 : -4;
            if (this.introList[0].getLocalPosition().x > 10) {
                this.introList[0].destroy();
                this.introList.shift();
            }
        }
        else {
            this.checkForStarPower(obj);
        }
        //let x = (isIntro) ? ((isFirst) ? -2 : -6) : this.randomFloat(-this.boundries, this.boundries);
        let x = (isIntro) ? introX : this.randomFloat(-(this.boundries + 0.3), this.boundries + 0.3);
        if (!isIntro) {
            if (this.lastStandardX > 0 && x > 0) x = -(x);
            else if (this.lastStandardX < 0 && x < 0) x = -(x);
            // console.log(this.lastStandardX, x);
            this.lastStandardX = x;
        }
        obj.setLocalPosition(x, y, (isIntro) ? 0 : this.zCoord);
        setTimeout(() => { this.entity.addChild(obj); }, (i * this.randomInteger(300, 600)));
        //this.entity.addChild(obj);
        //obj.enabled = true;
    }
};

LaunchController.prototype.launchObject = function (objectToLaunch, customY = null) {
    if (!objectToLaunch) return false;
    let obj = objectToLaunch.resource.instantiate();
    obj.setLocalPosition(this.randomFloat(-this.boundries, this.boundries), (customY) ? customY : this.yCoord, this.zCoord);
    obj.setLocalScale(this.scaleFactor, this.scaleFactor, this.scaleFactor);
    obj.name = objectToLaunch.name;
    this.entity.addChild(obj);
    obj.enabled = true;
    this.checkForStarPower(obj);
    return true;
};

LaunchController.prototype.launchStarPowerdObject = function () {
    if (!this.starPowerObject) return false;
    for (let i = 0; i < 5; i++) {
        let obj = this.starPowerObject.resource.instantiate();
        obj.setLocalPosition(((i * 0.7) - this.boundries) - 0.2, this.yCoord, this.zCoord);
        obj.setLocalScale(this.scaleFactor, this.scaleFactor, this.scaleFactor);
        obj.name = this.starPowerObject.name + i;
        this.entity.addChild(obj);
        obj.enabled = true;
        this.checkForStarPower(obj);
    }
    return true;
};

LaunchController.prototype.launchFrenzy = function (side = 0) {
    for (let i = 0; i < this.standardObjects.length; i++) {
        for (let j = 0; j < this.frenzyAmount; j++) {
            let obj = this.standardObjects[i].resource.instantiate();
            if (obj.script && obj.script.objectThrower) {
                let xSpeed = (side == 1) ? this.randomFloat(-1.5, 1.5) : 0;
                let ySpeed = (side == 0) ? this.randomFloat(3, 4.8) : 0;
                obj.script.objectThrower.xSpeed = xSpeed;
                obj.script.objectThrower.ySpeed = ySpeed;
                let fm = new pc.Vec3(0, 2.5, 0);
                let tm = new pc.Vec3(this.randomFloat(0.01, 0.1), this.randomFloat(0.01, 0.1), this.randomFloat(0.01, 0.1));
                obj.script.objectThrower.forceMultiplier = fm;
                obj.script.objectThrower.torqueMultiplier = tm;
            }

            obj.setLocalPosition(this.randomFloat(-3, 3), (side == 0) ? this.yCoord : 10, this.zCoord);
            //obj.name = this.standardObjects[i].name + i;
            obj.setLocalScale(this.scaleFactor, this.scaleFactor, this.scaleFactor);
            setTimeout(() => { this.entity.addChild(obj); }, ((i * 100) * (j + 1)));
            //obj.enabled = true;
            //this.checkForStarPower(obj);
        }
    }
    return true;
};

LaunchController.prototype.launchSplitter = function (pos) {
    let p = pos.clone();
    let randomAmount = this.randomInteger(1, 3);
    for (let i = 0; i < randomAmount; i++) {
        setTimeout(() => {
            let obj = this.splitterObjectClone.resource.instantiate();
            if (obj.script && obj.script.objectThrower) {
                obj.script.objectThrower.xSpeed = this.randomFloat(-1.5, 1.5);
                obj.script.objectThrower.ySpeed = this.randomFloat(1, 2);
                let fm = new pc.Vec3(this.randomFloat(0.5, 2), this.randomFloat(0.5, 2), 0);
                let tm = new pc.Vec3(this.randomFloat(0.01, 0.1), this.randomFloat(0.01, 0.1), this.randomFloat(0.01, 0.1));
                obj.script.objectThrower.forceMultiplier = fm;
                obj.script.objectThrower.torqueMultiplier = tm;
            }
            obj.setLocalPosition(p);
            obj.setLocalScale(this.scaleFactor, this.scaleFactor, this.scaleFactor);
            this.entity.addChild(obj);
            obj.enabled = true;
        }, 500);
    }
};

LaunchController.prototype.splitAllObjects = function () {
    for (let i = 0; i < this.entity.children.length; i++) {
        let child = this.entity.children[i];
        if (child.script && child.script.splitObject) {
            child.script.splitObject.split(null, true);
        }
    }
};

LaunchController.prototype.checkForStarPower = function (obj) {
    if (!this.app.starpowerRunning) return;
    if (obj.script && obj.script.splitObject) {
        obj.script.splitObject.autoSplit();
    }
};

LaunchController.prototype.introSplit = function (obj) {
    if (obj.script && obj.script.splitObject) {
        obj.script.splitObject.autoSplit();
    }
};

LaunchController.prototype.randomInteger = function (min, max) {
    return this.app.random.integer(min, max);
    // return Math.floor(Math.random() * (max - min + 1)) + min;
};

LaunchController.prototype.randomFloat = function (min, max) {
    return this.app.random.real(min, max, true);
    //return Math.random() * (max - min) + min;
};

LaunchController.prototype.updateFrame = function (dt) {
    this.updateDT += dt;
};
