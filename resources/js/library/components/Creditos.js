import SoundManager from "../managers/SoundManager.js";
import { TextoCreditos } from "./TextoCreditos.js";

export class Creditos extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        scene.add.existing(this);

        this.setDepth(99999);
        this.scene = scene;

        this.overlay = this.scene.add.rectangle(0, 0, 1920, 1080, 0x000, 0.75)
            .setOrigin(0, 0)
            .setInteractive();

        this.boxCreditos = this.scene.add.image(0, 0, 'boxCreditos').setOrigin(0, 0);
        this.boxCreditos.x = this.overlay.x + (this.overlay.width - this.boxCreditos.width) * 0.5;
        this.boxCreditos.y = this.overlay.y + (this.overlay.height - this.boxCreditos.height) * 0.5;

        // Criação da máscara
        this.maskGraphics = this.scene.add.graphics();
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.fillRect(
            this.boxCreditos.x,
            this.boxCreditos.y + 100,
            this.boxCreditos.width,
            this.boxCreditos.height - 200
        );

        this.creditosContainer = this.scene.add.container(0, 0);
        this.creditosMask = this.maskGraphics.createGeometryMask();
        this.creditosContainer.setMask(this.creditosMask);

        // Get the brand suffix for the button texture
        const gameData = this.scene.game.registry.get('gameData');
        const marca = gameData?.configuracoes?.marca || 'SAE';
        const btFecharTexture = `btFechar_${marca.toLowerCase()}`;

        this.btFechar = this.scene.add.image(0, 0, btFecharTexture)
            .setOrigin(0, 0)
            .setInteractive({cursor:'pointer'});
        this.btFechar.x = this.boxCreditos.x + this.boxCreditos.width - this.btFechar.width - 23;
        this.btFechar.y = this.boxCreditos.y + 20;
        this.btFechar.on('pointerdown', () => {
            SoundManager.play('click')
            this.visible = false;
        });

        this.creditosTexts = [];

        // Reposiciona a barra de rolagem
        this.scrollBar = this.scene.add.rectangle(
            this.boxCreditos.x + this.boxCreditos.width - 40, // 40px da borda direita
            this.boxCreditos.y + 120, // 120px do topo do box
            8, // largura da barra
            this.boxCreditos.height - 160, // altura ajustada
            0x000000,
            0.3
        ).setOrigin(0, 0);

        // Ajusta o handle para a nova posição da barra
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
            startContainerY = this.creditosContainer.y;
        });

        this.overlay.on('pointermove', (pointer) => {
            if (!isDragging) return;
            
            if (this.totalHeight > this.boxCreditos.height - 200) {
                const deltaY = startY - pointer.y;
                const newY = Phaser.Math.Clamp(
                    startContainerY - deltaY,
                    -(this.totalHeight - (this.boxCreditos.height - 200)),
                    0
                );
                this.creditosContainer.y = newY;

                // Atualiza a posição do handle
                const scrollPercent = Math.abs(this.creditosContainer.y) / (this.totalHeight - (this.boxCreditos.height - 200));
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
            if (this.totalHeight > this.boxCreditos.height - 200) {
                const newY = Phaser.Math.Clamp(
                    this.creditosContainer.y - deltaY,
                    -(this.totalHeight - (this.boxCreditos.height - 200)),
                    0
                );
                this.creditosContainer.y = newY;

                // Atualiza a posição do handle
                const scrollPercent = Math.abs(this.creditosContainer.y) / (this.totalHeight - (this.boxCreditos.height - 200));
                const scrollRange = this.scrollBar.height - this.scrollHandle.height;
                this.scrollHandle.y = this.scrollBar.y + (scrollRange * scrollPercent);
            }
        });

        this.add([
            this.overlay, 
            this.boxCreditos, 
            this.btFechar, 
            this.creditosContainer,
            this.scrollBar,
            this.scrollHandle
        ]); 

        // Esconde a máscara junto com os créditos
        this.maskGraphics.visible = false;
        this.visible = false;
    }

    setData(value) {
        // Limpa os textos anteriores
        this.creditosTexts.forEach(texto => texto.destroy());
        this.creditosTexts = [];
        this.creditosContainer.y = 0; // Reset da posição do container

        if (!Array.isArray(value)) return;

        let currentY = 0; // Posição inicial Y
        this.totalHeight = 0;

        // Container para o conteúdo
        const contentContainer = this.scene.add.container(this.boxCreditos.x + 40, this.boxCreditos.y + 100);

        value.forEach((item, index) => {
            const textoCredito = new TextoCreditos(this.scene);
            
            textoCredito.y = currentY;
            
            // Usa a altura retornada pelo setTextos
            const alturaTotal = textoCredito.setTextos(item.titulo, item.texto);
            this.totalHeight = currentY + alturaTotal;
            
            // Atualiza o Y para o próximo item usando a altura real
            currentY += alturaTotal + 20;
            
            this.creditosTexts.push(textoCredito);
            contentContainer.add(textoCredito);
        });

        this.creditosContainer.add(contentContainer);

        // Verifica se o conteúdo ultrapassa a área da máscara
        const maskHeight = this.boxCreditos.height - 200; // Altura da máscara
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