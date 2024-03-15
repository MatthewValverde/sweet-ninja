var ButtonPostGame = pc.createScript('buttonPostGame');

// initialize code called once per entity
ButtonPostGame.prototype.initialize = function () {
    this.entity.button.on('click', () => {
        if (this.app.canPress === true) {
            this.app.canPress = false;
            this.onPress();
        }
    });
};

// update code called every frame
ButtonPostGame.prototype.onPress = function () {
    if (this.app.inPlayCanvas === true) {
        this.app.fire('resetGame');
    }
    else {
        this.app.canPress = false;
        this.app.controller.sendMessage({
            id: 0,
            event: 'game_over',
            data: {
                eventId: this.app.eventId,
                mode: this.app.mode,
            }
        });
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// ButtonPostGame.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/