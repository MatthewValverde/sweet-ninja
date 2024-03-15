var GameController = pc.createScript('gameController');

GameController.attributes.add('standardPoints', { type: 'number', title: 'Standard Points', default: 5 });
GameController.attributes.add('starpowerPoints', { type: 'number', title: 'Starpower Points', default: 10 });
GameController.attributes.add('explosionPoints', { type: 'number', title: 'explosionPoints', default: 15 });
GameController.attributes.add('frenzyPoints', { type: 'number', title: 'frenzyPoints', default: 20 });
GameController.attributes.add('splitterPoints', { type: 'number', title: 'splitter Points', default: 10 });
GameController.attributes.add('negativePoints', { type: 'number', title: 'Negative Points', default: -40 });
GameController.attributes.add('superslashPoints', { type: 'number', title: 'Superslash Points', default: 10 });
GameController.attributes.add('macaroonPoints', { type: 'number', title: 'Macaroon Points', default: 10 });
GameController.attributes.add('starPowerActiveDuration', { type: 'number', title: 'StarPower Active Duration', default: 10 });

GameController.attributes.add('powerMeter', { type: 'entity', title: 'Power Meter Arm' });
GameController.attributes.add('starMeter', { type: 'entity', title: 'Star Meter' });
GameController.attributes.add('starpowerPopup', { type: 'entity', title: 'StarPower Popup' });
GameController.attributes.add('starpowerLoadedPopup', { type: 'entity', title: 'StarPower Loaded Popup' });
GameController.attributes.add('starpowerActivePopup', { type: 'entity', title: 'StarPower Active Popup' });
GameController.attributes.add('starpowerButton', { type: 'entity', title: 'StarPower Button' });
GameController.attributes.add('negativePopup', { type: 'entity', title: 'Negative Popup' });
GameController.attributes.add('negativePopupText', { type: 'entity', title: 'Negative Popup Text' });
GameController.attributes.add('combo', { type: 'entity', title: 'Combo' });
GameController.attributes.add('comboText', { type: 'entity', title: 'Combo Text' });
GameController.attributes.add('comboString', { type: 'string', title: 'Combo Description', default: '' });

GameController.attributes.add('playText', { type: 'entity', title: 'Play Text' });
GameController.attributes.add('logoSprite', { type: 'entity', title: 'Logo Sprite' });
GameController.attributes.add('scoreText', { type: 'entity', title: 'Score Text' });
GameController.attributes.add('timeText', { type: 'entity', title: 'Time Text' });
GameController.attributes.add('gameOverScoreText', { type: 'entity', title: 'Game Over Score Text' });
GameController.attributes.add('loadScreen', { type: 'entity', title: 'Load Screen' });
GameController.attributes.add('launchController', { type: 'entity', title: 'Launch Controller' });
GameController.attributes.add('ui', { type: 'entity', title: 'UI Screen' });
GameController.attributes.add('enviroBack', { type: 'entity', title: 'Enviro Back' });
GameController.attributes.add('containerParent', { type: 'entity', title: 'Container Parent' });
GameController.attributes.add('splatParticles', { type: 'asset', assetType: 'template', title: 'Splat Particles', array: true });
GameController.attributes.add('starParticles', { type: 'entity', title: 'Star Particles' });
GameController.attributes.add('animatePoints', { type: 'boolean', title: 'Animate Points', default: true });
GameController.attributes.add('floatingTextParent', { type: 'entity', title: 'Floating Text Parent' });
GameController.attributes.add('floatingTextTarget', { type: 'entity', title: 'Floating Text Target' });
GameController.attributes.add('floatingTextColor', { type: 'rgba', title: 'Floating Text Color', default: [1, 1, 1, 1] });
GameController.attributes.add('font', { type: 'asset', assetType: 'font' });
GameController.attributes.add('hitPercentageText', { type: 'entity', title: 'Hit Percentage Text' });
GameController.attributes.add('thanksText', { type: 'entity', title: 'Thanks Text' });
GameController.attributes.add('endTitleImage', { type: 'entity', title: 'End Title Image' });
GameController.attributes.add('fade', { type: 'entity', title: 'Fade' });

GameController.prototype.initialize = function () {
    console.log("version:", "1.1");
    this.app.addTweenManager();
    this.app.gameController = this;
    this.app.observers = [];
    this.app.on('settingsLoaded', this.loadAssets, this);
    this.app.on('stateSet', this.checkState, this);
    this.app.on('initializationComplete', this.postInit, this);
    this.app.on('resetGame', this.resetGame, this);
    this.app.on('startGame', this.startGame, this);
    this.app.on('score', this.scoreGame, this);
    this.app.on('powermeter', this.powerMeterHandler, this);
    this.app.on('negativeFired', this.negativeHandler, this);
    this.app.on('starpowerFired', this.starPowerHandler, this);
    this.app.on('explosionFired', this.explosionHandler, this);
    this.app.on('fireStarpower', this.fireStarpower, this);
    this.app.on('timer_playing', this.getPlayingTimer, this);
    if (this.containerParent) {
        this.app.containerParent = this.containerParent;
    }

    setTimeout(() => {
        this.tweenPopupQueueTicker();
    }, 500);
    this.starMeterFullWidth = this.starMeter.element.width;

    this.setVariables();
};

GameController.prototype.setVariables = function () {
    this.app.controller.selfRanStates = true;
    this.app.gameRunning = false;
    this.app.swipeLock = false;
    this.app.starpowerRunning = false;
    this.app.swipeCount = 1; //0; // If no swipes are recorded, at least have 1. 9/25/2023
    this.app.hitCount = 0;
    this.currentSwipeDirection = '';
    this.comboCount = 0;
    this.starPowerCount = 0;
    this.comboArray = [];
    this.app.score = 0;
    this.app.volume = 1;
    this.starMeter.element.width = 0;
    this.currentStarPowerPercent = 0;
    this.powerMeterScoreKeeper = 0;
    this.app.starpowerRunning = false;
    this.starpowerButton.enabled = false;
    this.starPowerLoaded = false;
    this.app.canPress = true;
    this.powerMeterGameOver = false;
    this.logoSprite.enabled = false;
    this.hitPercentageText.enabled = false;
    if (this.gameOverScoreText) this.gameOverScoreText.enabled = false;
    this.thanksText.enabled = false;
    this.app.systems.sound.volume = this.app.volume;
    this.app.splatParticles = this.splatParticles;
    this.comboPause = false;
    this.scoreAnimateUpdate = 0;
    this.starPowerLoaded = false;
    this.gameEnded = false;
    this.tweenList = [];
    if (this.fade) this.fade.enabled = false;
    if (!this.app.random) {
        this.app.controller.setRandomSeed();
    }
    this.createPopupQueue = [];
    if (this.scoreText) this.scoreText.element.text = "0";
};

GameController.prototype.onFrameRender = function () {
    var currentTime = Date.now();
    var dt = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    for (let i = 0; i < this.app.observers.length; i++) {
        this.app.observers[i].updateFrame(dt);
    }
};

GameController.prototype.tweenPopupQueueTicker = function () {
    if (this.createPopupQueue.length > 0) {
        this.tweenPopup(this.createPopupQueue[0]);
        this.createPopupQueue.shift();
    }

    setTimeout(() => {
        this.tweenPopupQueueTicker();
    }, 500);
};

GameController.prototype.postInit = function () {
    setTimeout(() => {
        if (this.loadScreen) this.loadScreen.enabled = false;
    }, 2000);

    if (this.launchController) this.launchController.script.launchController.launchIntro();
};

GameController.prototype.getPlayingTimer = function (time) {
    if (time == 0) {
        this.starpowerButton.enabled = false;
        this.waitForStarPowerToFinish();
    }
};

GameController.prototype.waitForStarPowerToFinish = function () {
    this.app.gameRunning = false;
    if (this.app.starpowerRunning) {
        setTimeout(() => {
            this.waitForStarPowerToFinish();
        }, 1000);
        return;
    }

    this.gameEnded = true;
    let percentage = Math.floor((this.app.hitCount / this.app.swipeCount) * 100);
    setTimeout(() => {
        this.increasePoints(percentage, percentage + "%\nAccuracy");
    }, 1000);

    setTimeout(() => {
        this.tweenPopup(this.thanksText, false, false, 1);
    }, 1200);
    setTimeout(() => {
        this.waitForScoreToFinish();
    }, 3000);
};

GameController.prototype.waitForScoreToFinish = function () {
    if (this.scoreAnimateUpdate <= 0 && !this.app.starpowerRunning) {
        this.thanksText.tween(this.thanksText.getLocalScale()).to(new pc.Vec3(0, 0, 1), 0.5, pc.QuadraticIn).on('complete', () => {
            this.app.controller.forceSetState("gameover");
        }
        ).start();
    } else {
        setTimeout(() => {
            this.waitForScoreToFinish();
        }, 1000);
    }
};

GameController.prototype.checkState = function () {
    switch (this.app.stateName) {
        case "intro":
            break;
        case "playing":
            this.app.gameRender.startRecording();
            this.app.score = 0;
            this.app.canReset = true;
            this.app.controller.sendMessage({
                event: "game_action",
                data: {
                    "name": "game_start"
                }
            });
            this.startGame();
            this.app.fire('startAudio');
            this.app.controller.selfRanStates = false;
            break;
        case "gameover":
            if (this.gameOverScoreText) this.gameOverScoreText.enabled = true;
            this.tweenPopupIn(this.endTitleImage, 0, -100);
            this.logoSprite.enabled = false;
            this.app.gameRunning = false;
            this.app.controller.sendScore(this.app.score);
            this.app.endScreen.start();
            this.app.gameRender.stopRecording();
            break;
    }
};

GameController.prototype.loadAssets = function () {
    this.app.videosLoadedResolver();
    this.app.assetsLoadedResolver();

    this.combo.enabled = false;
    this.starpowerPopup.enabled = false;
    this.negativePopup.enabled = false;
    this.starpowerButton.enabled = false;
    this.starpowerActivePopup.enabled = false;
};

GameController.prototype.resetGame = function () {
    this.setVariables();
    if (this.launchController) {
        this.launchController.script.launchController.setVariables();
        this.launchController.script.launchController.launchIntro();
    }
    this.app.controller.forceSetState("intro");
};

GameController.prototype.startGame = function () {
    this.app.gameRunning = true;
    if (this.enviroBack) this.enviroBack.render.receiveShadows = true;
    if (this.launchController) {
        this.launchController.script.launchController.stopLaunchIntro();
        this.launchController.script.launchController.launch();
    }
    if (this.playText) {
        this.tweenPopup(this.playText);
    }
    this.app.lowPassFilter.startUp();
    this.app.lowPassFilter.toggleLowPass(false, 3);
};

GameController.prototype.showLogo = function () {
    this.playText.enabled = false;
    this.logoSprite.enabled = true;
};

GameController.prototype.powerMeterHandler = function (value) {
    if (this.app.starpowerRunning || this.powerMeterInUse) return;
    this.powerMeterInUse = true;
    let rotZ = Math.round(this.powerMeter.getLocalEulerAngles().z);
    if (value) {
        this.powerMeterScoreKeeper += 5;
        rotZ -= 5;
    } else {
        this.powerMeterScoreKeeper -= 5;
        rotZ += 5;
    }

    if (this.powerMeterScoreKeeper > 90) {
        this.powerMeterScoreKeeper = 90;
        rotZ = -180;
    } else if (this.powerMeterScoreKeeper < -90) {
        this.powerMeterScoreKeeper = -90;
        rotZ = 0;
    }

    this.powerMeter.tween(this.powerMeter.getLocalEulerAngles()).rotate({ x: 0, y: 0, z: rotZ }, 0.5, pc.ElasticOut
    ).on('complete', () =>
        this.powerMeterLowCheck(this.powerMeterScoreKeeper)
    ).start();
};

GameController.prototype.powerMeterLowCheck = function (value) {
    if (value == -90) {
        if (this.powerMeterGameOver) return;
        this.powerMeterGameOver = true;
        this.app.controller.forceSetState("gameover");
    }
    this.powerMeterInUse = false;
};

GameController.prototype.starPowerHandler = function (e) {
    if (this.app.starpowerRunning) return;
    this.starPowerCount++;
    if (this.starPowerTimer) clearInterval(this.starPowerTimer);
    this.starPowerTimer = setTimeout(() => {
        if (this.starPowerCount == 5) {
            this.increaseStarPower(0.35);
            this.starpowerPopup.setLocalPosition(0, 0, 0);
            this.createPopupQueue.push(this.starpowerPopup);
            this.starPowerTimer = null;
            this.app.fire('starAddAudio');
        }
        this.starPowerCount = 0;
    }, 500);
};

GameController.prototype.explosionHandler = function () {
    if (this.app.starpowerRunning) return;
    if (this.launchController) this.launchController.script.launchController.splitAllObjects();
};

GameController.prototype.negativeHandler = function (e) {
    if (this.app.starpowerRunning) return;
    this.comboPause = true;
    this.app.fire('camera_shake');
    let x = this.getAdjustedPos(e).x;
    let y = this.getAdjustedPos(e).y;
    this.negativePopup.setLocalPosition(x, y, 0);
    this.negativePopupText.element.text = this.negativePoints;
    this.tweenPopup(this.negativePopup, true, true);
    this.increaseStarPower(-0.25);
    setTimeout(() => { this.comboPause = false; }, 500);
};

GameController.prototype.scoreGame = function (type, e) {
    switch (type) {
        case "standard":
            this.increasePoints(this.standardPoints);
            if (e) this.lookForCombo(type, e);
            break;
        case "starpower":
            this.increasePoints(this.starpowerPoints);
            break;
        case "explosion":
            this.increasePoints(this.explosionPoints);
            break;
        case "frenzy":
            this.increasePoints(this.frenzyPoints);
            break;
        case "splitter":
            this.increasePoints(this.splitterPoints);
            break;
        case "negative":
            setTimeout(() => { this.increasePoints(this.negativePoints); }, 1300);
            break;
        case "superslash":
            this.increasePoints(this.superslashPoints);
            if (e) this.lookForCombo(type, e);
            break;
        case "macaroon":
            this.increasePoints(this.macaroonPoints);
            if (e) this.lookForCombo(type, e);
            break;
    }
};

GameController.prototype.lookForCombo = function (type, e) {
    if (this.app.starpowerRunning) return;
    switch (type) {
        case "standard":
            if (this.comboPause) return;
            this.comboCount++;
            if (this.comboCount == 1) {
                this.comboTimer = setTimeout(() => { this.comboPointsHandler(e); }, 300);
            }
            break;
        case "starpower":

            break;
    }
};

GameController.prototype.comboPointsHandler = function (e) {
    if (this.comboCount > 1) {
        this.comboPause = true;
        this.showComboText(this.comboCount, e);
        let increaseAmount = 0.1 * (this.comboCount - 1)
        this.increaseStarPower(increaseAmount);
        if (this.comboCount > 2) {
            setTimeout(() => {
                this.createPopupQueue.push(this.starpowerPopup);
                this.app.fire('starAddAudio');
            }, 750);
        }
        setTimeout(() => { this.comboPause = false; }, 250);
    } else {
        this.comboPause = false;
    }
    this.comboCount = 0;
    this.comboTimer = null;
};

GameController.prototype.showComboText = function (count, e) {
    let x = this.getAdjustedPos(e).x;
    let y = this.getAdjustedPos(e).y;
    this.comboText.element.text = "x " + count;
    this.combo.setLocalPosition(0, 300, 0);
    this.tweenPopup(this.combo);
    let points = (this.standardPoints * (count - 1)) * count;
    this.increasePoints(points);
    this.app.fire('comboAudio');
};

GameController.prototype.getAdjustedPos = function (e) {
    let scale = 1 / this.ui.element.screen.screen.scale;
    let device = this.app.graphicsDevice;
    let xOffs = this.ui.element.anchor.x * device.width;
    let yOffs = this.ui.element.anchor.y * device.height;
    return new pc.Vec2((e.x - xOffs) * scale, (-e.y + yOffs) * scale);
};

GameController.prototype.increasePoints = function (points, label = null) {
    if (points > this.standardPoints) {
        this.createFloatingText(points, label);
    } else {
        this.animatePointsHandler(points, (this.app.starpowerRunning) ? false : true);
    }
};

GameController.prototype.animatePointsHandler = function (points, animate = true) {
    if (!animate || points < 0) {
        this.app.score += points;
        if (this.scoreText) {
            this.scoreText.element.text = this.app.score.toString();
        }
    } else {
        this.scoreAnimateUpdate += points;
    }
};

GameController.prototype.increaseStarPower = function (percent) {
    if (this.app.starpowerRunning) return;
    this.currentStarPowerPercent += percent;
    if (this.currentStarPowerPercent > 1) this.currentStarPowerPercent = 1;
    else if (this.currentStarPowerPercent < 0) this.currentStarPowerPercent = 0;
    this.starMeter.element.width = this.starMeterFullWidth * this.currentStarPowerPercent;
    if (this.currentStarPowerPercent == 1) {
        this.starpowerButton.enabled = true;
        if (!this.starPowerLoaded) {
            //this.tweenPopup(this.starpowerLoadedPopup);
            this.createPopupQueue.push(this.starpowerLoadedPopup);
            this.app.fire('starAudio');
        }
        this.starPowerLoaded = true;
    } else {
        this.starpowerButton.enabled = false;
        this.starPowerLoaded = false;
    }
};

GameController.prototype.tweenPopup = function (entity, scaleToZero = true, shake = false, repeat = 2, delayToZero = 0) {
    if (this.tweenList[entity.name]) return;
    entity.enabled = true;
    this.tweenList[entity.name] = entity.tween(entity.getLocalScale()).to(new pc.Vec3(1.4, 1.4, 1), 1.5, pc.QuadraticOut).yoyo(true).repeat(repeat).on('complete', () =>
        entity.tween(entity.getLocalScale()).to(new pc.Vec3((scaleToZero) ? 0 : 1.5, (scaleToZero) ? 0 : 1.5, 1), 0.5, pc.QuadraticIn, delayToZero).on('complete', () => {
            this.tweenList[entity.name] = null;
            entity.enabled = (scaleToZero) ? false : true;
        }
        ).start()
    ).start();

    if (shake) {
        entity.setLocalPosition(entity.getLocalPosition().x - 25, entity.getLocalPosition().y, 0);
        let rp = entity.getLocalPosition();
        entity.setLocalEulerAngles(0, 0, -5);
        let ea = entity.getLocalEulerAngles();

        let t = this.floatingTextTarget.getLocalPosition();
        entity.tween(rp).to(new pc.Vec3(rp.x + 50, rp.y, rp.z), 0.2, pc.Linear)
            .loop(true)
            .yoyo(true)
            .repeat(8)
            .on('complete', () => entity.tween(rp).to(new pc.Vec3(-241, 496, 0), 1, pc.QuadraticIn).start())
            .start();

        entity.tween(ea).rotate(new pc.Vec3(ea.x, ea.y, ea.z + (10.0)), 0.1, pc.Linear)
            .loop(true)
            .yoyo(true)
            .repeat(18)
            .on('complete', () => entity.setLocalEulerAngles(0, 0, 0))
            .start();

    }
};

GameController.prototype.tweenPopupIn = function (entity, xCoord = 0, yCoord = 0) {
    entity.enabled = true;
    entity.tween(entity.getLocalPosition()).to(new pc.Vec3(xCoord, yCoord, 0), 2, pc.ElasticOut).start();
};

GameController.prototype.callTweenCallback = function (callback) {
    if (callback !== null) callback();
};

GameController.prototype.resetStarPower = function () {
    this.app.starpowerRunning = false;
    this.starMeter.element.width = 0;
    this.currentStarPowerPercent = 0;
    this.app.swipeLock = false;
    setTimeout(() => {
        this.starpowerActivePopup.enabled = false;
    }, 1000);
};

GameController.prototype.fireStarpower = function () {
    if (this.fade) this.fade.enabled = true;
    setTimeout(() => { if (this.fade) this.fade.enabled = false; }, 50);
    this.createPopupQueue = [];
    this.app.starpowerRunning = true;
    this.app.fire('starBlastAudio');
    setTimeout(() => {
        this.starpowerActivePopup.enabled = true;
        this.app.fire('starPowerupAudio');
    }, 1000);
    this.app.swipeLock = true;
    this.starpowerButton.enabled = false;
    if (this.starParticles) {
        this.starParticles.particlesystem.reset();
        this.starParticles.particlesystem.play();
    }
    var tween_amount = { value: 1 };
    this.app.tween(tween_amount).to({ value: 0 }, this.starPowerActiveDuration, pc.Linear)
        .on('update', () =>
            this.starMeter.element.width = this.starMeterFullWidth * tween_amount.value
        ).on('complete', () =>
            this.resetStarPower()
        ).start();
};

GameController.prototype.createFloatingText = function (points, label = null) {
    let floatingText = new pc.Entity();
    floatingText.addComponent('element', {
        type: pc.ELEMENTTYPE_TEXT,
        anchor: new pc.Vec4(0, 1, 0, 1),
        pivot: new pc.Vec2(0, 1),
        alignment: new pc.Vec2(0.5, 0.5),
        preset: "Center",
        width: 100,
        height: 100,
        fontAsset: this.font,
        fontSize: 32,
        color: this.app['color_text'],
        text: ((label) ? label : "+" + points),
        layers: [this.app.scene.layers.getLayerByName("FloatingText").id]
    });
    let t = this.floatingTextTarget.getLocalPosition();
    floatingText.setLocalScale(3, 3, 1);
    floatingText.setLocalPosition(new pc.Vec3(t.x + 200, t.y - 350, 0));
    this.floatingTextParent.addChild(floatingText);
    let rp = floatingText.getLocalPosition();

    floatingText.tween(floatingText.getLocalScale()).to(new pc.Vec3(0.5, 0.5, 1), 2, pc.QuadraticIn)
        .start();

    floatingText.tween(rp).to(new pc.Vec3(t.x + 72, t.y - 27, t.z), 2, pc.QuadraticIn)
        .on('complete', () =>
            this.completeFloatingText(points, floatingText)
        )
        .start();
};

GameController.prototype.completeFloatingText = function (points, text) {
    text.destroy();
    this.animatePointsHandler(points);
};

GameController.prototype.update = function (dt) {
    if (this.scoreAnimateUpdate > 0) {
        if (this.gameEnded) {
            this.scoreAnimateUpdate -= 2;
            this.app.score += 2;
        }
        else {
            this.scoreAnimateUpdate--;
            this.app.score++;
        }
        if (this.scoreText) this.scoreText.element.text = this.app.score.toString();
    }

    this.onFrameRender();
};
