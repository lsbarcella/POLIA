import { DraggableButton } from "./DraggableButton.js";
import { RopeButton } from "./RopeButton.js";

export class Sidebar extends Phaser.GameObjects.Container {
    constructor(scene, {
        pulleyCount = 0,
        depth = 1000,
        itemPadding = 20,
        rightOffset = 0,
        countOffset = 8,
        bgTexture = 'objectsSidebar',
        pulleyTexture = 'objectsPolia',
        ropeTexture = 'objectsCorda',
        pulleyScale = 1,
        ropeScale = 1,
        ropeFocusPoints = [],
        ropeFocusConnections = [],
        ropeOnAllConnectionsComplete = null,
        ropeEnabled = false,
        isTutorial = false,
        textStyle = {}
    } = {}) {
        super(scene, 0, 0);

        this.scene = scene;
        this.isTutorial = isTutorial;
        this.itemPadding = itemPadding;
        this.rightOffset = rightOffset;
        this.countOffset = countOffset;
        this.pulleyCount = this.normalizeCount(pulleyCount);
        this.tutorialFocus = null;
        this.tutorialFocusTarget = null;

        this.background = scene.add.image(0, 0, bgTexture).setOrigin(1, 0.5);
        this.add(this.background);

        this.pulleyButton = new DraggableButton(scene, {
            x: 0,
            y: 0,
            texture: pulleyTexture,
            scale: pulleyScale,
            id: 'polia'
        });
        this.ropeButton = new RopeButton(scene, {
            x: 0,
            y: 0,
            texture: ropeTexture,
            scale: ropeScale,
            focusPoints: ropeFocusPoints,
            focusConnections: ropeFocusConnections,
            onAllConnectionsComplete: ropeOnAllConnectionsComplete,
            enabled: ropeEnabled
        });

        this.add([this.pulleyButton, this.ropeButton]);

        if (this.isTutorial) {
            this.ensureTutorialFocus();
            this.showTutorialFocusForPulley();
            this.pulleyButton.on('pointerdown', () => {
                this.hideTutorialFocus();
            });
            this.pulleyButton.on('dragstart', () => {
                this.hideTutorialFocus();
            });
            this.ropeButton.on('pointerdown', () => {
                if (this.tutorialFocusTarget === this.ropeButton) {
                    this.hideTutorialFocus();
                }
            });
        }

        const originalSetRopeEnabled = this.ropeButton.setEnabled.bind(this.ropeButton);
        this.ropeButton.setEnabled = (enabled = true) => {
            const result = originalSetRopeEnabled(enabled);
            this.handleTutorialRopeEnabledChange(enabled);
            return result;
        };
        this.handleTutorialRopeEnabledChange(ropeEnabled);

        const borderThickness = 4;
        this.pulleyCountBorderThickness = borderThickness;
        const borderPadding = 8;
        const baseTextStyle = {
            fontFamily: 'Nunito-Black',
            fontSize: '35px',
            color: '#1F292D',
            align: 'center',
            backgroundColor: '#FFFFFF',
            padding: {
                left: borderPadding,
                right: borderPadding,
                top: borderPadding - 4,
                bottom: borderPadding - 4
            }
        };
        this.pulleyCountBorder = scene.add.rectangle(0, 0, 1, 1, 0x000000)
            .setOrigin(0.5, 0);
        this.add(this.pulleyCountBorder);
        this.pulleyCountText = scene.add.text(
            0,
            0,
            `x${String(this.pulleyCount)}`,
            { ...baseTextStyle, ...textStyle }
        ).setOrigin(0.5, 0);
        this.add(this.pulleyCountText);

        this.setDepth(depth);
        scene.add.existing(this);

        this.updateLayout();
        this.updatePulleyState();

        const sceneRef = this.scene;
        sceneRef.scale.on('resize', this.handleResize, this);
        sceneRef.events.once('shutdown', () => {
            if (sceneRef?.scale) {
                sceneRef.scale.off('resize', this.handleResize, this);
            }
        });
    }

    normalizeCount(value) {
        const parsed = Math.floor(Number(value));
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }

    handleResize() {
        this.updateLayout();
    }

    updateLayout() {
        const bgX = this.scene.scale.width - this.rightOffset;
        const bgY = this.scene.scale.height / 2;
        this.background.setPosition(bgX, bgY);

        const centerX = bgX - (this.background.displayWidth / 2);
        const pulleyHeight = this.pulleyButton.displayHeight;
        const ropeHeight = this.ropeButton.displayHeight;
        const borderThickness = this.pulleyCountBorderThickness || 0;
        const countHeight = this.pulleyCountText.height + (borderThickness * 2);

        const pulleyGroupHeight = pulleyHeight + this.countOffset + countHeight;
        const totalHeight = pulleyGroupHeight + this.itemPadding + ropeHeight;
        const topY = bgY - (totalHeight / 2);

        const pulleyY = topY + (pulleyHeight / 2);
        const countY = pulleyY + (pulleyHeight / 2) + this.countOffset;
        const ropeY = topY + pulleyGroupHeight + this.itemPadding + (ropeHeight / 2);

        this.pulleyButton.setPosition(centerX, pulleyY);
        this.pulleyButton.initialX = this.pulleyButton.x;
        this.pulleyButton.initialY = this.pulleyButton.y;

        this.pulleyCountText.setPosition(centerX, countY + borderThickness);
        this.updatePulleyCountBorder();

        this.ropeButton.setPosition(centerX, ropeY);

        if (this.tutorialFocus && this.tutorialFocus.visible && this.tutorialFocusTarget) {
            this.tutorialFocus.setPosition(
                this.tutorialFocusTarget.x,
                this.tutorialFocusTarget.y
            );
        }
    }

    setPulleyCount(count) {
        this.pulleyCount = this.normalizeCount(count);
        this.pulleyCountText.setText(String(this.pulleyCount));
        this.updatePulleyState();
        this.updateLayout();
        return this;
    }

    updatePulleyCountBorder() {
        if (!this.pulleyCountBorder || !this.pulleyCountText) {
            return;
        }

        const borderThickness = this.pulleyCountBorderThickness || 0;
        const width = Math.max(1, this.pulleyCountText.width + (borderThickness * 2));
        const height = Math.max(1, this.pulleyCountText.height + (borderThickness * 2));

        this.pulleyCountBorder.setSize(width, height);
        this.pulleyCountBorder.setPosition(
            this.pulleyCountText.x,
            this.pulleyCountText.y - borderThickness
        );
    }

    updatePulleyState() {
        if (this.pulleyCount <= 0) {
            this.pulleyButton.disableDrag();
            this.pulleyButton.clearTint();
            this.pulleyButton.setAlpha(0.6);
        } else {
            this.pulleyButton.enableDrag();
            this.pulleyButton.clearTint();
            this.pulleyButton.setAlpha(1);
        }
    }

    ensureTutorialFocus() {
        if (!this.isTutorial || this.tutorialFocus) {
            return;
        }
        this.tutorialFocus = this.scene.add.image(0, 0, 'objectsFoco')
            .setOrigin(0.5)
            .setVisible(false);
        this.add(this.tutorialFocus);
    }

    showTutorialFocusForPulley() {
        if (!this.isTutorial) {
            return;
        }
        this.ensureTutorialFocus();
        this.moveTutorialFocusBehind(this.pulleyButton);
    }

    showTutorialFocusForRope() {
        if (!this.isTutorial) {
            return;
        }
        this.ensureTutorialFocus();
        this.moveTutorialFocusBehind(this.ropeButton);
    }

    hideTutorialFocus() {
        if (!this.tutorialFocus) {
            return;
        }
        this.tutorialFocus.setVisible(false);
        this.tutorialFocusTarget = null;
    }

    moveTutorialFocusBehind(target) {
        if (!this.tutorialFocus || !target) {
            return;
        }

        if (!this.list.includes(this.tutorialFocus)) {
            this.add(this.tutorialFocus);
        }

        const targetIndex = this.list.indexOf(target);
        const insertIndex = targetIndex > 0 ? targetIndex : 1;

        this.remove(this.tutorialFocus);
        this.addAt(this.tutorialFocus, insertIndex);
        this.tutorialFocus.setPosition(target.x, target.y);
        this.tutorialFocus.setVisible(true);
        this.tutorialFocusTarget = target;
    }

    handleTutorialRopeEnabledChange(enabled) {
        if (!this.isTutorial) {
            return;
        }
        if (enabled) {
            this.showTutorialFocusForRope();
        } else if (this.tutorialFocusTarget === this.ropeButton) {
            this.hideTutorialFocus();
        }
    }
}
