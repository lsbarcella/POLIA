import { DraggableButton } from "./DraggableButton.js";
import { RopeButton } from "./RopeButton.js";

export class Sidebar extends Phaser.GameObjects.Container {
    constructor(scene, {
        pulleyCount = 0,
        depth = 9999,
        itemPadding = 20,
        rightOffset = 0,
        countOffset = 8,
        bgTexture = 'objectsSidebar',
        pulleyTexture = 'objectsPolia',
        ropeTexture = 'objectsCorda',
        pulleyScale = 1,
        ropeScale = 1,
        ropeFocusPoints = [],
        textStyle = {}
    } = {}) {
        super(scene, 0, 0);

        this.scene = scene;
        this.itemPadding = itemPadding;
        this.rightOffset = rightOffset;
        this.countOffset = countOffset;
        this.pulleyCount = this.normalizeCount(pulleyCount);

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
            focusPoints: ropeFocusPoints
        });

        this.add([this.pulleyButton, this.ropeButton]);

        const baseTextStyle = {
            fontFamily: 'Nunito-ExtraBold',
            fontSize: '28px',
            color: '#1F292D',
            align: 'center'
        };
        this.pulleyCountText = scene.add.text(
            0,
            0,
            String(this.pulleyCount),
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
        const countHeight = this.pulleyCountText.height;

        const pulleyGroupHeight = pulleyHeight + this.countOffset + countHeight;
        const totalHeight = pulleyGroupHeight + this.itemPadding + ropeHeight;
        const topY = bgY - (totalHeight / 2);

        const pulleyY = topY + (pulleyHeight / 2);
        const countY = pulleyY + (pulleyHeight / 2) + this.countOffset;
        const ropeY = topY + pulleyGroupHeight + this.itemPadding + (ropeHeight / 2);

        this.pulleyButton.setPosition(centerX, pulleyY);
        this.pulleyButton.initialX = this.pulleyButton.x;
        this.pulleyButton.initialY = this.pulleyButton.y;

        this.pulleyCountText.setPosition(centerX, countY);

        this.ropeButton.setPosition(centerX, ropeY);
    }

    setPulleyCount(count) {
        this.pulleyCount = this.normalizeCount(count);
        this.pulleyCountText.setText(String(this.pulleyCount));
        this.updatePulleyState();
        this.updateLayout();
        return this;
    }

    updatePulleyState() {
        if (this.pulleyCount <= 0) {
            this.pulleyButton.disableDrag();
            this.pulleyButton.setTint(0xDADADA);
        } else {
            this.pulleyButton.enableDrag();
            this.pulleyButton.clearTint();
        }
    }
}
