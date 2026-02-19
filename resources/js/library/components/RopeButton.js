export class RopeButton extends Phaser.GameObjects.Image {
    constructor(scene, {
        x = 0,
        y = 0,
        texture = 'objectsCorda',
        scale = 1,
        depth = null,
        focusPoints = [],
        focusTexture = 'objectsFocoPequeno',
        focusScale = 1,
        focusDepth = null,
        focusAlpha = 1,
        spawnOnce = true,
        pulseScale = 1.12,
        pulseDuration = 500,
        focusHoverScale = 1.08
    } = {}) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.focusPoints = Array.isArray(focusPoints) ? focusPoints : [];
        this.focusTexture = focusTexture;
        this.focusScale = focusScale;
        this.focusDepth = focusDepth;
        this.focusAlpha = focusAlpha;
        this.spawnOnce = spawnOnce;
        this.pulseScale = pulseScale;
        this.pulseDuration = pulseDuration;
        this.focusHoverScale = focusHoverScale;
        this.baseScale = scale;
        this.focusSprites = [];
        this.isActive = false;
        this.pulseTween = null;

        this.setOrigin(0.5);
        this.setScale(scale);
        this.setInteractive({ cursor: 'pointer' });

        if (depth != null) {
            this.setDepth(depth);
        }

        this.on('pointerdown', () => {
            this.toggleFocus();
        });

        scene.add.existing(this);
    }

    normalizePoint(point) {
        if (Array.isArray(point) && point.length >= 2) {
            return { x: Number(point[0]) || 0, y: Number(point[1]) || 0 };
        }
        if (point && typeof point === 'object') {
            return { x: Number(point.x) || 0, y: Number(point.y) || 0 };
        }
        return { x: 0, y: 0 };
    }

    spawnFocus() {
        if (!this.focusPoints.length) {
            return this;
        }

        if (this.focusSprites.length) {
            this.showFocus();
            return this;
        }

        const created = [];
        this.focusPoints.forEach((point) => {
            const pos = this.normalizePoint(point);
            const focus = this.scene.add.image(pos.x, pos.y, this.focusTexture)
                .setOrigin(0.5)
                .setScale(this.focusScale)
                .setAlpha(this.focusAlpha);

            focus.setInteractive({ cursor: 'pointer' });
            focus.on('pointerover', () => {
                focus.setScale(this.focusScale * this.focusHoverScale);
            });
            focus.on('pointerout', () => {
                focus.setScale(this.focusScale);
            });

            if (this.focusDepth != null) {
                focus.setDepth(this.focusDepth);
            }

            created.push(focus);
        });

        this.focusSprites = this.focusSprites.concat(created);
        return this;
    }

    showFocus() {
        this.focusSprites.forEach((sprite) => sprite.setVisible(true));
        return this;
    }

    setFocusPoints(points = [], { clearExisting = false } = {}) {
        this.focusPoints = Array.isArray(points) ? points : [];
        if (clearExisting) {
            this.clearFocus();
        }
        return this;
    }

    clearFocus() {
        this.focusSprites.forEach((sprite) => sprite.destroy());
        this.focusSprites = [];
        return this;
    }

    hideFocus() {
        this.focusSprites.forEach((sprite) => sprite.setVisible(false));
        return this;
    }

    toggleFocus() {
        if (this.isActive) {
            this.isActive = false;
            this.hideFocus();
            this.stopPulse();
            return this;
        }

        this.isActive = true;
        this.spawnFocus();
        this.startPulse();
        return this;
    }

    startPulse() {
        this.stopPulse();
        this.pulseTween = this.scene.tweens.add({
            targets: this,
            scaleX: this.pulseScale,
            scaleY: this.pulseScale,
            duration: this.pulseDuration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
        return this;
    }

    stopPulse() {
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
        this.setScale(this.baseScale);
        return this;
    }
}
