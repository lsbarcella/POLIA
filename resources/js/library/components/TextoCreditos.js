export class TextoCreditos extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        scene.add.existing(this);

        this.setDepth(99999);

        const maxWidth = 1122; // Largura máxima do texto

        // Configuração do estilo do título
        const titleStyle = {
            color: '#000',
            fontFamily: 'Nunito-ExtraBold',
            fontSize: '36px',
            fontWeight: '800',
            lineHeight: 1.2,
            textTransform: 'uppercase',
            wordWrap: { width: maxWidth }
        };

        // Configuração do estilo do texto
        const textStyle = {
            color: '#000',
            fontFamily: 'Nunito',
            fontSize: '35px',
            fontWeight: '400',
            lineHeight: 1,
            lineSpacing: 2,
            wordWrap: { width: maxWidth }
        };

        // Criação do título
        this.titulo = scene.add.text(0, 0, '', titleStyle)
            .setOrigin(0, 0);

        // Criação do texto, posicionado 50px abaixo do título
        this.texto = scene.add.text(0, 50, '', textStyle)
            .setOrigin(0, 0);

        // Adiciona os textos ao container
        this.add([this.titulo, this.texto]);
    }

    // Método para atualizar os textos
    setTextos(titulo, texto) {
        this.titulo.setText(titulo);
        this.texto.setText(texto);

        // Atualiza a posição do texto baseado na altura real do título
        this.texto.y = this.titulo.height + 20;

        // Retorna a altura total atualizada
        return this.titulo.height + this.texto.y + this.texto.height;
    }

    // Getter para obter a altura total atual
    get height() {
        return this.titulo.height + this.texto.y + this.texto.height;
    }
}