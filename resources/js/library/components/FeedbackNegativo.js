export class FeedbackNegativo {
    constructor(scene, titulo = 'OPA! VAMOS TENTAR DE NOVO?', texto = 'LEIA O ENUNCIADO MAIS UMA VEZ E TENTE RESPONDER À QUESTÃO NOVAMENTE.', callback = null) {
        this.scene = scene;
        this.isVisible = false;
        this.titulo = titulo;
        this.texto = texto;
        this.callback = callback;  // Armazena o callback
        this.create();
    }

    create() {
        // Fundo preto com transparência
        this.background = this.scene.add.rectangle(0, 0, 1920, 1080, 0x000000);
        this.background.setAlpha(0.8);
        this.background.setOrigin(0, 0);
        this.background.setInteractive();

        // Modal de feedback negativo
        this.imageBox = this.scene.add.image(
            1920/2,
            1080/2,
            'modalFeedbackNegativo'
        ).setOrigin(0.5, 0.5);

        // Personagem Digi Negativo
        this.digi = this.scene.add.image(
            this.imageBox.x + (this.imageBox.width/2) - 185,  // Posição X ajustada para o canto direito
            this.imageBox.y + (this.imageBox.height/2) - 190,   // Posição Y ajustada para o canto inferior
            'digiNegativo'
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

        const title = this.scene.add.text(
            this.imageBox.x,
            this.imageBox.y - 250,  // Ajuste a posição Y conforme necessário
            this.titulo,
            titleStyle
        ).setOrigin(0.5);

        // Retângulo de referência para o texto (invisível)
        const textBox = this.scene.add.rectangle(
            this.imageBox.x,  // centralizado com imageBox
            this.imageBox.y ,  // centro
            1137,  // largura especificada
            300,   // altura especificada
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

        // Botão Voltar com callback
        const btVoltar = this.scene.add.image(
            this.imageBox.x,
            this.imageBox.y + (this.imageBox.height/2) - 120,
            'btVoltar'
        ).setInteractive();

        btVoltar.on('pointerdown', () => {
            this.hide();  // Esconde o feedback
            if (this.callback) {
                this.callback();  // Executa o callback se existir
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
            btVoltar
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