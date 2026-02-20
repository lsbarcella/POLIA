export class DraggableButton extends Phaser.GameObjects.Image {
    constructor(scene, {
        x = 0,
        y = 0,
        texture = null,
        scale = 1,
        hoverScale = null,
        id = null,
        onDragStart = null,
        onDragEnd = null,
        onDrop = null
    } = {}) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.id = id;
        this.initialX = x;
        this.initialY = y;
        this.onDragStartCallback = onDragStart;
        this.onDragEndCallback = onDragEnd;
        this.onDropCallback = onDrop;
        this.isDragging = false;

        this.baseScale = scale;
        this.hoverScale = hoverScale ?? (scale * 1.08);
        this.setScale(scale);
        this.setOrigin(0.5);
        this.setDepth(100); 

        this.setInteractive({
            cursor: 'grab',
            draggable: true,
            useHandCursor: true
        });

        scene.add.existing(this);

        this.on('dragstart', (pointer) => {
            this.isDragging = true;
            this.setDepth(1000);
            this.setScale(this.baseScale);
            scene.input.setDefaultCursor('grabbing');

            if (this.onDragStartCallback) {
                this.onDragStartCallback(this);
            }
        });

        this.on('drag', (pointer, dragX, dragY) => {
            this.x = dragX;
            this.y = dragY;
        });

        this.on('dragend', (pointer) => {
            this.isDragging = false;
            this.setDepth(100);
            this.setScale(this.baseScale);
            scene.input.setDefaultCursor('default');

            if (this.onDragEndCallback) {
                this.onDragEndCallback(this);
            } else {
                this.returnToStart()
            }
        });

        this.on('pointerover', () => {
            if (this.isDragging) return;
            this.setScale(this.hoverScale);
        });

        this.on('pointerout', () => {
            if (this.isDragging) return;
            this.setScale(this.baseScale);
        });
    }

    forceDragEnd() {
        this.isDragging = false;
        this.setDepth(100);

        if (this.onDragEndCallback) {
            this.onDragEndCallback(this);
        }
    }

    returnToStart(duration = 300) {
        this.scene.tweens.add({
            targets: this,
            x: this.initialX,
            y: this.initialY,
            duration,
            ease: 'Back.easeOut'
        });
        return this;
    }

    disableDrag() {
        this.disableInteractive();
        return this;
    }

    enableDrag() {
        this.setInteractive({ cursor: 'grab', draggable: true });
        return this;
    }

    resetScale() {
        this.setScale(this.baseScale);
        return this;
    }
}
