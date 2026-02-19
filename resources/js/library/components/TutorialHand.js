export class TutorialHand extends Phaser.GameObjects.Container {
    constructor(scene, {
        type = 'click',
        x = scene.scale.width / 2,
        y = scene.scale.height / 2,
        startX = x,
        startY = y,
        endX = x + 200,
        endY = y,
        texture = 'tutorialHand',
        depth = 9999,
        repeat = 3,
        handScale = 1,
        handOriginX = 0.5,
        handOriginY = 0.5,
        tipOffsetX = null,
        tipOffsetY = null,
        rippleCount = 3,
        rippleColor = 0x5ADCFF,
        rippleAlpha = 0.6,
        rippleMinRadius = 9,
        rippleMaxRadius = 64,
        rippleDuration = 700,
        rippleStagger = 160,
        rippleStrokeWidth = 0,
        dragDuration = 900,
        fadeInDuration = 200,
        fadeOutDuration = 200
    } = {}) {
        super(scene, 0, 0);

        this.scene = scene;
        this.type = type;
        this.repeat = repeat;
        this.dragDuration = Math.max(1, dragDuration);
        this.fadeInDuration = Math.max(0, fadeInDuration);
        this.fadeOutDuration = Math.max(0, fadeOutDuration);
        this.rippleCount = rippleCount;
        this.rippleColor = rippleColor;
        this.rippleAlpha = rippleAlpha;
        this.rippleMinRadius = rippleMinRadius;
        this.rippleMaxRadius = Math.max(1, rippleMaxRadius);
        this.rippleDuration = Math.max(1, rippleDuration);
        this.rippleStagger = Math.max(0, rippleStagger);
        this.rippleStrokeWidth = Math.max(0, rippleStrokeWidth);

        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;

        this.hand = scene.add.image(0, 0, texture)
            .setOrigin(handOriginX, handOriginY)
            .setScale(handScale);
        this.add(this.hand);

        this.tipOffsetX = tipOffsetX != null ? tipOffsetX : this.hand.displayWidth - 150;
        this.tipOffsetY = tipOffsetY != null ? tipOffsetY : -this.hand.displayHeight * 0.35;

        this.ripples = [];
        this.rippleTweens = [];
        this.dragTween = null;
        this.handTween = null;
        this.handFadeOutCall = null;

        this.setDepth(depth);
        scene.add.existing(this);

        if (this.type === 'click') {
            this.setPosition(x, y);
            this.createRipples();
            this.playClick();
        } else if (this.type === 'drag') {
            this.setPosition(this.startX, this.startY);
            this.setAlpha(0);
            this.playDrag();
        }

        const sceneRef = this.scene;
        sceneRef.events.once('shutdown', () => {
            this.stop();
        });
    }

    toRepeatValue(value) {
        if (value === -1 || value === Infinity) {
            return -1;
        }
        const parsed = Math.floor(Number(value));
        if (!Number.isFinite(parsed) || parsed <= 1) {
            return 0;
        }
        return parsed - 1;
    }

    createRipples() {
        const minScale = this.rippleMinRadius / this.rippleMaxRadius;
        for (let i = 0; i < this.rippleCount; i += 1) {
            const circle = this.scene.add.circle(
                this.tipOffsetX,
                this.tipOffsetY,
                this.rippleMaxRadius,
                this.rippleColor,
                1
            );

            if (this.rippleStrokeWidth > 0) {
                circle.setStrokeStyle(this.rippleStrokeWidth, this.rippleColor, 1);
                circle.setFillStyle(this.rippleColor, 0);
            } else {
                circle.setFillStyle(this.rippleColor, 1);
            }

            circle.setScale(minScale);
            circle.setAlpha(0);
            this.addAt(circle, 0);
            this.ripples.push(circle);
        }

        this.bringToTop(this.hand);
    }

    playClick() {
        this.stop();
        if (!this.ripples.length) {
            return;
        }

        const repeatValue = this.toRepeatValue(this.repeat);
        const minScale = this.rippleMinRadius / this.rippleMaxRadius;
        const cycleDelay = this.rippleStagger * Math.max(0, this.ripples.length - 1);
        const cycleDuration = this.rippleDuration + cycleDelay;

        this.hand.setAlpha(0);
        if (this.fadeInDuration > 0) {
            this.handTween = this.scene.tweens.add({
                targets: this.hand,
                alpha: 1,
                duration: this.fadeInDuration,
                ease: 'Sine.out'
            });
        } else {
            this.hand.setAlpha(1);
        }

        if (repeatValue >= 0) {
            const cycles = repeatValue + 1;
            const totalDuration = cycles * cycleDuration;
            this.handFadeOutCall = this.scene.time.delayedCall(totalDuration, () => {
                if (this.fadeOutDuration > 0) {
                    this.handTween = this.scene.tweens.add({
                        targets: this.hand,
                        alpha: 0,
                        duration: this.fadeOutDuration,
                        ease: 'Sine.in'
                    });
                } else {
                    this.hand.setAlpha(0);
                }
            });
        }

        this.ripples.forEach((circle, index) => {
            circle.setScale(minScale);
            circle.setAlpha(0);

            const tween = this.scene.tweens.add({
                targets: circle,
                scale: 1,
                alpha: 0,
                duration: this.rippleDuration,
                delay: index * this.rippleStagger,
                repeat: repeatValue,
                repeatDelay: cycleDelay,
                ease: 'Sine.out',
                onStart: () => {
                    circle.setAlpha(this.rippleAlpha);
                },
                onRepeat: () => {
                    circle.setScale(minScale);
                    circle.setAlpha(this.rippleAlpha);
                }
            });

            this.rippleTweens.push(tween);
        });
    }

    playDrag() {
        this.stop();

        const repeatValue = this.toRepeatValue(this.repeat);
        const fadeInRatio = this.fadeInDuration / this.dragDuration;
        const fadeOutRatio = this.fadeOutDuration / this.dragDuration;
        const fadeOutStart = 1 - fadeOutRatio;

        this.dragTween = this.scene.tweens.add({
            targets: this,
            x: this.endX,
            y: this.endY,
            duration: this.dragDuration,
            ease: 'Sine.inOut',
            repeat: repeatValue,
            onStart: () => {
                this.setPosition(this.startX, this.startY);
                this.setAlpha(0);
            },
            onRepeat: () => {
                this.setPosition(this.startX, this.startY);
                this.setAlpha(0);
            },
            onUpdate: (tween) => {
                const progress = tween.progress;
                let alpha = 1;

                if (this.fadeInDuration > 0 && progress < fadeInRatio) {
                    alpha = progress / Math.max(fadeInRatio, 0.0001);
                } else if (this.fadeOutDuration > 0 && progress > fadeOutStart) {
                    alpha = 1 - ((progress - fadeOutStart) / Math.max(fadeOutRatio, 0.0001));
                }

                this.setAlpha(Phaser.Math.Clamp(alpha, 0, 1));
            }
        });
    }

    stop() {
        if (this.dragTween) {
            this.dragTween.stop();
            this.dragTween = null;
        }

        if (this.handTween) {
            this.handTween.stop();
            this.handTween = null;
        }

        if (this.handFadeOutCall) {
            this.handFadeOutCall.remove(false);
            this.handFadeOutCall = null;
        }

        if (this.rippleTweens.length) {
            this.rippleTweens.forEach((tween) => tween?.stop());
            this.rippleTweens = [];
        }
    }

    setRepeat(repeat) {
        this.repeat = repeat;
        if (this.type === 'click') {
            this.playClick();
        } else if (this.type === 'drag') {
            this.playDrag();
        }
        return this;
    }

    setDragPath(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        if (this.type === 'drag') {
            this.playDrag();
        }
        return this;
    }
}
