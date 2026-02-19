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
        this.box = this.add.image(1070, 800, 'objectsCaixa')
        this.taskButton = new TaskButton(this, {
            modalTexture: 'taskInfoIntro'
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
            pulleyCount: 1,
            ropeFocusPoints: [
                { x: 1124, y: 190 },
                { x: 1070, y: 800 }
            ]
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
                dropzone.setVisible(false);
                if (typeof dropzone.disable === 'function') {
                    dropzone.disable();
                }
                this.add.image(dropzone.x, dropzone.y, 'objectsPoliaFixa')
                    .setOrigin(0.5);
            }
        });

        // this.tutorialClick = new TutorialHand(this, {
        //     type: 'click',
        //     x: 320,
        //     y: 520,
        //     repeat: -1
        // });

        // this.tutorialDrag = new TutorialHand(this, {
        //     type: 'drag',
        //     startX: 640,
        //     startY: 520,
        //     endX: 1040,
        //     endY: 520,
        //     repeat: 3
        // });

        // this.modalScore.show()

        super.create();
    }
}

export default Intro;
