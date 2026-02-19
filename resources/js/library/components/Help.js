import { ButtonIcon } from './ButtonIcon.js';
import SoundManager from '../managers/SoundManager.js';

export class Help extends Phaser.GameObjects.Container {
    constructor(scene, config = {}) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);

        const {
            depth = 9999,
            overlayAlpha = 0.7,
            backgroundTexture = 'helpModalBg',
            contentTextures = [
                'helpConteudo1',
                'helpConteudo2',
                'helpConteudo3'
            ],
            closeTexture = 'btFechar',
            closeMargin = 40,
            sideInset = 40,
            fadeDuration = 250
        } = config;

        this.scene = scene;
        this.fadeDuration = fadeDuration;
        this.currentIndex = 0;

        this.overlay = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            overlayAlpha
        ).setOrigin(0.5).setInteractive({ cursor: 'default' });

        this.background = scene.add.image(0, 0, backgroundTexture).setOrigin(0.5);

        const backgroundWidth = this.background.displayWidth;
        const backgroundHeight = this.background.displayHeight;

        this.closeButton = scene.add.image(0, 0, closeTexture)
            .setOrigin(0, 0)
            .setInteractive({ cursor: 'pointer' });
        this.closeButton.x = (backgroundWidth / 2) - this.closeButton.width - closeMargin;
        this.closeButton.y = (-backgroundHeight / 2) + closeMargin;
        this.closeButton.on('pointerdown', () => {
            if (!SoundManager.game && this.scene?.game) {
                SoundManager.init(this.scene.game);
            }
            SoundManager.play('click', 1, false, () => { });
            this.close();
        });

        this.contents = contentTextures.map((texture, index) => {
            const image = scene.add.image(0, 80, texture).setOrigin(0.5);
            if (index !== 0) {
                image.setVisible(false);
                image.setAlpha(0);
            }
            return image;
        });

        this.leftButton = new ButtonIcon(scene, { iconKey: ButtonIcon.ICON_LEFT });
        this.rightButton = new ButtonIcon(scene, { iconKey: ButtonIcon.ICON_RIGHT });

        this.leftButton.setPosition(
            (-backgroundWidth / 2) + sideInset,
            -this.leftButton.height / 2
        );
        this.rightButton.setPosition(
            (backgroundWidth / 2) - sideInset - this.rightButton.width,
            -this.rightButton.height / 2
        );

        this.leftButton.on('buttonClick', () => this.goLeft());
        this.rightButton.on('buttonClick', () => this.goRight());

        this.add([
            this.overlay,
            this.background,
            ...this.contents,
            this.leftButton,
            this.rightButton,
            this.closeButton
        ]);

        this.setDepth(depth);
        this.setVisible(false);
        this.updateNavButtons();

        scene.add.existing(this);
    }

    goLeft() {
        if (this.currentIndex <= 0) {
            return;
        }
        this.showContent(this.currentIndex - 1);
    }

    goRight() {
        if (this.currentIndex >= this.contents.length - 1) {
            return;
        }
        this.showContent(this.currentIndex + 1);
    }

    showContent(index, force = false) {
        if (!force && index === this.currentIndex) {
            return;
        }
        if (index < 0 || index > this.contents.length - 1) {
            return;
        }

        const previous = this.contents[this.currentIndex];
        if (previous) {
            previous.setVisible(false);
            previous.setAlpha(0);
        }

        const next = this.contents[index];
        if (next) {
            next.setVisible(true);
            next.setAlpha(0);
            this.scene.tweens.add({
                targets: next,
                alpha: 1,
                duration: this.fadeDuration,
                ease: 'Sine.easeOut'
            });
        }

        this.currentIndex = index;
        this.updateNavButtons();
    }

    updateNavButtons() {
        this.leftButton.setDisabled(this.currentIndex === 0);
        this.rightButton.setDisabled(this.currentIndex === this.contents.length - 1);
    }

    open() {
        this.setVisible(true);
        this.showContent(0, true);
        return this;
    }

    close() {
        this.setVisible(false);
        return this;
    }
}
