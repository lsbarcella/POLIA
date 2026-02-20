import { BaseCena } from '../../js/library/base/BaseCena.js';
import { FeedbackScore } from '../../js/library/components/FeedbackScore.js';
import { Help } from '../../js/library/components/Help.js';
import { Sidebar } from '../../js/library/components/SideBar.js';
import { TaskButton } from '../../js/library/components/Task.js';
import { TutorialHand } from '../../js/library/components/TutorialHand.js';
import { DropZoneButton } from '../../js/library/components/DropzoneButton.js';
import SoundManager from '../../js/library/managers/SoundManager.js';

export class Intro extends BaseCena {
    constructor(controladorDeCenas) {
        super('Intro');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;
    }

    create() {
        this.background = this.add.image(0, 0, 'bgIntro1').setOrigin(0, 0);
        this.box = this.add.image(1060, 800, 'objectsCaixa')
        this.taskButton = new TaskButton(this, {
            modalTexture: 'taskInfoIntro'
        });

        const pulleyX = 1124;
        const pulleyY = 190;
        const ropeRightOffsetX = 140;
        const boxLiftDistance = 220;
        const pegadorMoveAngleDeg = 73;
        const pegadorMoveDistance = boxLiftDistance;
        const pegadorMoveX = Math.cos((pegadorMoveAngleDeg * Math.PI) / 180) * pegadorMoveDistance;
        const pegadorMoveY = Math.sin((pegadorMoveAngleDeg * Math.PI) / 180) * pegadorMoveDistance;
        const pullButtonOffsetX = 120;
        const pullButtonOffsetY = -60;

        this.ropeLeft = this.add.image(pulleyX - 66, pulleyY, 'objectsCordaCaixa')
            .setOrigin(0.5, 0)
            .setVisible(false);
        this.ropeRight = this.add.image(pulleyX + ropeRightOffsetX + 14, pulleyY, 'objectsCordaPolia')
            .setOrigin(0.5, 0)
            .setVisible(false);
        this.pegador = this.add.image(pulleyX + 110, pulleyY + 190, 'objectsPegadorCorda')
            .setOrigin(0.5)
            .setVisible(false);
        this.pullButton = this.add.image(0, 0, 'iconePuxarCorda')
            .setOrigin(0.5)
            .setVisible(false)
            .setInteractive({ cursor: 'pointer' });

        this.ropeLeftMaskGfx = this.add.graphics().setVisible(false);
        this.ropeRightMaskGfx = this.add.graphics().setVisible(false);

        this.ropeLeft.setMask(this.ropeLeftMaskGfx.createGeometryMask());
        this.ropeRight.setMask(this.ropeRightMaskGfx.createGeometryMask());

        this.updateRopeMasks = () => {
            const leftTop = pulleyY;
            const boxTop = this.box.y - (this.box.displayHeight / 2);
            const leftHeight = Math.max(0, boxTop - leftTop);

            this.ropeLeftMaskGfx.clear();
            this.ropeLeftMaskGfx.fillStyle(0xffffff, 1);
            this.ropeLeftMaskGfx.fillRect(
                this.ropeLeft.x - (this.ropeLeft.displayWidth / 2),
                leftTop,
                this.ropeLeft.displayWidth,
                leftHeight
            );

            const rightTop = pulleyY;
            const rightHeight = Math.max(0, this.pegador.y - rightTop);

            this.ropeRightMaskGfx.clear();
            this.ropeRightMaskGfx.fillStyle(0xffffff, 1);
            this.ropeRightMaskGfx.fillRect(
                this.ropeRight.x - (this.ropeRight.displayWidth / 2),
                rightTop,
                this.ropeRight.displayWidth,
                rightHeight
            );
        };

        this.showRopeAssets = () => {
            this.ropeLeft.setVisible(true);
            this.ropeRight.setVisible(true);
            this.pegador.setVisible(true);
            this.updateRopeMasks();
        };

        this.startRopeAnimation = () => {
            if (this.ropeAnimationStarted) {
                return;
            }
            this.ropeAnimationStarted = true;
            this.showRopeAssets();

            if (this.boxLiftTween) {
                this.boxLiftTween.stop();
            }
            if (this.pegadorTween) {
                this.pegadorTween.stop();
            }

            this.boxLiftTween = this.tweens.add({
                targets: this.box,
                y: this.box.y - boxLiftDistance,
                duration: 1400,
                ease: 'Sine.inOut',
                onUpdate: this.updateRopeMasks,
                onComplete: this.updateRopeMasks
            });

            this.pegadorTween = this.tweens.add({
                targets: this.pegador,
                x: this.pegador.x + pegadorMoveX,
                y: this.pegador.y + pegadorMoveY,
                duration: 1400,
                ease: 'Sine.inOut',
                onUpdate: this.updateRopeMasks,
                onComplete: this.updateRopeMasks
            });
        };

        this.pullButton.on('pointerdown', () => {
            if (!this.pullButton.visible) {
                return;
            }
            this.pullButton.disableInteractive();
            this.pullButton.setVisible(false);
            if (this.startRopeAnimation) {
                this.startRopeAnimation();
            }
        });

        this.help = new Help(this);
        this.helpButton = this.add.image(40, 180, 'helpBotao')
            .setOrigin(0, 0)
            .setDepth(9999)
            .setInteractive({ cursor: 'pointer' });
        this.helpButton.on('pointerdown', () => {
            if (!SoundManager.game && this.game) {
                SoundManager.init(this.game);
            }
            SoundManager.play('click', 1, false, () => { });
            this.help.open();
        });

        this.modalScore = new FeedbackScore(this, {
            score: 3,
            fase: 1
        })
        this.sideBar = new Sidebar(this, {
            isTutorial: true,
            pulleyCount: 1,
            ropeFocusPoints: [
                { id: 'top', x: 1124, y: 190, connectsTo: ['bottom'] },
                { id: 'bottom', x: 1070, y: 800 }
            ],
            ropeOnAllConnectionsComplete: () => {
                if (this.box?.setTexture) {
                    this.box.setTexture('objectsCaixaAmarrada');
                }
                if (this.showRopeAssets) {
                    this.showRopeAssets();
                }
                if (this.pullButton) {
                    this.pullButton.setPosition(
                        this.pegador.x + pullButtonOffsetX,
                        this.pegador.y + pullButtonOffsetY
                    );
                    this.pullButton.setVisible(true);
                    this.pullButton.setInteractive({ cursor: 'pointer' });
                }
            }
        })

        this.dropzone = new DropZoneButton(this, {
            x: 1124,
            y: 190,
            texture: 'objectsElipse',
            onDrop: (gameObject, dropzone) => {
                if (!gameObject || gameObject.id !== 'polia') {
                    return;
                }
                if (this.sideBar?.setPulleyCount) {
                    this.sideBar.setPulleyCount(0);
                }
                if (this.sideBar?.ropeButton?.setEnabled) {
                    this.sideBar.ropeButton.setEnabled(true);
                }
                dropzone.setVisible(false);
                if (typeof dropzone.disable === 'function') {
                    dropzone.disable();
                }
                this.add.image(dropzone.x, dropzone.y, 'objectsPoliaFixa')
                    .setOrigin(0.5);
            }
        });

        this.tutorialClick = new TutorialHand(this, {
            type: 'click',
            x: 1840,
            y: 370,
            repeat: -1
        });

        this.tutorialDrag = new TutorialHand(this, {
            type: 'drag',
            startX: 640,
            startY: 520,
            endX: 1040,
            endY: 520,
            repeat: 3
        });

        // this.modalScore.show()

        super.create();
    }
}

export default Intro;
