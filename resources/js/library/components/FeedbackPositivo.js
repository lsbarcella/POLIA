export class FeedbackPositivo {
    constructor(scene, titulo = 'MUITO BEM!', texto = 'PARABÉNS, VOCÊ ACERTOU!', isFinal = false) {
        this.scene = scene;
        this.isVisible = false;
        this.titulo = titulo;
        this.texto = texto;
        this.isFinal = isFinal;  // Novo parâmetro para controlar o tipo de feedback
        this.create();
    }

    create() {
        // Fundo preto com transparência
        this.background = this.scene.add.rectangle(0, 0, 1920, 1080, 0x000000);
        this.background.setAlpha(0.8);
        this.background.setOrigin(0, 0);
        this.background.setInteractive();

        // Modal de feedback positivo
        this.imageBox = this.scene.add.image(
            1920/2,
            1080/2,
            'modalFeedbackPositivo'
        ).setOrigin(0.5, 0.5);

        // Personagem Digi Positivo
        this.digi = this.scene.add.image(
            this.imageBox.x + (this.imageBox.width/2) - 185,  // Posição X ajustada para o canto direito
            this.imageBox.y + (this.imageBox.height/2) - 190,   // Posição Y ajustada para o canto inferior
            'digiPositivo'
        ).setOrigin(0.5);

        // Título com mesmo estilo do Enunciado
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

        // Posições diferentes para feedback final e parcial
        const layoutConfig = this.isFinal ? {
            titleY: this.imageBox.y - 150,  // Título mais próximo do centro
            textBoxY: this.imageBox.y + 40  // TextBox com offset de 40px
        } : {
            titleY: this.imageBox.y - 250,  // Posição original do título
            textBoxY: this.imageBox.y + 30  // Posição original do textBox
        };

        // Título com mesmo estilo do Enunciado
        const title = this.scene.add.text(
            this.imageBox.x,
            layoutConfig.titleY,
            this.titulo,
            titleStyle
        ).setOrigin(0.5);

        // Retângulo de referência para o texto (invisível)
        const textBox = this.scene.add.rectangle(
            this.imageBox.x,  // centralizado com imageBox
            layoutConfig.textBoxY,  // Usa a posição Y configurada
            1137,  // largura especificada
            400,   // altura especificada
            0xFF0000  // cor vermelha
        ).setOrigin(0.5);
        textBox.setAlpha(0);  // Torna invisível

        // Texto principal usando DOM
        const mainText = this.scene.add.dom(textBox.x, textBox.y).createFromHTML(`
            <div style="
                font-family: Nunito-ExtraBold;
                font-size: 38px;
                font-weight: 800;
                color: #1F292D;
                text-align: center;
                width: 1137px;
                user-select: text;
                -webkit-user-select: text;
                text-transform: uppercase;
                line-height: 52px;
            ">
                ${this.texto}
            </div>
        `);
        mainText.setOrigin(0.5);

        // Botão que muda dependendo do tipo de feedback
        const buttonConfig = this.isFinal ? {
            texture: 'btJogarNovamente',
            y: this.imageBox.y + 120 // Posição mais centralizada para btJogarNovamente
        } : {
            texture: 'btVamosLa',
            y: this.imageBox.y + (this.imageBox.height/2) - 190  // Alinhado com o digiPositivo
        };

        const button = this.scene.add.image(
            this.imageBox.x,  // Centralizado horizontalmente com o modal
            buttonConfig.y,   // Usa a posição Y específica para cada tipo
            buttonConfig.texture
        ).setInteractive();

        button.on('pointerdown', () => {
            if (this.isFinal) {
                this.hide();
                this.scene.scene.restart();  // Reinicia a cena atual
            } else {
                this.hide();  // Apenas esconde o feedback
            }
        });

        // Container agrupando todos os elementos
        this.container = this.scene.add.container(0, 0, [
            this.background,
            this.imageBox,
            this.digi,
            title,
            textBox,        // Adicionando o retângulo de referência
            mainText,
            button
        ]);

        // Inicialmente escondido e no topo
        this.container.setVisible(false);
        this.container.setDepth(9999);
    }

    show() {
        this.container.setVisible(true);
        this.isVisible = true;
    }

    hide() {
        this.container.setVisible(false);
        this.isVisible = false;
    }
}