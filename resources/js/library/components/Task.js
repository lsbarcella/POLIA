import SoundManager from "../managers/SoundManager.js";

export class TaskButton extends Phaser.GameObjects.Container {
    constructor(scene, {
        bgTexture = 'taskIconBg',
        buttonTexture = 'taskIcon',
        selectedButtonTexture = 'taskIconSelected',
        modalTexture = null,
        padding = 20,
        modalOffset = 20,
        depth = 9999
    } = {}) {
        super(scene, 0, 0);

        this.scene = scene;
        this.padding = padding;
        this.modalOffset = modalOffset;
        this.buttonTexture = buttonTexture;
        this.selectedButtonTexture = selectedButtonTexture;

        this.button = scene.add.image(0, 0, bgTexture)
            .setOrigin(0, 1)
            .setInteractive({ cursor: 'pointer' });
        this.add(this.button);

        this.buttonIcon = null;
        if (buttonTexture) {
            this.buttonIcon = scene.add.image(0, 0, buttonTexture)
                .setOrigin(0.5);
            this.add(this.buttonIcon);
        }
        
        this.modalContainer = scene.add.container(0, 0);
        this.modalContainer.setVisible(false);
        this.add(this.modalContainer);

        if (modalTexture) {
            this.modalBg = scene.add.image(0, 0, modalTexture)
                .setOrigin(0.5);
            this.modalContainer.add(this.modalBg);
        }

        this.sendToBack(this.modalContainer);
        this.bringToTop(this.button);
        if (this.buttonIcon) {
            this.bringToTop(this.buttonIcon);
        }

        this.button.on('pointerdown', () => {
            if (!SoundManager.game && this.scene?.game) {
                SoundManager.init(this.scene.game);
            }
            SoundManager.play('click', 1, false, () => { });
            this.toggleModal();
        });

        this.setDepth(depth);
        this.scene.add.existing(this);

        this.updateLayout();
        const sceneRef = this.scene;
        sceneRef.scale.on('resize', this.handleResize, this);
        sceneRef.events.once('shutdown', () => {
            if (sceneRef?.scale) {
                sceneRef.scale.off('resize', this.handleResize, this);
            }
        });

        
        this.toggleModal()
    }

    handleResize() {
        this.updateLayout();
    }

    updateLayout() {
        this.setPosition(
            40,
            this.scene.scale.height - 400
        );

        if (this.buttonIcon) {
            const buttonCenterX = this.button.displayWidth / 2 + 4;
            const buttonCenterY = -this.button.displayHeight / 2 - 4;
            this.buttonIcon.setPosition(buttonCenterX, buttonCenterY);
        }

        if (this.modalBg) {
            const modalWidth = this.modalBg.displayWidth;
            const modalHeight = this.modalBg.displayHeight;
            const overlap = 16;

            this.modalTargetX = (modalWidth / 2) - this.x;
            this.modalTargetY = (modalHeight / 2) - overlap;
            this.modalContainer.x = this.modalTargetX;
            this.modalContainer.y = this.modalTargetY;
        }
    }

    showModal() {
        if (this.modalBg) {
            if (this.modalTween) {
                this.modalTween.stop();
                this.modalTween = null;
            }
            this.updateLayout();
            const modalWidth = this.modalBg.displayWidth;
            const startX = -this.x - (modalWidth / 2) - 40;
            const targetX = this.modalTargetX ?? this.modalContainer.x;
            const targetY = this.modalTargetY ?? this.modalContainer.y;

            this.modalContainer.setPosition(startX, targetY);
            this.modalContainer.setAlpha(0);
            this.modalContainer.setVisible(true);
            this.modalAnimating = true;

            this.modalTween = this.scene.tweens.add({
                targets: this.modalContainer,
                x: targetX,
                alpha: 1,
                duration: 300,
                ease: 'Sine.out',
                onComplete: () => {
                    this.modalAnimating = false;
                    this.modalTween = null;
                }
            });
        }
        this.modalContainer.setVisible(true);
        this.updateButtonIcon(true);
        return this;
    }

    hideModal() {
        if (this.modalTween) {
            this.modalTween.stop();
            this.modalTween = null;
        }

        if (this.modalBg && this.modalContainer.visible) {
            this.updateLayout();
            const modalWidth = this.modalBg.displayWidth;
            const endX = -this.x - (modalWidth / 2) - 40;

            this.modalAnimating = true;
            this.modalTween = this.scene.tweens.add({
                targets: this.modalContainer,
                x: endX,
                alpha: 0,
                duration: 250,
                ease: 'Sine.in',
                onComplete: () => {
                    this.modalAnimating = false;
                    this.modalTween = null;
                    this.modalContainer.setVisible(false);
                    this.modalContainer.setAlpha(1);
                }
            });
        } else {
            this.modalAnimating = false;
            this.modalContainer.setVisible(false);
            this.modalContainer.setAlpha(1);
        }

        this.updateButtonIcon(false);
        return this;
    }

    toggleModal() {
        if (this.modalContainer.visible) {
            this.hideModal();
            return this;
        }
        this.showModal();
        return this;
    }

    updateButtonIcon(isOpen) {
        if (!this.buttonIcon) {
            return;
        }
        const targetTexture = isOpen
            ? (this.selectedButtonTexture || this.buttonTexture)
            : this.buttonTexture;
        if (targetTexture && this.buttonIcon.texture?.key !== targetTexture) {
            this.buttonIcon.setTexture(targetTexture);
        }
    }
}
