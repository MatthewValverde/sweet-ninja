// lowPassFilter.js
var LowPassFilter = pc.createScript('lowPassFilter');

LowPassFilter.attributes.add('musicAsset', {
    type: 'asset',
    assetType: 'audio',
    title: 'Music Asset',
    array: true
});
LowPassFilter.attributes.add('startButton', { type: 'entity' });
LowPassFilter.attributes.add('basePitch', { type: 'number', default: 0.75 });
LowPassFilter.attributes.add('maxPitch', { type: 'number', default: 1.1 })
LowPassFilter.attributes.add('volume', { type: 'number', default: 0.15 });

LowPassFilter.prototype.initialize = function () {
    this.started = false;
    this.setup = false;
    this.app.lowPassFilter = this;
    // Create an AnalyserNode
    this.observers = [];
    this.visible = 1;
    this.muted = 1;
    document.addEventListener("visibilitychange", () => {
        this.handleVisibilityChange();
    });
    this.app.on('resetGame', this.onReset, this);

    this.lastUpdateTime = 0;
    this.frameRate = 16; // Target frame rate in FPS
    this.frameTime = 1000 / this.frameRate;

    this.app.on('initializationComplete', this.postInit, this);
};

LowPassFilter.prototype.postInit = function () {
    this.app.observers.push(this);
};

LowPassFilter.prototype.onReset = function () {
    this.startButton.button.active = true;
};

// Function to handle visibility change
LowPassFilter.prototype.handleVisibilityChange = function () {
    if (this.gain) {
        if (document.hidden) {
            this.visible = 0;
        } else {
            this.visible = 1;
        }
        this.gain.gain.value = 0.2 * this.visible * this.muted;
    }
}

LowPassFilter.prototype.startUp = function () {
    this.app.on('mute', this.mute, this);
    this.app.on('unmute', this.unmute, this);
    if (this.started === false) {
        this.started = true;
        this.songIndex = 0;
        if (this.app.setting_themeSong && this.app.setting_themeSong === 'fallout') {
            this.songIndex = 1;
        }
        this.setupAudioNodes();
        this.forcePitch(1);
        // Unlock the audio context
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256; // You can adjust this value based on your needs

        // Connect the AnalyserNode to the gain node
        this.gain.connect(this.analyser);
        this.startButton.button.active = false;
        this.setup = true;
    }
};

LowPassFilter.prototype.mute = function () {
    if (this.gain) {
        this.muted = 0;
        this.gain.gain.value = this.volume * this.visible * this.muted;
    }

};

LowPassFilter.prototype.unmute = function () {
    if (this.gain) {
        this.muted = 1;
        this.gain.gain.value = this.volume * this.visible * this.muted;
    }

};

LowPassFilter.prototype.notifyObservers = function () {
    this.observers.forEach((observer) => {
        observer.updateScaleVal(this.app.scaleVal);
    });
};

LowPassFilter.prototype.updateFrame = function (dt) {
    if (this.setup === true && this.gain) { // Changed "=" to "==="
        // Throttled DB and scale value updates
        this.app.scaleVal = this.getScaledOutputValue();
        this.notifyObservers();
    }
}

// Setup audio nodes
LowPassFilter.prototype.setupAudioNodes = function () {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext || window.oAudioContext)();
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = this.musicAsset[this.songIndex].resource.buffer;
    this.audioSource.loop = true; // Set loop to true if you want the music to loop

    // Create the low-pass filter
    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1000; // Adjust this value to control the cutoff frequency

    // Create the gain node
    this.gain = this.audioContext.createGain();
    this.gain.gain.value = this.volume; // Adjust this value to control the volume

    // Connect the nodes
    this.audioSource.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.audioContext.destination);

    this.audioSource.start(0);
};

// Animate audio parameters
LowPassFilter.prototype.animateAudioParam = function (param, targetValue, duration) {
    param.cancelScheduledValues(this.audioContext.currentTime);
    param.setValueAtTime(param.value, this.audioContext.currentTime);
    param.linearRampToValueAtTime(targetValue, this.audioContext.currentTime + duration);
};

// Toggle low-pass filter with 3-second fade
LowPassFilter.prototype.toggleLowPass = function (enabled, duration) {
    var targetFrequency = enabled ? 1000 : this.audioContext.sampleRate / 2;
    this.animateAudioParam(this.filter.frequency, targetFrequency, duration);
};

// Set pitch of the music
LowPassFilter.prototype.setPitch = function (newPitch) {
    let calculatedPitch = ((this.maxPitch - this.basePitch) * newPitch) + this.basePitch;
    this.animateAudioParam(this.audioSource.playbackRate, calculatedPitch, 1);
};

LowPassFilter.prototype.forcePitch = function (newPitch) {
    let calculatedPitch = newPitch;
    this.animateAudioParam(this.audioSource.playbackRate, calculatedPitch, 1);
};

// OnDestroy
LowPassFilter.prototype.onDestroy = function () {
    this.audioSource.stop(0);
};

LowPassFilter.prototype.setVolume = function (vol) {
    this.animateAudioParam(this.gain.gain, vol, 1);
};

LowPassFilter.prototype.getOutputDBLevel = function () {
    var bufferLength = this.analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    var sum = 0;
    dataArray.forEach(function (value) {
        sum += value;
    });

    var average = sum / dataArray.length;
    var dBLevel = 20 * Math.log10(average / 255); // Convert the average to dB scale

    return dBLevel;
};

// Method to get the scaled output value in the range [0, 0.3]
LowPassFilter.prototype.getScaledOutputValue = function () {
    // Temporary disconnect the AnalyserNode
    this.gain.disconnect(this.analyser);

    var dBLevel = this.getOutputDBLevel();


    var minDB;
    var maxDB;
    if (this.app.stateName === 'playing') {
        minDB = -25; // Minimum dB value
        maxDB = -10; // Maximum dB value
    }
    else {
        minDB = -35;
        maxDB = -20;
    }
    var minValue = 0; // Minimum value in the desired range
    var maxValue = 1; // Maximum value in the desired range
    // Map dBLevel from [-30, -20] dB range to [0, 0.3] range


    // Calculate the scaled value
    var scaledValue = clamp((dBLevel - minDB) / (maxDB - minDB) * (maxValue - minValue) + minValue, minValue, maxValue);

    // Ensure the value is within the desired range [0, 0.3]
    scaledValue = Math.min(Math.max(scaledValue, minValue), maxValue);

    // Reconnect the AnalyserNode
    this.gain.connect(this.analyser);

    return scaledValue;
};
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}