export class Preload extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
    }

    preload() {
        // Efeitos sonoros
        this.load.audio('musica', 'resources/game/sounds/Bossa_Antigua.mp3');
        this.load.audio('click', 'resources/game/sounds/click.mp3');
        this.load.audio('acerto', 'resources/game/sounds/acerto.mp3');
        this.load.audio('erro', 'resources/game/sounds/erro.mp3'); 

        // Adicione um texto de carregamento
        const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Carregando...', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5);
        
        // Atualize a barra de carregamento (opcional)
        this.load.on('progress', (value) => {
            loadingText.setText(`Carregando... ${Math.round(value * 100)}%`);
        });
        
    }

    create() {

        const gameData = this.cache.json.get('gameData');
        this.game.registry.set('gameData', gameData);

        // Colocar as fontes aqui para garantir que foram carregadas. Verificar em index.html se está fazendo o load no css.
        Promise.all([
            document.fonts.load('24px Nunito-Black'),
            document.fonts.load('36px Nunito-ExtraBold'),
            document.fonts.load('24px Nunito-Bold'),
            document.fonts.load('24px Nunito-SemiBold'),
            document.fonts.load('40px Nunito')
        ]).then(() => {
            this.scene.start('Capa');
        });

    }
}
