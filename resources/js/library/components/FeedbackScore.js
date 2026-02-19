import { Button } from "./Button.js";

const SCORE_CONFIG = {
    1: { title: 'BOA RESPOSTA', starsTexture: 'score1Star' },
    2: { title: 'MUITO BEM', starsTexture: 'score2Stars' },
    3: { title: 'EXCELENTE!', starsTexture: 'score3Stars' }
};

const FASE_TEXTOS = {
    1: 'Você completou a fase 1',
    2: 'Você completou a fase 2',
    3: 'Você completou a fase 3'
};

const normalizeIndex = (value, fallback = 1) => {
    const parsed = Number(value);
    if (parsed === 1 || parsed === 2 || parsed === 3) {
        return parsed;
    }
    return fallback;
};

export class FeedbackScore {
    constructor(scene, {
        isVisible = false,
        score = 1,
        fase = 1,
        onButtonClick = () => {}
    } ={}) {
        this.scene = scene;
        this.isVisible = isVisible;
        this.score = normalizeIndex(score, 1);
        this.fase = normalizeIndex(fase, 1);
        this.onButtonClick = onButtonClick;  // Armazena o onButtonClick
        this.create();
    }

    create() {
        // Fundo preto com transparência
        this.background = this.scene.add.rectangle(0, 0, 1920, 1080, 0x000000);
        this.background.setAlpha(0.3);
        this.background.setOrigin(0, 0);
        this.background.setInteractive();

        this.imageBox = this.scene.add.image(
            1920/2,
            1080/2.5,
            'scoreModalBg'
        ).setOrigin(0.5, 0.5);

        const initialScoreConfig = SCORE_CONFIG[this.score];
        this.stars = this.scene.add.image(
            this.imageBox.x,
            this.imageBox.y + (this.imageBox.height/5),
            initialScoreConfig?.starsTexture || 'score1Star'
        ).setOrigin(0.5);

        const titleStyle = {
            fontFamily: 'Nunito-ExtraBold',
            fontSize: '48px',
            color: '#FFFFFF',
            align: 'center',
            stroke: '#1F292D',
            strokeThickness: 12,
            fontStyle: 'normal',
            lineSpacing: 'normal'
        };

        this.titleText = this.scene.add.text(
            this.imageBox.x,
            this.imageBox.y - 120,  // Ajuste a posição Y conforme necessário
            '',
            titleStyle
        ).setOrigin(0.5);

        // Retângulo de referência para o texto (invisível)
        const textBox = this.scene.add.rectangle(
            this.imageBox.x - 140, 
            this.imageBox.y - 40,  
            1137,
            300,
            0xFF0000
        ).setOrigin(0.5);
        textBox.setAlpha(0);  // Torna invisível

        // Texto principal usando DOM
        this.mainText = this.scene.add.dom(textBox.x, textBox.y).createFromHTML(this.buildTextHTML(''));
        this.mainText.setOrigin(0.5);

        const btContinuar = new Button(this.scene, { text: 'CONTINUAR' });
        btContinuar.setPosition(this.imageBox.x - (btContinuar.width / 2), this.imageBox.y + 340);
        btContinuar.on('buttonClick', () => {
            this.hide();
            if (this.onButtonClick) {
                this.onButtonClick(); 
            }
        });

        this.container = this.scene.add.container(0, 0, [
            this.background,
            this.imageBox,
            this.stars,
            this.titleText,
            textBox,
            this.mainText,
            btContinuar
        ]);

        this.container.setVisible(false);
        this.container.setDepth(9999);
        this.applyScoreData(this.score, this.fase);
    }

    show() {
        this.container.setVisible(true);
        this.isVisible = true;
    }

    hide() {
        this.container.setVisible(false);
        this.isVisible = false;
    }

    setScore(score, fase = this.fase) {
        this.applyScoreData(score, fase);
        return this;
    }

    applyScoreData(score, fase) {
        this.score = normalizeIndex(score, this.score);
        this.fase = normalizeIndex(fase, this.fase);

        const scoreConfig = SCORE_CONFIG[this.score];
        const texto = FASE_TEXTOS[this.fase];

        if (this.titleText && scoreConfig?.title) {
            this.titleText.setText(scoreConfig.title);
        }

        if (this.stars && scoreConfig?.starsTexture) {
            this.stars.setTexture(scoreConfig.starsTexture);
        }

        if (this.mainText && texto) {
            this.mainText.setHTML(this.buildTextHTML(texto));
        }
    }

    buildTextHTML(texto) {
        return `
            <div style="
                font-family: Nunito-SemiBold;
                font-size: 30px;
                color: #1F292D;
                text-align: center;
                width: 1137px;
                user-select: text;
                -webkit-user-select: text;
                line-height: 52px;
            ">
                ${texto}
            </div>
        `;
    }
}
