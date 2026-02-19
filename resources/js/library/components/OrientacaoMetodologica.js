import SoundManager from "../managers/SoundManager.js";
import { TextoCreditos } from "./TextoCreditos.js";


export default class OrientacaoMetodologica extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        scene.add.existing(this);

        this.setDepth(99999);
        this.scene = scene;

        // Overlay semi-transparente
        this.overlay = this.scene.add.rectangle(0, 0, 1920, 1080, 0x000, 0.75)
            .setOrigin(0, 0)
            .setInteractive();

        // Box principal (usando uma imagem ou retângulo)
        this.boxOrientacao = this.scene.add.image(0, 0, 'boxCreditos')
            .setOrigin(0, 0);
        this.boxOrientacao.x = this.overlay.x + (this.overlay.width - this.boxOrientacao.width) * 0.5;
        this.boxOrientacao.y = this.overlay.y + (this.overlay.height - this.boxOrientacao.height) * 0.5;

        // Criação da máscara para o scroll
        this.maskGraphics = this.scene.add.graphics();
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.fillRect(
            this.boxOrientacao.x + 40,
            this.boxOrientacao.y + 100,
            this.boxOrientacao.width - 80,
            this.boxOrientacao.height - 200
        );

        this.orientacaoContainer = this.scene.add.container(0, 0);
        this.orientacaoMask = this.maskGraphics.createGeometryMask();
        this.orientacaoContainer.setMask(this.orientacaoMask);

        // Botão fechar
        const gameData = this.scene.game.registry.get('gameData');
        const marca = gameData?.configuracoes?.marca || 'SAE';
        const btFecharTexture = `btFechar_${marca.toLowerCase()}`;

        this.btFechar = this.scene.add.image(0, 0, btFecharTexture)
            .setOrigin(0, 0)
            .setInteractive({cursor:'pointer'});
        this.btFechar.x = this.boxOrientacao.x + this.boxOrientacao.width - this.btFechar.width - 23;
        this.btFechar.y = this.boxOrientacao.y + 20;
        this.btFechar.on('pointerdown', () => {
            SoundManager.play('click')
            this.visible = false;
        });

        this.orientacaoTexts = [];

        // Barra de rolagem
        this.scrollBar = this.scene.add.rectangle(
            this.boxOrientacao.x + this.boxOrientacao.width - 40,
            this.boxOrientacao.y + 120,
            8,
            this.boxOrientacao.height - 160,
            0x000000,
            0.3
        ).setOrigin(0, 0);

        this.scrollHandle = this.scene.add.rectangle(
            this.scrollBar.x,
            this.scrollBar.y,
            8,
            100,
            0x000000,
            0.5
        ).setOrigin(0, 0);

        // Variáveis para controle do touch/drag
        let isDragging = false;
        let startY = 0;
        let startContainerY = 0;

        // Eventos de touch/mouse para drag
        this.overlay.on('pointerdown', (pointer) => {
            isDragging = true;
            startY = pointer.y;
            startContainerY = this.orientacaoContainer.y;
        });

        this.overlay.on('pointermove', (pointer) => {
            if (!isDragging) return;
            
            if (this.totalHeight > this.boxOrientacao.height - 200) {
                const deltaY = startY - pointer.y;
                const newY = Phaser.Math.Clamp(
                    startContainerY - deltaY,
                    -(this.totalHeight - (this.boxOrientacao.height - 200)),
                    0
                );
                this.orientacaoContainer.y = newY;

                // Atualiza a posição do handle
                const scrollPercent = Math.abs(this.orientacaoContainer.y) / (this.totalHeight - (this.boxOrientacao.height - 200));
                const scrollRange = this.scrollBar.height - this.scrollHandle.height;
                this.scrollHandle.y = this.scrollBar.y + (scrollRange * scrollPercent);
            }
        });

        this.overlay.on('pointerup', () => {
            isDragging = false;
        });

        this.overlay.on('pointerout', () => {
            isDragging = false;
        });

        // Evento wheel
        this.overlay.on('wheel', (pointer, deltaX, deltaY, deltaZ) => {
            if (this.totalHeight > this.boxOrientacao.height - 200) {
                const newY = Phaser.Math.Clamp(
                    this.orientacaoContainer.y - deltaY,
                    -(this.totalHeight - (this.boxOrientacao.height - 200)),
                    0
                );
                this.orientacaoContainer.y = newY;

                // Atualiza a posição do handle
                const scrollPercent = Math.abs(this.orientacaoContainer.y) / (this.totalHeight - (this.boxOrientacao.height - 200));
                const scrollRange = this.scrollBar.height - this.scrollHandle.height;
                this.scrollHandle.y = this.scrollBar.y + (scrollRange * scrollPercent);
            }
        });

        this.add([
            this.overlay, 
            this.boxOrientacao, 
            this.btFechar, 
            this.orientacaoContainer,
            this.scrollBar,
            this.scrollHandle
        ]); 

        // Esconde a máscara junto com a orientação
        this.maskGraphics.visible = false;
        this.visible = false;
    }

    loadOrientacaoData() {
        fetch('/api/oda')
            .then(response => response.json())
            .then(data => {
                this.orientacaoData = data.orientacaoMetodologica;
                if (this.orientacaoData) {
                    this.setData(this.orientacaoData);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar dados da orientação metodológica:', error);
            });
    }

    setData(value) {
        // Limpa os textos anteriores
        this.orientacaoTexts.forEach(texto => texto.destroy());
        this.orientacaoTexts = [];
        this.orientacaoContainer.y = 0; // Reset da posição do container

        if (!Array.isArray(value)) return;

        let currentY = 0; // Posição inicial Y
        this.totalHeight = 0;

        // Container para o conteúdo
        const contentContainer = this.scene.add.container(this.boxOrientacao.x + 40, this.boxOrientacao.y + 100);

        value.forEach((item, index) => {
            const textoOrientacao = new TextoCreditos(this.scene);
            
            textoOrientacao.y = currentY;
            
            // Usa a altura retornada pelo setTextos
            const alturaTotal = textoOrientacao.setTextos(item.titulo, item.texto);
            this.totalHeight = currentY + alturaTotal;
            
            // Atualiza o Y para o próximo item usando a altura real
            currentY += alturaTotal + 20;
            
            this.orientacaoTexts.push(textoOrientacao);
            contentContainer.add(textoOrientacao);
        });

        this.orientacaoContainer.add(contentContainer);

        // Verifica se o conteúdo ultrapassa a área da máscara
        const maskHeight = this.boxOrientacao.height - 200; // Altura da máscara
        if (this.totalHeight > maskHeight) {
            const ratio = maskHeight / this.totalHeight;
            const handleHeight = Math.max(50, this.scrollBar.height * ratio);
            this.scrollHandle.setSize(8, handleHeight);
            this.scrollBar.setAlpha(1);
            this.scrollHandle.setAlpha(1);
        } else {
            this.scrollBar.setAlpha(0);
            this.scrollHandle.setAlpha(0);
        }

        // Reseta a posição do handle
        this.scrollHandle.y = this.scrollBar.y;
    }

    show() {
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }

    // Sobrescreve o setter de visible para controlar também a máscara
    set visible(value) {
        super.visible = value;
        if (this.maskGraphics) {
            this.maskGraphics.visible = value;
        }
    }

    get visible() {
        return super.visible;
    }
}