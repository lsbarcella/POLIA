import SoundManager from "../managers/SoundManager.js";

export class ButtonIcon extends Phaser.GameObjects.Container {
    // Constantes estáticas para tipos de ícones
    static ICON_CONFIG = 'iconConfig';
    static ICON_UP = 'iconUp';
    static ICON_DOWN = 'iconDown';
    static ICON_LEFT = 'iconLeft';
    static ICON_RIGHT = 'iconRight';
    static ICON_PLAY = 'iconPlay';
    static ICON_RELOAD = 'iconReload';
    static ICON_SOUND = 'iconSound';
    static ICON_SOUND_MUTE = 'iconSoundMute';
    static ICON_MUSIC = 'iconMusic';
    static ICON_MUSIC_MUTE = 'iconMusicMute';
    static ICON_INSTRUCTIONS = 'iconInstructions';
    static ICON_CREDITS = 'iconCredits';
    static ICON_AUDIO = 'iconAudio';
    static ICON_FULLSCREEN = 'iconFullscreen';
    static ICON_GLOSSARIO = 'iconGlossario';
    static ICON_HOME = 'iconHome';
    static ICON_VIDEO = 'iconVideo';
    static ICON_NO_VIDEO = 'iconNoVideo';
    static ICON_UNDO = 'iconUndo';
    static ICON_MINUS = 'iconMinus';
    static ICON_PLUS = 'iconPlus';
    static ICON_SEARCH = 'iconSearch';


    constructor(scene, options) {
        super(scene, 0, 0);

        this.scene = scene;
        this.options = options;
        this.disabled = false;

        this.botaoIcone = this.scene.add.image(0, 0, 'botaoIcone').setOrigin(0, 0).setInteractive({ cursor: 'pointer' });
        this.add(this.botaoIcone);

        this.botaoIcone.on('pointerdown', () => {
            if (this.disabled) return;
            SoundManager.play('click', 1, false, () => {
                this.emit('buttonClick');
            });
        });

        this.width = this.botaoIcone.width;
        this.height = this.botaoIcone.height;

        this.icone = null;

        // Adiciona o ícone se foi especificado nas opções
        if (this.options) {
            const iconTexture = this.options.iconKey || this.options.icone;
            if (iconTexture) {
                this.adicionarIcone(iconTexture, this.options.escalaIcone || 1);
            }
        }

        this.scene.add.existing(this);        
    }

    /**
     * Adiciona um ícone ao botão
     * @param {string} nomeIcone - Nome da textura do ícone (use as constantes estáticas)
     * @param {number} escala - Escala do ícone (padrão: 1)
     */
    adicionarIcone(nomeIcone, escala = 1) {
        // Remove o ícone anterior se existir
        if (this.icone) {
            this.remove(this.icone);
            this.icone.destroy();
        }

        // Cria o novo ícone centralizado no botão
        this.icone = this.scene.add.image(0, 0, 
            nomeIcone
        ).setOrigin(0, 0).setScale(escala);
        this.icone.x = this.botaoIcone.x + (this.botaoIcone.width - this.icone.width) / 2;
        this.icone.y = this.botaoIcone.y + (this.botaoIcone.height - this.icone.height) / 2 - 10;

        this.add(this.icone);

        return this;
    }

    /**
     * Remove o ícone atual
     */
    removerIcone() {
        if (this.icone) {
            this.remove(this.icone);
            this.icone.destroy();
            this.icone = null;
        }
        return this;
    }

    /**
     * Define a escala do ícone
     * @param {number} escala - Nova escala do ícone
     */
    setEscalaIcone(escala) {
        if (this.icone) {
            this.icone.setScale(escala);
        }
        return this;
    }

    /**
     * Define se o botão está desabilitado
     * @param {boolean} disabled - Se o botão deve estar desabilitado
     */
    setDisabled(disabled) {
        this.disabled = disabled;

        // Gerenciar interatividade
        if (disabled) {
            this.botaoIcone.removeInteractive();
            //this.botaoIcone.input.cursor = 'default';
        } else {
            this.botaoIcone.setInteractive({ cursor: 'pointer' });
        }
        
        // Aplicar efeito visual quando desabilitado
        if (disabled) {
            this.botaoIcone.setTint(0x7E878C);
        } else {
            this.botaoIcone.clearTint();
            if (this.icone) {
                this.icone.setAlpha(1);
            }
        }
        
        return this;
    }

    /**
     * Verifica se o botão está desabilitado
     * @returns {boolean}
     */
    isDisabled() {
        return this.disabled;
    }
}