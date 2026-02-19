export class DropZoneButton extends Phaser.GameObjects.Container {
    constructor(scene, {
        x = 0,
        y = 0,
        texture = null,
        scale = 1,
        id = null,
        width = null,
        height = null,
        widthOffset = 0,
        heightOffset = 0,
        imageDepth = null,
        onDrop = null,
        onHoverStart = null,
        onHoverEnd = null,
        highlightOnHover = true,
        hoverScale = 1.2,
        hoverTint = 0x7DFF9A,
        debug = false
    } = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.id = id;
        this.onDropCallback = onDrop;
        this.onHoverStartCallback = onHoverStart;
        this.onHoverEndCallback = onHoverEnd;
        this.highlightOnHover = highlightOnHover;
        this.hoverScale = hoverScale;
        this.hoverTint = hoverTint;
        this.baseScale = scale;

        this.image = scene.add.image(0, 0, texture)
            .setOrigin(0.5)
            .setScale(scale);

        if (imageDepth != null) {
            this.image.setDepth(imageDepth);
        }

        this.add(this.image);

        const baseWidth = width || this.image.displayWidth + 36;
        const baseHeight = height || this.image.displayHeight + 36;
        const dropWidth = Math.max(1, baseWidth + widthOffset);
        const dropHeight = Math.max(1, baseHeight + heightOffset);

        this.dropZone = scene.add.zone(0, 0, dropWidth, dropHeight)
            .setRectangleDropZone(dropWidth, dropHeight);

        this.add(this.dropZone);

        if (debug) {
            this.debugGraphics = scene.add.graphics();
            this.debugGraphics.lineStyle(3, 0x00ff00, 1);
            this.debugGraphics.strokeRect(
                x - dropWidth / 2,
                y - dropHeight / 2,
                dropWidth,
                dropHeight
            );
        }

        scene.add.existing(this);

        scene.input.on('drop', (pointer, gameObject, dropZone) => {
            if (dropZone === this.dropZone) {
                if (this.highlightOnHover) {
                    this.image.clearTint();
                }
                if (this.onDropCallback) {
                    this.onDropCallback(gameObject, this);
                }
            }
        });

        scene.input.on('dragenter', (pointer, gameObject, dropZone) => {
            if (dropZone === this.dropZone && this.highlightOnHover) {
                this.image.setTint(this.hoverTint);

                if (this.onHoverStartCallback) {
                    this.onHoverStartCallback(gameObject, this);
                }
            }
        });

        scene.input.on('dragleave', (pointer, gameObject, dropZone) => {
            if (dropZone === this.dropZone && this.highlightOnHover) {
                this.image.clearTint();

                if (this.onHoverEndCallback) {
                    this.onHoverEndCallback(gameObject, this);
                }
            }
        });
    }

    forceDragLeave() {
        this.image.clearTint();
    }

    enable() {
        this.dropZone.setActive(true);
        return this;
    }

    disable() {
        this.dropZone.setActive(false);
        this.image.clearTint();
        return this;
    }

    destroy() {
        if (this.dropZone) {
            this.dropZone.destroy();
        }
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
        }
        super.destroy();
    }
}
