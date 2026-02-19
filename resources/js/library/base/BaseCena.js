import { Enunciado } from "../components/Enunciado.js";
import { ObjectUtil } from "../utils/ObjectUtils.js";
import SoundManager from "../managers/SoundManager.js";
import { Creditos } from "../components/Creditos.js";
import OrientacaoMetodologica from "../components/OrientacaoMetodologica.js";


export class BaseCena extends Phaser.Scene {
    constructor(key) {
        super({ key }); // Recebe o nome da cena como parâmetro
    }

    create() {
        SoundManager.playMusic("musica", 0.6);
        this.setupAudioUnlock();

        if (!this.controladorDeCenas && this.game && this.game.controladorDeCenas) {
            this.controladorDeCenas = this.game.controladorDeCenas;
        }
        // Verificar se a câmera está disponível antes de usar fadeIn
        if (this.cameras && this.cameras.main) {
            this.cameras.main.fadeIn(300, 255, 255, 255);
        }

        if (this.game.controladorDeCenas.cenaAtualIndex === 0)
            return;

        this.creditos = new Creditos(this);


        this.btMenu = this.add.image(40, 40, 'btMenu')
            .setOrigin(0, 0)
            .setDepth(9999)
            .setInteractive({ cursor: 'pointer' });
        this.btMenu.on('pointerdown', () => {
            SoundManager.play('click');
            // Ensure container is positioned off-screen before animation
            const hudSlideWidth = this.getHudSlideWidth();
            this.hudContainer.setPosition(-hudSlideWidth, 0);
            this.hudContainer.visible = true;

            this.children.bringToTop(this.hudContainer);

            // Animate sliding in from left
            this.tweens.add({
                targets: this.hudContainer,
                x: 0,
                duration: 300,
                ease: 'EaseInOut'
            });
        });

        this.gameData = this.game.registry.get('gameData');

        // HUD básica
        if (!this.hudContainer) {
            this.hudContainer = this.add.container(0, 0);
            this.hudContainer.setDepth(9999);

            const currentPageIndex = this.game.controladorDeCenas.cenaAtualIndex;
            const dataEnunciado = this.gameData?.paginas?.[currentPageIndex]?.enunciado || {
                titulo: '',
                texto: '',
                codNarracao: '',
                icone: ''
            };

            let aTextos = ['SONS', 'INSTRUÇÕES', 'MÚSICAS', 'TELA CHEIA', 'CRÉDITOS', 'ORIENTAÇÃO\nMETODOLÓGICA'];

            let isSomMutado = false;
            let isMusicaMutado = false;

            const bg = this.add.image(0, 0, 'Bg').setOrigin(0, 0).setInteractive();

            // Get the brand suffix for the button texture
            const marca = this.gameData?.configuracoes?.marca || 'SAE';
            const btFecharTexture = `btFechar_${marca.toLowerCase()}`;

            const btFechar = this.add.image(0, 0, btFecharTexture)
                .setOrigin(0, 0)
                .setInteractive({ cursor: 'pointer' });
            btFechar.on('pointerdown', () => {
                SoundManager.play('click');
                // Animate sliding out to the left
                this.recolherMenu();
            });
            btFechar.x = bg.x + bg.width - btFechar.width - 20;
            btFechar.y = 20;

            const btSons = this.add.image(0, 0, SoundManager.isMuted ? 'btSoundOff' : 'btSoundOn')
                .setOrigin(0, 0)
                .setInteractive({ cursor: 'pointer' });
            btSons.on('pointerdown', () => {
                SoundManager.play('click');
                if (SoundManager.isMuted) {
                    SoundManager.unmuteSoundEffects();
                    btSons.setTexture('btSoundOn');
                } else {
                    SoundManager.muteSoundEffects();
                    btSons.setTexture('btSoundOff');
                }
            });
            btSons.x = 60;
            btSons.y = 148;



            if (dataEnunciado.titulo != '' || dataEnunciado.texto != '') {
                this.enunciado = new Enunciado(this);
                this.enunciado.callbackModal = () => {
                    this.fecharModal();
                };
                this.enunciado.updateContent({
                    title: dataEnunciado.titulo,
                    text: dataEnunciado.texto,
                    audio: dataEnunciado.codNarracao,
                    icon: dataEnunciado.icone
                });
                this.enunciado.show();
            }

            this.btEnunciado = this.add.image(0, 0, 'btEnunciado')
                .setOrigin(0, 0);

            if (dataEnunciado.texto !== '') {
                this.btEnunciado.setInteractive({ cursor: 'pointer' });
            } else {
                this.btEnunciado.setInteractive();
                this.btEnunciado.alpha = 0.5;
            }

            this.btEnunciado.x = btSons.x + this.btEnunciado.width + 80;
            this.btEnunciado.y = btSons.y;
            this.btEnunciado.on('pointerdown', () => {
                if (this.btEnunciado.alpha === 0.5) {
                    return;
                }
                SoundManager.play('click');

                if (!this.enunciado) {
                    this.enunciado = new Enunciado(this);
                }
                this.enunciado.show();
                this.hudContainer.setVisible(false);
                ObjectUtil.bringToFront(this.enunciado);
            });

            const btMusicas = this.add.image(0, 0, SoundManager.isMusicMuted ? 'btMusicasOff' : 'btMusicasOn')
                .setOrigin(0, 0)
                .setInteractive({ cursor: 'pointer' });
            btMusicas.on('pointerdown', () => {
                SoundManager.play('click');
                if (SoundManager.isMusicMuted) {
                    SoundManager.unmuteMusic();
                    btMusicas.setTexture('btMusicasOn');
                } else {
                    SoundManager.muteMusic();
                    btMusicas.setTexture('btMusicasOff');
                }
            });
            btMusicas.x = btSons.x;
            btMusicas.y = btSons.y + this.btEnunciado.height + 75;

            const btTelaCheia = this.add.image(0, 0, 'btTelaCheia')
                .setOrigin(0, 0)
                .setInteractive({ cursor: 'pointer' });
            btTelaCheia.x = btMusicas.x + btTelaCheia.width + 80;
            btTelaCheia.y = btMusicas.y;
            btTelaCheia.on('pointerdown', () => {
                SoundManager.play('click');
                this.toggleFullscreen();
            });

            this.gameData.creditos

            const hasValidCredits = this.gameData.creditos &&
                Array.isArray(this.gameData.creditos) &&
                this.gameData.creditos.length > 0 &&
                this.gameData.creditos.every(credito =>
                    credito.titulo !== '' &&
                    credito.texto !== ''
                );

            const btCreditos = this.add.image(0, 0, 'btCreditos')
                .setOrigin(0, 0)
                .setAlpha(hasValidCredits ? 1 : 0.5);

            if (hasValidCredits) {
                btCreditos.setInteractive({ cursor: 'pointer' });
            }

            btCreditos.x = 150;
            btCreditos.y = btTelaCheia.y + this.btEnunciado.height + 84;
            btCreditos.on('pointerdown', () => {
                if (btCreditos.alpha === 0.5) {
                    return;
                }
                SoundManager.play('click');
                this.creditos.visible = true;
                this.creditos.setData(this.gameData.creditos);
                ObjectUtil.bringToFront(this.creditos);
                this.recolherMenu();
            });

            const btOrientacao = this.add.image(0, 0, `btOrientacao_${marca.toLowerCase()}`).setOrigin(0, 0);

            // Verificar se existe orientação metodológica no gameData (agora como array)
            const hasValidOrientacao = this.gameData?.orientacaoMetodologica &&
                Array.isArray(this.gameData.orientacaoMetodologica) &&
                this.gameData.orientacaoMetodologica.length > 0 &&
                this.gameData.orientacaoMetodologica.every(orientacao =>
                    orientacao.titulo !== '' &&
                    orientacao.texto !== ''
                );

            // Definir visibilidade e interatividade baseada na existência dos dados
            btOrientacao.setAlpha(hasValidOrientacao ? 1 : 0.5);

            if (hasValidOrientacao) {
                btOrientacao.setInteractive({ cursor: 'pointer' });
            }

            btOrientacao.x = 150;
            btOrientacao.y = btCreditos.y + btCreditos.height + 84;

            // Criar instância do componente de orientação metodológica se existir
            if (hasValidOrientacao) {
                this.orientacao = new OrientacaoMetodologica(this);
                this.orientacao.visible = false;

                // Carregar os dados da orientação metodológica
                this.orientacao.setData(this.gameData.orientacaoMetodologica);

                btOrientacao.on('pointerdown', () => {
                    if (btOrientacao.alpha === 0.5) {
                        return;
                    }
                    SoundManager.play('click');
                    if (this.orientacao) {
                        this.orientacao.show();
                        ObjectUtil.bringToFront(this.orientacao);
                        this.recolherMenu();
                    }
                });
            }

            this.hudContainer.add(bg);
            this.hudContainer.add(btFechar);
            this.hudContainer.add(btSons);
            this.hudContainer.add(this.btEnunciado);
            this.hudContainer.add(btMusicas);
            this.hudContainer.add(btTelaCheia);
            this.hudContainer.add(btCreditos);
            this.hudContainer.add(btOrientacao);

            // Adicionar textos abaixo dos botões
            const textStyle = {
                fontFamily: 'Nunito-ExtraBold',
                fontSize: '26px',
                color: '#000000',
                align: 'center'
            };

            // Texto Sons
            const textoSons = this.add.text(btSons.x + (btSons.width / 2), btSons.y + btSons.height + 10, aTextos[0], textStyle)
                .setOrigin(0.5, 0);

            // Texto Enunciado
            const textoEnunciado = this.add.text(this.btEnunciado.x + (this.btEnunciado.width / 2), this.btEnunciado.y + this.btEnunciado.height + 10, aTextos[1], textStyle)
                .setOrigin(0.5, 0);

            // Texto Músicas
            const textoMusicas = this.add.text(btMusicas.x + (btMusicas.width / 2), btMusicas.y + btMusicas.height + 10, aTextos[2], textStyle)
                .setOrigin(0.5, 0);

            // Texto Tela Cheia
            const textoTelaCheia = this.add.text(btTelaCheia.x + (btTelaCheia.width / 2), btTelaCheia.y + btTelaCheia.height + 10, aTextos[3], textStyle)
                .setOrigin(0.5, 0);

            // Texto Créditos
            const textoCreditos = this.add.text(btCreditos.x + (btCreditos.width / 2), btCreditos.y + btCreditos.height + 10, aTextos[4], textStyle)
                .setOrigin(0.5, 0);

            // Texto Orientação Metodológica (ajustado para nova posição)
            const textoOrientacao = this.add.text(btOrientacao.x + (btOrientacao.width / 2), btOrientacao.y + btOrientacao.height + 10, aTextos[5], textStyle)
                .setOrigin(0.5, 0);
            textoOrientacao.visible = hasValidOrientacao;

            // Adicionar os textos ao container (após adicionar os botões)
            this.hudContainer.add(textoSons);
            this.hudContainer.add(textoEnunciado);
            this.hudContainer.add(textoMusicas);
            this.hudContainer.add(textoTelaCheia);
            this.hudContainer.add(textoCreditos);
            this.hudContainer.add(textoOrientacao);

        }

        this.hudContainer.visible = false;

        this.events.once('shutdown', () => {
            SoundManager.stopAll(); // Para todos os sons
            this.hudContainer = null;
        });
    }

    setupAudioUnlock() {
        if (!this.input || !this.sound) {
            return;
        }

        const unlock = () => {
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
            if (typeof this.sound.unlock === 'function') {
                this.sound.unlock();
            }
            if (!SoundManager.isMusicPlaying()) {
                SoundManager.playMusic("Magic_Scout_-_Farm", 0.6);
            }
        };

        this.input.once('pointerdown', unlock);
        this.input.once('pointerup', unlock);
    }

    // Adicione este método à sua classe BaseCena
    toggleFullscreen() {
        // Verifica se é iOS
        if (this.isIOS()) {
            // Para iOS, usa Screen Orientation API
            if (screen.orientation && screen.orientation.lock) {
                if (this.isLandscapeLocked) {
                    // Desbloqueia a orientação
                    screen.orientation.unlock();
                    this.isLandscapeLocked = false;
                } else {
                    // Bloqueia em landscape (fullscreen)
                    screen.orientation.lock('landscape').then(() => {
                        this.isLandscapeLocked = true;
                    }).catch((error) => {
                        // Fallback para método anterior
                        this.toggleIOSFullscreen();
                    });
                }
            } else {
                // Fallback para dispositivos sem Screen Orientation API
                this.toggleIOSFullscreen();
            }
        }
        // Para outros dispositivos, usa a API Fullscreen padrão
        else {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        }
    }

    // Método auxiliar para fullscreen simulado no iOS
    toggleIOSFullscreen() {
        if (this.isIOSFullscreen) {
            // Sai do "fullscreen"
            window.scrollTo(0, 0);
            document.body.style.overflow = 'auto';
            this.isIOSFullscreen = false;

            // Redimensiona o jogo para o tamanho original
            this.scale.setGameSize(this.originalWidth, this.originalHeight);
        } else {
            // Entra em "fullscreen"
            if (!this.originalWidth) {
                this.originalWidth = this.scale.width;
                this.originalHeight = this.scale.height;
            }

            // Esconde a barra de endereço
            window.scrollTo(0, 1);
            document.body.style.overflow = 'hidden';
            this.isIOSFullscreen = true;

            // Redimensiona para ocupar toda a tela
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.scale.setGameSize(width, height);

            this.scale.refresh();
        }
    }

    // Atualize seu método isIOS para ser mais preciso
    isIOS() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Detecção mais precisa de iOS
        return /iPad|iPhone|iPod/.test(userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    // Detecção específica de iPhone vs iPad
    isIPhone() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /iPhone|iPod/.test(userAgent);
    }

    isIPad() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /iPad/.test(userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    recolherMenu() {
        const hudSlideWidth = this.getHudSlideWidth();
        this.tweens.add({
            targets: this.hudContainer,
            x: -hudSlideWidth,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.hudContainer.visible = false;
                this.hudContainer.x = 0; // Reset position for next opening
            }
        });
    }

    getHudSlideWidth() {
        if (!this.hudContainer) {
            return 400;
        }

        const bounds = this.hudContainer.getBounds?.();
        if (bounds && bounds.width > 0) {
            return bounds.width;
        }

        return this.hudContainer.list?.[0]?.displayWidth || 400;
    }

    fecharModal() {

    }

    createHUD() {
        // Fundo da HUD
        const hudBackground = this.add.rectangle(0, 0, 1920, 100, 0x000000, 0.5)
            .setOrigin(0, 0);

        // Texto de Cena Atual
        this.cenaAtualText = this.add.text(10, 10, `Cena Atual: ${this.scene.key}`, {
            fontSize: '24px',
            color: '#ffffff',
        });

        // Botão de Mute
        const muteButton = this.add.text(1850, 10, 'Mute', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#333',
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
        })
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.mute = !this.sound.mute;
                muteButton.setText(this.sound.mute ? 'Unmute' : 'Mute');
            });

        // Adiciona elementos da HUD em um container para organização
        this.hudContainer = this.add.container(0, 0, [hudBackground, this.cenaAtualText, muteButton]);
        this.hudContainer.depth = 1000; // Garante que a HUD fique sempre na frente
    }

    transitionToScene(newScene) {
        SoundManager.stopAll();  // Para os sons antes da transição
        if (this.controladorDeCenas?.cenas) {
            const nextIndex = this.controladorDeCenas.cenas.findIndex((c) => c.key === newScene);
            if (nextIndex >= 0) {
                this.controladorDeCenas.cenaAtualIndex = nextIndex;
            }
        }
        this.scene.start(newScene);
    }

    isIOS() {
        return (
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.userAgent.includes("Mac") && "ontouchend" in document)
        );
    }
}
