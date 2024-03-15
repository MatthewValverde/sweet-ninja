var EndScreenController = pc.createScript('endScreenController');

EndScreenController.attributes.add('finalScoreText', { type: 'entity' });
EndScreenController.attributes.add('speedScoreText', { type: 'entity' });
EndScreenController.attributes.add('finalScoreParent', { type: 'entity' });
EndScreenController.attributes.add('bounceParent', { type: 'entity' });
EndScreenController.attributes.add('rankScores', { type: 'number', array: true });
EndScreenController.attributes.add('rankScales', { type: 'number', array: true });
EndScreenController.attributes.add('rankNameText', { type: 'entity' });
EndScreenController.attributes.add('rankNames', { type: 'string', array: true });
EndScreenController.attributes.add('particles', { type: 'entity' });

EndScreenController.prototype.initialize = function () {
    //this.speedScoreText.enabled = false;
    this.app.endScreen = this;
    this.toScale = new pc.Vec3(1.3, 1.3, 1.3);
    this.app.on('resetGame', this.onReset, this);
    this.app.on('initializationComplete', this.postInit, this);
    this.app.on('postInitComplete', this.customize, this);
    this.onReset();
};

EndScreenController.prototype.postInit = function () {
    this.app.observers.push(this);
};

EndScreenController.prototype.updateFrame = function (dt) {
    if (this.animate === true) {
        const scale = 0.9 + (this.app.scaleVal * 0.2);
        this.bounceParent.setLocalScale(scale, scale, scale);
    }
};

EndScreenController.prototype.customize = function () {
};

EndScreenController.prototype.onReset = function () {
    if (this.particles) {
        this.particles.particlesystem.stop();
        this.particles.particlesystem.reset();
        this.particles.enabled = false;
    }
    this.animate = false;
    this.count = 0;
    this.final = 0;
    this.rank = 0;
    this.rankNameText.element.text = '';
    this.finalScoreText.element.text = '';
    if (this.app.color_primary) {
        this.customize();
    }
};

EndScreenController.prototype.start = function () {
    this.scoreAnimation();
    if (this.particles) {
        this.particles.enabled = true;
        this.particles.particlesystem.play();
    }
};

EndScreenController.prototype.scoreAnimation = function () {
    console.log(this.app.score);
    this.maxRank = 0;
    for (i = 0; i < this.rankScores; i++) {
        if (this.app.score >= this.rankScores[i]) {
            this.maxRank = i;
        }
    }

    this.app.sound.play('win');
    this.score = {
        x: 0
    };
    this.entity
        .tween(this.score)
        .to({ x: this.app.score }, 3 + this.maxRank, pc.Linear)
        .on('update', () => {
            this.finalScoreText.element.text = Math.ceil(this.score.x);
            //console.log(Math.ceil(this.score.x), this.app.score);
            if (this.rankScores[this.rank + 1]) {
                if (this.score.x > this.rankScores[this.rank + 1]) {
                    this.rank += 1;
                    this.bumpUp();
                }
            }
        })
        .on('complete', () => {
            //console.log("COMPLETE@!");
            this.app.sound.slot('win').stop();
            this.app.sound.play('winend');
            this.animate = true;
        })
        .start();
    this.rankNameText.element.text = this.rankNames[this.rank];
};

EndScreenController.prototype.bumpUp = function () {
    this.app.sound.slot('slam').pitch = (1 + (this.rank * 0.1));
    this.app.sound.play('slam');
    this.app.sound.slot('win').pitch = (1 + (this.rank * 0.1));
    this.finalScoreTween = this.finalScoreParent
        .tween(this.finalScoreParent.getLocalScale())
        .to(new pc.Vec3(this.rankScales[this.rank], this.rankScales[this.rank], this.rankScales[this.rank]), 0.25, pc.ExponentialIn)
        .on('complete', () => {
            //console.log("complete");
            this.rankNameText.element.text = this.rankNames[this.rank];
        })
        .start();
};
