/**
 * @Enunciado.js Classe padrão para o enunciado do SAE.
 */

import SoundManager from '../managers/SoundManager.js';

export class Enunciado {

    constructor(scene) {
        this.scene = scene;
        
        if (!SoundManager.game) {
            SoundManager.init(scene.game);
        }

        this.isVisible = false;
        this.audio = ""; // Define um áudio padrão inicial
        
        this.create();
    }

    create() {
        // Criar o fundo preto com transparência
        this.background = this.scene.add.rectangle(0, 0, 1920, 1080, 0x000000);
        this.background.setAlpha(0.8);
        this.background.setOrigin(0, 0);
        this.background.setInteractive();

        // Substituir o retângulo branco pela imagem modalEnunciado
        this.imageBox = this.scene.add.image(
            1920 / 2,    // x centralizado
            1080 / 2,    // y centralizado
            'modalEnunciado'
        );
        this.imageBox.setOrigin(0.5, 0.5);

        // Botão de Narração (criando primeiro para usar como referência)
        this.btNarracao = this.scene.add.image(
            this.imageBox.x - (this.imageBox.width / 2) + 77,
            this.imageBox.y - (this.imageBox.height / 2) + 160,
            'btNarracao'
        ).setInteractive();
        

        const audioTexto = [{
            audio: "NA002", texto: "Ajudando BErnardo. PARA CONHECER UM POUCO MAIS SOBRE A PRÓPRIA FAMÍLIA, BERNARDO DECIDIU CRIAR UMA ÁRVORE GENEALÓGICA. AJUDE BERNARDO A CRIAR A ÁRVORE DA SUA FAMÍLIA!"
        }];


        this.btNarracao.on('pointerdown', () => {
            if (this.audio) { // Verifica se existe um áudio definido
                SoundManager.stopAll();
                SoundManager.play(this.audio);
            } else {
                console.warn('Nenhum áudio definido para reprodução');
            }
        });

        // Título (alinhado verticalmente com btNarracao)
        const titleStyle = {
            fontFamily: 'Nunito-ExtraBold',
            fontSize: '48px',
            color: '#FFFFFF',
            align: 'center',
            stroke: '#1F292D',
            strokeThickness: 12,
            fontStyle: 'normal',
            lineSpacing: 10,
            wordWrap: { width: 1000, useAdvancedWrap: true }
        };

        this.title = this.scene.add.text(
            this.imageBox.x,
            this.btNarracao.y,  // Mesmo Y do btNarracao
            '',
            titleStyle
        ).setOrigin(0.5);

        // Retângulo de referência para o texto (vermelho)
        this.textBox = this.scene.add.rectangle(
            this.imageBox.x,  // centralizado com imageBox
            this.imageBox.y + 30,  // centro + offset
            1137,  // largura especificada
            400,   // altura especificada
            0xFF0000  // cor vermelha
        ).setOrigin(0.5);
        this.textBox.setAlpha(0);

        // Texto principal usando add.text
        const mainTextStyle = {
            fontFamily: 'Nunito-ExtraBold',
            fontSize: '38px',
            fontWeight: '800',
            color: '#1F292D',
            align: 'center',
            wordWrap: { width: 1137, useAdvancedWrap: true },
            lineSpacing: 14
        };

        this.mainText = this.scene.add.rexTagText(
            this.textBox.x,
            this.textBox.y,
            'PARA CONHECER UM POUCO MAIS SOBRE A PRÓPRIA FAMÍLIA, BERNARDO DECIDIU CRIAR UMA ÁRVORE GENEALÓGICA.\n\nAJUDE BERNARDO A CRIAR A ÁRVORE DA SUA FAMÍLIA!',
            mainTextStyle
        ).setOrigin(0.5, 0.5);  // Centralizar horizontalmente e verticalmente

        // Adicionar listener para redimensionamento da janela
        window.addEventListener('resize', this.onResize.bind(this));

        // Botão Vamos Lá
        const btVamosLa = this.scene.add.image(
            this.imageBox.x,
            this.imageBox.y + (this.imageBox.height / 2) - 120,
            'btVamosLa'
        ).setInteractive();

        btVamosLa.on('pointerdown', () => {
            this.hide();
            if (this.scene.hudContainer) {
                this.scene.hudContainer.setVisible(false);
                SoundManager.stopAll();
            }
        });

        // Criar um container para agrupar todos os elementos
        this.container = this.scene.add.container(0, 0, [
            this.background,
            this.imageBox,
            this.title,
            this.textBox,  // adicionando o retângulo de referência
            this.mainText,
            this.btNarracao,
            btVamosLa
        ]);

        // Inicialmente escondido
        this.container.setVisible(false);

        // Garantir que fique no topo
        this.container.setDepth(99999);
    }

    onResize() {
        // Atualizar a posição de mainText para centralizá-lo novamente
        this.mainText.setPosition(this.textBox.x, this.textBox.y);
    }

    show() {
        this.container.setVisible(true);
        this.isVisible = true;
        this.btNarracao.setVisible(this.audio != '' ? true : false);
        if(this.audio != ''){
            SoundManager.stopAll();
            SoundManager.play(this.audio);
        }

        if(this.callbackModal != null){
            this.callbackModal(true);
        }
    }

    hide() {
        this.container.setVisible(false);
        this.isVisible = false;
        if(this.callbackModal != null){
            this.callbackModal(false);
        }
    }

    updateContent(options = {}) {
        const {
            title,
            text,
            audio,
            icon,
            fontSize = '38px',
            lineHeight = '52px',
            color = '#1F292D'
        } = options;

        // Atualiza o áudio se fornecido
        if (audio) {
            this.audio = audio;
        }

        if (title && this.title) {
            this.title.setText(title.toUpperCase());
        }

        if (text && this.mainText) {
            this.mainText.destroy();

            const mainTextStyle = {
                fontFamily: 'Nunito-ExtraBold',
                backgroundColor:'#FFFFFF',
                fontSize: '38px',
                fontWeight: '800',
                color: '#1F292D',
                align: 'center',
                wordWrap: { width: 1137, useAdvancedWrap: true },
                lineSpacing: 2 // Aumente o espaçamento entre linhas
            };

            this.mainText = this.scene.add.rexTagText(
                this.textBox.x,
                this.textBox.y,
                text,
                mainTextStyle
            ).setOrigin(0.5, 0.54);  // Centralizar horizontalmente e verticalmente
            this.container.add(this.mainText);

            if(icon){
                if(icon.nome != '' || icon.nome){
                    const icone = this.scene.add.image(
                        icon.posicao.x,
                        icon.posicao.y,
                        icon.nome
                    ).setOrigin(0, 0);
                    this.container.add(icone);

                }
            }

        }
    }

    callbackModal(value){}
}