import SoundManager from "../managers/SoundManager.js";

export class RopeButton extends Phaser.GameObjects.Image {
    constructor(scene, {
        x = 0,
        y = 0,
        texture = 'objectsCorda',
        scale = 1,
        depth = null,
        focusPoints = [],
        focusConnections = [],
        onAllConnectionsComplete = null,
        enabled = true,
        focusTexture = 'objectsFocoPequeno',
        focusScale = 1,
        focusDepth = 8000,
        focusAlpha = 1,
        spawnOnce = true,
        pulseScale = 1.12,
        pulseDuration = 500,
        focusHoverScale = 1.08
    } = {}) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.focusPoints = Array.isArray(focusPoints) ? focusPoints : [];
        this.focusConnections = this.normalizeFocusConnections(focusConnections);
        this.onAllConnectionsComplete = typeof onAllConnectionsComplete === 'function'
            ? onAllConnectionsComplete
            : null;
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
        this.focusMetaBySprite = new Map();
        this.focusById = new Map();
        this.focusConnectionMap = new Map();
        this.pairConnectionMap = new Map();
        this.requiredConnections = new Set();
        this.completedConnections = new Set();
        this.allConnectionsCompleteFired = false;
        this.isEnabled = true;
        this.isActive = false;
        this.pulseTween = null;
        this.lineStartFocus = null;
        this.lineEndFocus = null;
        this.isDrawingLine = false;
        this.lineDepth = 7999;
        this.lineColor = 0xFFE650;
        this.lineThickness = 8;
        this.lineStrokeThickness = 4;
        this.lineOutlineGraphics = scene.add.graphics();
        this.lineGraphics = scene.add.graphics();
        this.errorFeedbackImage = null;
        this.errorFeedbackTween = null;

        this.setOrigin(0.5);
        this.setScale(scale);
        this.setInteractive({ cursor: 'pointer' });

        if (depth != null) {
            this.setDepth(depth);
        }

        this.on('pointerdown', () => {
            this.toggleFocus();
        });

        scene.input.on('pointermove', this.handlePointerMove, this);

        scene.add.existing(this);
        this.setEnabled(enabled);
    }

    normalizePoint(point) {
        if (Array.isArray(point) && point.length >= 2) {
            return {
                x: Number(point[0]) || 0,
                y: Number(point[1]) || 0,
                id: this.normalizeId(point[2]),
                connectsTo: []
            };
        }
        if (point && typeof point === 'object') {
            return {
                x: Number(point.x) || 0,
                y: Number(point.y) || 0,
                id: this.normalizeId(point.id ?? point.focusId ?? point.key),
                connectsTo: this.normalizeIdList(
                    point.connectsTo ?? point.connectTo ?? point.connections ?? point.connects
                )
            };
        }
        return { x: 0, y: 0, id: null, connectsTo: [] };
    }

    spawnFocus() {
        if (!this.focusPoints.length) {
            return this;
        }

        if (this.focusSprites.length) {
            this.showFocus();
            return this;
        }

        this.focusMetaBySprite.clear();
        this.focusById.clear();

        const created = [];
        this.focusPoints.forEach((point) => {
            const data = this.normalizePoint(point);
            const focus = this.scene.add.image(data.x, data.y, this.focusTexture)
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
            focus.on('pointerdown', () => {
                this.handleFocusClick(focus);
            });

            if (this.focusDepth != null) {
                focus.setDepth(this.focusDepth);
            }

            if (data.id) {
                this.focusById.set(data.id, focus);
            }
            this.focusMetaBySprite.set(focus, data);

            created.push(focus);
        });

        this.focusSprites = this.focusSprites.concat(created);
        this.rebuildConnectionMap();
        this.updateLineDepth();
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
        this.rebuildConnectionMap();
        return this;
    }

    setFocusConnections(connections = []) {
        this.focusConnections = this.normalizeFocusConnections(connections);
        this.rebuildConnectionMap();
        return this;
    }

    clearFocus() {
        this.focusSprites.forEach((sprite) => sprite.destroy());
        this.focusSprites = [];
        this.focusMetaBySprite.clear();
        this.focusById.clear();
        this.resetConnectionsProgress();
        this.clearLine();
        return this;
    }

    hideFocus() {
        this.focusSprites.forEach((sprite) => sprite.setVisible(false));
        return this;
    }

    toggleFocus() {
        if (!this.isEnabled) {
            return this;
        }
        if (this.isActive) {
            this.isActive = false;
            this.hideFocus();
            this.stopPulse();
            this.clearLine();
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

    handlePointerMove(pointer) {
        if (!this.isEnabled || !this.isDrawingLine || !this.lineStartFocus) {
            return;
        }
        const startX = this.lineStartFocus.x;
        const startY = this.lineStartFocus.y;
        const endX = pointer.worldX;
        const endY = pointer.worldY;
        this.drawLine(startX, startY, endX, endY);
    }

    handleFocusClick(focus) {
        if (!this.isEnabled || !this.isActive) {
            return;
        }

        if (!this.lineStartFocus || !this.isDrawingLine) {
            this.startLineFromFocus(focus);
            return;
        }

        if (focus === this.lineStartFocus) {
            return;
        }

        if (!this.canConnect(this.lineStartFocus, focus)) {
            this.handleInvalidConnection(this.lineStartFocus, focus);
            this.clearLine();
            return;
        }

        this.lineEndFocus = focus;
        this.isDrawingLine = false;
        this.drawLine(
            this.lineStartFocus.x,
            this.lineStartFocus.y,
            this.lineEndFocus.x,
            this.lineEndFocus.y
        );
        this.recordConnection(this.lineStartFocus, this.lineEndFocus);
    }

    startLineFromFocus(focus) {
        this.lineStartFocus = focus;
        this.lineEndFocus = null;
        this.isDrawingLine = true;
        this.drawLine(focus.x, focus.y, focus.x, focus.y);
    }

    clearLine() {
        this.isDrawingLine = false;
        this.lineStartFocus = null;
        this.lineEndFocus = null;
        if (this.lineOutlineGraphics) {
            this.lineOutlineGraphics.clear();
        }
        if (this.lineGraphics) {
            this.lineGraphics.clear();
        }
    }

    updateLineDepth() {
        if (!this.lineOutlineGraphics || !this.lineGraphics) {
            return;
        }

        const lineDepth = this.lineDepth ?? 7999;
        this.lineOutlineGraphics.setDepth(lineDepth);
        this.lineGraphics.setDepth(lineDepth);
    }

    drawLine(startX, startY, endX, endY) {
        if (!this.lineOutlineGraphics || !this.lineGraphics) {
            return;
        }

        const outlineWidth = this.lineThickness + (this.lineStrokeThickness * 2);

        this.lineOutlineGraphics.clear();
        this.lineOutlineGraphics.lineStyle(outlineWidth, 0x000000, 1);
        this.lineOutlineGraphics.beginPath();
        this.lineOutlineGraphics.moveTo(startX, startY);
        this.lineOutlineGraphics.lineTo(endX, endY);
        this.lineOutlineGraphics.strokePath();

        this.lineGraphics.clear();
        this.lineGraphics.lineStyle(this.lineThickness, this.lineColor, 1);
        this.lineGraphics.beginPath();
        this.lineGraphics.moveTo(startX, startY);
        this.lineGraphics.lineTo(endX, endY);
        this.lineGraphics.strokePath();
    }

    setEnabled(enabled = true) {
        const nextEnabled = Boolean(enabled);
        if (this.isEnabled === nextEnabled) {
            return this;
        }
        this.isEnabled = nextEnabled;

        if (this.isEnabled) {
            this.setAlpha(1);
            this.setInteractive({ cursor: 'pointer' });
        } else {
            this.setAlpha(0.6);
            this.disableInteractive();
            this.isActive = false;
            this.hideFocus();
            this.clearLine();
            this.stopPulse();
        }

        this.focusSprites.forEach((sprite) => {
            if (this.isEnabled) {
                sprite.setInteractive({ cursor: 'pointer' });
            } else {
                sprite.disableInteractive();
            }
        });

        return this;
    }

    handleInvalidConnection(startFocus, endFocus) {
        if (typeof this.onInvalidConnection !== 'function') {
            return;
        }
        this.onInvalidConnection({
            startFocus,
            endFocus,
            startId: this.getFocusId(startFocus),
            endId: this.getFocusId(endFocus),
            ropeButton: this
        });
    }

    onInvalidConnection() {
        if (!SoundManager.game && this.scene?.game) {
            SoundManager.init(this.scene.game);
        }
        SoundManager.play('erro', 1, false, () => { });

        if (!this.scene) {
            return;
        }

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        if (!this.errorFeedbackImage) {
            this.errorFeedbackImage = this.scene.add.image(centerX, centerY, 'feedbackErro')
                .setOrigin(0.5)
                .setDepth(9999)
                .setAlpha(0)
                .setVisible(false);
        }

        this.errorFeedbackImage.setPosition(centerX, centerY);
        this.errorFeedbackImage.setDepth(9999);
        this.errorFeedbackImage.setAlpha(0);
        this.errorFeedbackImage.setVisible(true);

        if (this.errorFeedbackTween) {
            this.errorFeedbackTween.stop();
            this.errorFeedbackTween = null;
        }

        this.errorFeedbackTween = this.scene.tweens.add({
            targets: this.errorFeedbackImage,
            alpha: 1,
            duration: 200,
            ease: 'Sine.out',
            yoyo: true,
            hold: 1000,
            onComplete: () => {
                if (this.errorFeedbackImage) {
                    this.errorFeedbackImage.setVisible(false);
                }
                this.errorFeedbackTween = null;
            }
        });
    }

    normalizeId(value) {
        if (value === null || value === undefined) {
            return null;
        }
        const id = String(value).trim();
        return id ? id : null;
    }

    normalizeIdList(value) {
        if (value === null || value === undefined) {
            return [];
        }
        const list = Array.isArray(value) ? value : [value];
        const ids = new Set();
        list.forEach((item) => {
            const id = this.normalizeId(item);
            if (id) {
                ids.add(id);
            }
        });
        return Array.from(ids);
    }

    normalizeFocusConnections(connections) {
        if (Array.isArray(connections)) {
            return connections;
        }
        if (connections && typeof connections === 'object') {
            return Object.entries(connections).map(([from, to]) => ({ from, to }));
        }
        return [];
    }

    normalizeConnectionPairs(connection) {
        if (Array.isArray(connection) && connection.length >= 2) {
            return [[connection[0], connection[1]]];
        }
        if (connection && typeof connection === 'object') {
            const from = connection.from ?? connection.source ?? connection.a;
            const to = connection.to ?? connection.target ?? connection.b;
            if (from !== undefined && Array.isArray(to)) {
                return to.map((item) => [from, item]);
            }
            if (from !== undefined && to !== undefined) {
                return [[from, to]];
            }
        }
        return [];
    }

    addConnection(map, fromId, toId) {
        if (!fromId || !toId) {
            return;
        }
        const existing = map.get(fromId) ?? new Set();
        existing.add(toId);
        map.set(fromId, existing);
    }

    rebuildConnectionMap() {
        this.focusConnectionMap.clear();
        this.pairConnectionMap.clear();
        this.resetConnectionsProgress();

        this.focusPoints.forEach((point) => {
            const data = this.normalizePoint(point);
            if (!data.id || !data.connectsTo.length) {
                return;
            }
            data.connectsTo.forEach((targetId) => {
                this.addConnection(this.focusConnectionMap, data.id, targetId);
                this.addConnection(this.focusConnectionMap, targetId, data.id);
            });
        });

        this.focusConnections.forEach((connection) => {
            const pairs = this.normalizeConnectionPairs(connection);
            pairs.forEach(([from, to]) => {
                const fromId = this.normalizeId(from);
                const toId = this.normalizeId(to);
                if (!fromId || !toId) {
                    return;
                }
                this.addConnection(this.pairConnectionMap, fromId, toId);
                this.addConnection(this.pairConnectionMap, toId, fromId);
            });
        });

        this.focusPoints.forEach((point) => {
            const data = this.normalizePoint(point);
            if (!data.id || !data.connectsTo.length) {
                return;
            }
            data.connectsTo.forEach((targetId) => {
                const key = this.makePairKey(data.id, targetId);
                if (key) {
                    this.requiredConnections.add(key);
                }
            });
        });
    }

    getFocusId(focus) {
        const data = this.focusMetaBySprite.get(focus);
        return data?.id ?? null;
    }

    canConnect(startFocus, endFocus) {
        const startId = this.getFocusId(startFocus);
        const endId = this.getFocusId(endFocus);
        if (!startId || !endId) {
            return true;
        }
        if (this.pairConnectionMap.size) {
            return this.pairConnectionMap.get(startId)?.has(endId) ?? false;
        }
        if (this.focusConnectionMap.size) {
            const allowed = this.focusConnectionMap.get(startId);
            return allowed ? allowed.has(endId) : false;
        }
        return true;
    }

    makePairKey(a, b) {
        const first = this.normalizeId(a);
        const second = this.normalizeId(b);
        if (!first || !second) {
            return null;
        }
        return [first, second].sort().join('|');
    }

    resetConnectionsProgress() {
        this.requiredConnections = new Set();
        this.completedConnections = new Set();
        this.allConnectionsCompleteFired = false;
    }

    recordConnection(startFocus, endFocus) {
        const startId = this.getFocusId(startFocus);
        const endId = this.getFocusId(endFocus);
        const key = this.makePairKey(startId, endId);
        if (!key) {
            return;
        }
        if (this.requiredConnections.size && this.requiredConnections.has(key)) {
            this.completedConnections.add(key);
            this.checkAllConnectionsComplete();
        }
    }

    checkAllConnectionsComplete() {
        if (this.allConnectionsCompleteFired) {
            return;
        }
        if (!this.requiredConnections.size) {
            return;
        }
        for (const key of this.requiredConnections) {
            if (!this.completedConnections.has(key)) {
                return;
            }
        }
        this.allConnectionsCompleteFired = true;
        if (this.onAllConnectionsComplete) {
            this.hideFocus();
            this.clearLine();
            this.onAllConnectionsComplete({
                required: Array.from(this.requiredConnections),
                completed: Array.from(this.completedConnections),
                ropeButton: this
            });
        }
    }

    destroy() {
        if (this.scene?.input) {
            this.scene.input.off('pointermove', this.handlePointerMove, this);
        }
        if (this.errorFeedbackTween) {
            this.errorFeedbackTween.stop();
            this.errorFeedbackTween = null;
        }
        if (this.errorFeedbackImage) {
            this.errorFeedbackImage.destroy();
            this.errorFeedbackImage = null;
        }
        if (this.lineOutlineGraphics) {
            this.lineOutlineGraphics.destroy();
        }
        if (this.lineGraphics) {
            this.lineGraphics.destroy();
        }
        this.clearFocus();
        super.destroy();
    }
}
