var AudioController = pc.createScript('audioController');

AudioController.attributes.add('swordWhipSlots', { type: 'string', array: true });

AudioController.prototype.initialize = function () {
    if (this.entity.sound) this.app.sound = this.entity.sound;

    this.app.on('sliceAudio', this.playSliceAudio, this);
    this.app.on('startAudio', this.playStartAudio, this);
    this.app.on('soundtrackAudio', this.playSoundtrack, this);
    this.app.on('comboAudio', this.playComboAudio, this);
    this.app.on('starAudio', this.playStarAudio, this);
    this.app.on('starAddAudio', this.playStarAddAudio, this);
    this.app.on('starPowerupAudio', this.playPowerup, this);

    this.app.on('glassAudio', this.playGlassAudio, this);
    this.app.on('negativeAudio', this.playNegativeAudio, this);
    this.app.on('rocketAudio', this.playRocketAudio, this);
    this.app.on('donutAudio', this.playDonutAudio, this);
    this.app.on('cannoliAudio', this.playCannoliAudio, this);
    this.app.on('cookieAudio', this.playCookieAudio, this);
    this.app.on('cupcakeAudio', this.playCupcakeAudio, this);
    this.app.on('croissantAudio', this.playCroissantAudio, this);
    this.app.on('starcookieAudio', this.playStarcookieAudio, this);
    this.app.on('macaroonAudio', this.playMacaroonAudio, this);
    //this.app.on('slideAudio', this.playSlideAudio, this);
    this.app.on('whipAudio', this.playWhipAudio, this);
    this.app.on('starBlastAudio', this.playStarBlastAudio, this);

    this.slice = false;
    this.cut = false;

    //this.app.on('pitchUpdate', this.updatePitch, this);
    console.log(this.entity.sound);
};

AudioController.prototype.playStarBlastAudio = function () {
    this.entity.sound.play('starblast');
};

AudioController.prototype.playWhipAudio = function () {
    let rs = this.randomInteger(0, this.swordWhipSlots.length - 1);
    this.entity.sound.play(this.swordWhipSlots[rs]);
};

AudioController.prototype.playStartAudio = function () {
    this.entity.sound.play('press');
};

AudioController.prototype.playSoundtrack = function () {
    this.entity.sound.play('soundtrack');
};

AudioController.prototype.playPowerup = function () {
    this.entity.sound.play('powerup');
};

AudioController.prototype.playStarAddAudio = function () {
    this.entity.sound.play('starpoweradd');
};

AudioController.prototype.playSliceAudio = function () {
    if (this.slice) return;
    this.slice = true;
    this.entity.sound.play('slice');
    setTimeout(() => { this.slice = false; }, 100);
};

AudioController.prototype.playGlassAudio = function () {
    this.entity.sound.play('glass');
};

AudioController.prototype.playComboAudio = function () {
    this.entity.sound.play('combo');
};

AudioController.prototype.playRocketAudio = function () {
    this.entity.sound.play('rocket');
};

AudioController.prototype.playStarAudio = function () {
    this.entity.sound.play('star');
};

AudioController.prototype.playCookieAudio = function () {
    this.playCut();
    //this.entity.sound.play('fx_2');
};

AudioController.prototype.playDonutAudio = function () {
    this.playCut();
    //this.entity.sound.play('fx_7');
};

AudioController.prototype.playCupcakeAudio = function () {
    this.playCut();
    //this.entity.sound.play('fx_5');
};

AudioController.prototype.playCannoliAudio = function () {
    this.playCut();
    //this.entity.sound.play('fx_1');
};

AudioController.prototype.playCroissantAudio = function () {
    this.playCut();
    //this.entity.sound.play('fx_5');
};

AudioController.prototype.playStarcookieAudio = function () {
    //this.playCut();
    this.entity.sound.play('starslice');
};

AudioController.prototype.playMacaroonAudio = function () {
    this.playCut();
    //this.entity.sound.play('fx_6');
};

AudioController.prototype.playCut = function () {
    if (this.cut) return;
    this.cut = true;
    this.entity.sound.play('cut');
    setTimeout(() => { this.cut = false; }, 100);
};

AudioController.prototype.playNegativeAudio = function () {
    this.entity.sound.play('negative');
};

AudioController.prototype.playSlideAudio = function (value = true) {
    if (value) {
        this.entity.sound.play('slide');
    } else {
        this.entity.sound.stop('slide');
    }
};

AudioController.prototype.updatePitch = function (value = 0) {
    //console.log(value);
    //this.entity.sound.slot('slide').pitch = value;
};

AudioController.prototype.randomInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

