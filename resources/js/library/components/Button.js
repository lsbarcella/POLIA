import SoundManager from "../managers/SoundManager.js";

// Constantes para os ícones disponíveis
export const BUTTON_ICONS = {
    PLAY: 'iconPlayButton',
    RELOAD: 'iconReload',
    SOUND: 'iconSoundWhite',
    // Adicione novos ícones aqui conforme necessário
};

export class Button extends Phaser.GameObjects.Container {
    constructor(scene, config = {}) {
        super(scene, 0, 0);

        // Configurações padrão
        this.config = {
            text: 'BOTÃO',
            width: 300,
            height: 90,
            cornerRadius: 20,
            colors: {
                main: 0x5ADCFF, // Cor principal do botão
                shadow: 0x288FCE, // Cor da sombra
                shadow2: 0x1F292D, // Cor da segunda sombra
                text: '#FFFFFF', // Cor do texto
                stroke: '#1F292D' // Cor do contorno do texto
            },
            showIcon: false, // Se deve mostrar o ícone
            iconKey: BUTTON_ICONS.PLAY, // Chave do ícone a ser usado (padrão: play)
            iconOffset: 10, // Distância entre o ícone e o texto
            elipseOffset: {
                x: 5,
                y: 5
            }, // Offset da elipse
            margin: 50, // Margem horizontal (esquerda e direita)
            fontSize: '42px',
            fontFamily: 'Nunito-ExtraBold',
            ...config
        };

        // Armazenar cores originais para restaurar quando necessário
        this.originalColors = JSON.parse(JSON.stringify(this.config.colors));

        this.createButton();
        scene.add.existing(this);
    }

    createButton() {
        // Criar elementos do botão
        this.buttonBg = this.scene.add.graphics();
        this.shadow = this.scene.add.graphics();
        this.shadow2 = this.scene.add.graphics();

        // Criar container interno para texto e ícone
        this.contentContainer = this.scene.add.container(0, 0);

        // Criar texto
        this.buttonText = this.scene.add.text(0, 0, this.config.text, {
            fontFamily: this.config.fontFamily,
            fontSize: this.config.fontSize,
            color: this.config.colors.text,
            align: 'center',
            stroke: this.config.colors.stroke,
            strokeThickness: 8
        }).setOrigin(0, 0); // Origem no canto superior esquerdo

        // Adicionar texto ao container de conteúdo
        this.contentContainer.add(this.buttonText);

        // Adicionar ícone se necessário
        if (this.config.showIcon) {
            this.icon = this.scene.add.image(0, 0, this.config.iconKey).setOrigin(0, 0);
            this.contentContainer.add(this.icon);
        }

        this.elipse = this.scene.add.image(0, 0, 'elipse').setOrigin(0, 0);

        // Adicionar elementos ao container principal
        this.add([this.shadow2, this.shadow, this.buttonBg, this.contentContainer, this.elipse]);

        // Atualizar tamanho inicial primeiro
        this.updateButtonSize();

        // Configurar interatividade com o tamanho correto
        this.buttonBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height),
            Phaser.Geom.Rectangle.Contains);

        // Definir cursor pointer para botão ativo
        this.buttonBg.input.cursor = 'pointer';

        // Adicionar evento de clique
        this.buttonBg.on('pointerdown', () => {
            if (this.config.disabled) return;
            SoundManager.play('click', 1, false, () => {
                this.emit('buttonClick');
            });
        });

        // Atualizar quando o texto mudar
        this.buttonText.on('textchange', () => this.updateButtonSize());
    }

    updateButtonSize() {
        // Calcula a largura do conteúdo (texto + ícone + espaçamento)
        let contentWidth = this.buttonText.width;

        if (this.config.showIcon && this.icon) {
            contentWidth += this.config.iconOffset + this.icon.width;
        }

        // Adicionar margens
        const totalWidth = contentWidth + (this.config.margin * 2);
        const height = this.config.height;

        // Atualizar fundo - posicionar no canto superior esquerdo
        this.buttonBg.clear();
        this.buttonBg.fillStyle(this.config.colors.main);
        this.buttonBg.fillRoundedRect(0, 0, totalWidth, height, this.config.cornerRadius);
        this.buttonBg.lineStyle(2, this.config.colors.shadow2);
        this.buttonBg.strokeRoundedRect(0, 0, totalWidth, height, this.config.cornerRadius);

        // Atualizar sombras - posicionar com offset
        this.shadow.clear();
        this.shadow.fillStyle(this.config.colors.shadow);
        this.shadow.fillRoundedRect(0, 8, totalWidth, height, this.config.cornerRadius);

        this.shadow2.clear();
        this.shadow2.fillStyle(this.config.colors.shadow2);
        this.shadow2.fillRoundedRect(0, 17, totalWidth, height, this.config.cornerRadius);

        // Atualizar área interativa
        this.buttonBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, totalWidth, height),
            Phaser.Geom.Rectangle.Contains);

        // Posicionar elementos do conteúdo
        if (this.config.showIcon && this.icon) {
            // Centralizar o conjunto texto + ícone
            const totalContentWidth = this.buttonText.width + this.config.iconOffset + this.icon.width;
            const startX = (totalWidth - totalContentWidth) / 2;
            
            // Posicionar texto
            this.buttonText.x = startX;
            // Posicionar ícone à direita do texto
            this.icon.x = startX + this.buttonText.width + this.config.iconOffset;
        } else {
            // Centralizar apenas o texto
            this.buttonText.x = (totalWidth - this.buttonText.width) / 2;
        }

        // Centralizar verticalmente
        this.buttonText.y = (height - this.buttonText.height) / 2;
        if (this.config.showIcon && this.icon) {
            this.icon.y = (height - this.icon.height) / 2;
        }

        // Posicionar elipse no canto superior direito
        this.elipse.x = totalWidth - this.elipse.width - this.config.elipseOffset.x;
        this.elipse.y = this.config.elipseOffset.y;

        // Atualizar dimensões do container principal
        this.setSize(totalWidth, height);
    }

    setTextAndColors(text = null, colors = {}) {
        // Atualizar texto apenas se fornecido
        if (text !== null) {
            this.buttonText.setText(text);
        }
        
        // Atualizar cores
        this.config.colors = {
            ...this.config.colors,
            ...colors
        };
        
        this.updateButtonSize();
        return this;
    }

    setText(text) {
        this.buttonText.setText(text);
        return this;
    }

    setColors(colors) {
        this.config.colors = {
            ...this.config.colors,
            ...colors
        };
        this.updateButtonSize();
        return this;
    }

    setDisabled(disabled) {
        this.buttonBg.setInteractive(disabled ? false : true);

        this.config.disabled = disabled;
        
        // Gerenciar cursor
        if (disabled) {
            this.buttonBg.input.cursor = 'default';
        } else {
            this.buttonBg.input.cursor = 'pointer';
        }
        
        this.setColors({
            main: disabled ? 0xC7C7C7 : this.originalColors.main,
            shadow: disabled ? 0x7E878C : this.originalColors.shadow,
            shadow2: disabled ? 0x1F292D : this.originalColors.shadow2,
            text: disabled ? '#FFFFFF' : this.originalColors.text,
            stroke: disabled ? '#1F292D' : this.originalColors.stroke
        });
        return this;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    setIcon(iconKey) {
        // Remover ícone atual se existir
        if (this.icon) {
            this.icon.destroy();
            this.contentContainer.remove(this.icon);
        }

        // Atualizar configuração
        this.config.iconKey = iconKey;
        this.config.showIcon = true;

        // Criar novo ícone
        this.icon = this.scene.add.image(0, 0, this.config.iconKey).setOrigin(0, 0);
        this.contentContainer.add(this.icon);

        // Atualizar layout
        this.updateButtonSize();
        return this;
    }

    removeIcon() {
        if (this.icon) {
            this.icon.destroy();
            this.contentContainer.remove(this.icon);
            this.icon = null;
        }
        
        this.config.showIcon = false;
        this.updateButtonSize();
        return this;
    }
}