export class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // Hud
        this.load.image('Bg', './resources/images/hud/Bg.png');
        this.load.image('bgCapa', './resources/images/intro/capa.png');
        this.load.image('btMenu', './resources/images/hud/btMenu.png');
        this.load.image('btFechar', './resources/images/hud/btFechar.png');
        
        // Intro
        this.load.image('bgIntro1', './resources/images/intro/intro-1.png');
        this.load.image('iconePuxarCorda', './resources/images/intro/icone-puxar-corda.png');

        // Task
        this.load.image('taskInfoIntro', './resources/images/task/info.png')
        this.load.image('taskIconSelected', './resources/images/task/target-icon.png')
        this.load.image('taskIcon', './resources/images/task/target-icon-unselected.png')
        this.load.image('taskIconBg', './resources/images/task/icon-bg.png')

        // Help
        this.load.image('helpModalBg', './resources/images/help/modal-bg.png')
        this.load.image('helpBotao', './resources/images/help/botao.png')
        this.load.image('helpConteudo1', './resources/images/help/conteudo-1.png')
        this.load.image('helpConteudo2', './resources/images/help/conteudo-2.png')
        this.load.image('helpConteudo3', './resources/images/help/conteudo-3.png')

        // Tutorial
        this.load.image('tutorialHand', './resources/images/tutorial/hand.png')

        // Feedback
        this.load.image('feedbackAcerto', './resources/images/feedback/acerto.png')
        this.load.image('feedbackErro', './resources/images/feedback/erro.png')

        // Score
        this.load.image('scoreModalBg', './resources/images/score/modal-bg.png')
        this.load.image('score1Star', './resources/images/score/1-star.png')
        this.load.image('score2Stars', './resources/images/score/2-star.png')
        this.load.image('score3Stars', './resources/images/score/3-star.png')

        // Objects
        this.load.image('objectsCaixa', './resources/images/objects/caixa.png')
        this.load.image('objectsCaixaAmarrada', './resources/images/objects/caixa-amarrada.png')
        this.load.image('objectsCorda', './resources/images/objects/corda.png')
        this.load.image('objectsCordaCaixa', './resources/images/objects/corda-caixa.png')
        this.load.image('objectsCordaPolia', './resources/images/objects/corda-polia.png')
        this.load.image('objectsPegadorCorda', './resources/images/objects/pegador-corda.png')
        this.load.image('objectsElipse', './resources/images/objects/elipse.png')
        this.load.image('objectsPoliaFixa', './resources/images/objects/polia-fixa.png')
        this.load.image('objectsPolia', './resources/images/objects/polia.png')
        this.load.image('objectsSidebar', './resources/images/objects/sidebar.png')
        this.load.image('objectsGancho', './resources/images/objects/gancho.png')
        this.load.image('objectsFoco', './resources/images/objects/foco.png')
        this.load.image('objectsFocoPequeno', './resources/images/objects/foco-pequeno.png')


        this.load.image('btSoundOn', './resources/images/hud/btSonsNormal.png'); // Botão de som ligado
        this.load.image('btSoundOff', './resources/images/hud/btSonsMutado.png'); //
        this.load.image('btEnunciado', './resources/images/hud/btEnunciado.png');
        this.load.image('btMusicasOn', './resources/images/hud/btMusicasNormal.png');
        this.load.image('btMusicasOff', './resources/images/hud/btMusicasMutado.png');
        this.load.image('btTelaCheia', './resources/images/hud/btTelaCheia.png');
        this.load.image('btOrientacao', './resources/images/hud/btOrientacao.png');
        this.load.svg('btOrientacao_sae', './resources/images/hud/btOrientacao_sae.svg');
        this.load.svg('btOrientacao_cqt', './resources/images/hud/btOrientacao_cqt.svg');
        this.load.svg('btOrientacao_spe', './resources/images/hud/btOrientacao_spe.svg');
        
        this.load.image('modalEnunciado', './resources/images/hud/modal1.png');
        this.load.image('modalFeedbackPositivo', './resources/images/hud/modal3.png');
        this.load.image('modalFeedbackNegativo', './resources/images/hud/modal2.png');
        this.load.image('btVamosLa', './resources/images/hud/btVamosLa.png');
        this.load.image('btVoltar', './resources/images/hud/btVoltar.png');
        this.load.image('btNarracao', '././resources/images/hud/btNarracao.png');
        this.load.image('btConfirmar', '././resources/images/hud/btConfirmar.png');
        this.load.image('btJogarNovamente', '././resources/images/hud/btJogarNovamente.png');
        this.load.image('digiPositivo', '././resources/images/hud/digi1.png');
        this.load.image('digiNegativo', '././resources/images/hud/digi2.png');
        this.load.image('boxCreditos', '././resources/images/hud/boxCreditos.png');
        this.load.image('btCreditos', '././resources/images/hud/btCreditos.png');

        this.load.plugin('rextagtextplugin', 'resources/js/library/plugins/rextagtextplugin.min.js', true);

        this.load.svg('btFechar_sae', './resources/images/hud/btFechar_sae.svg');
        this.load.svg('btFechar_cqt', './resources/images/hud/btFechar_cqt.svg');
        this.load.svg('btFechar_spe', './resources/images/hud/btFechar_spe.svg');

        this.load.image('botaoIcone', './resources/images/hud/BotaoIcone.png');
        this.load.svg('elipse', './resources/images/hud/elipse.svg');
        this.load.svg('iconPlayButton', './resources/images/hud/iconPlay.svg');
        this.load.svg('iconReload', './resources/images/hud/iconReload.svg');
        this.load.svg('iconSoundWhite', './resources/images/hud/iconSoundWhite.svg');
        this.load.svg('iconHomeWhite', './resources/images/hud/iconHomeWhite.svg');
        this.load.svg('iconUp', './resources/images/hud/iconUp.svg');
        this.load.svg('iconLeft', './resources/images/hud/iconLeft.svg');
        this.load.svg('iconRight', './resources/images/hud/iconRight.svg');
        this.load.svg('iconInstructions', './resources/images/hud/iconInstructions.svg');
        this.load.svg('iconSound', './resources/images/hud/iconSound.svg');
        this.load.svg('iconSoundMute', './resources/images/hud/iconSoundMute.svg');
        this.load.svg('iconMusic', './resources/images/hud/iconMusic.svg');
        this.load.svg('iconMusicMute', './resources/images/hud/iconMusicMute.svg');
        this.load.svg('iconCredits', './resources/images/hud/iconCredits.svg');
        this.load.svg('iconAudio', './resources/images/hud/iconAudio.svg');
        this.load.svg('iconConfig', './resources/images/hud/iconConfig.svg');
        this.load.svg('iconFullscreen', './resources/images/hud/iconFullscreen.svg');
        this.load.svg('iconGlossario', './resources/images/hud/iconGlossario.svg');
        this.load.svg('iconHome', './resources/images/hud/iconHome.svg');
        this.load.svg('iconVideo', './resources/images/hud/iconVideo.svg');
        this.load.svg('iconNoVideo', './resources/images/hud/iconNoVideo.svg');
        this.load.svg('iconUndo', './resources/images/hud/iconUndo.svg');
        this.load.svg('iconMinus', './resources/images/hud/iconMinus.svg');
        this.load.svg('iconPlus', './resources/images/hud/iconPlus.svg');
        this.load.svg('iconSearch', './resources/images/hud/iconSearch.svg');
        this.load.svg('iconLike', './resources/images/hud/iconLike.svg');
        
        this.load.json('gameData', './resources/game/data/oda.json');

        const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Carregando...', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5);
        
        this.load.on('progress', (value) => {
            loadingText.setText(`Carregando... ${Math.round(value * 100)}%`);
        });
    }

    create() {
        const gameData = this.cache.json.get('gameData');
        this.game.registry.set('gameData', gameData);

        this.scene.start('Preload');
    }
}

