export class Hud extends Phaser.Scene {
    constructor() {
        super({ key: 'Hud' });
    }

    create() {
        // Adiciona um botão "Voltar"
        const btVoltar = this.add.text(50, 50, 'Voltar', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                const sceneController = this.game.controladorDeCenas;
                if (sceneController) {
                    sceneController.cenaAnterior();
                }
            });

        // Adiciona um botão "Home"
        const btHome = this.add.text(150, 50, 'Home', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                const sceneController = this.game.controladorDeCenas;
                if (sceneController) {
                    sceneController.home();
                }
            });

        // Adiciona um botão "Resetar Cena"
        const btReset = this.add.text(250, 50, 'Resetar', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                const sceneController = this.game.controladorDeCenas;
                if (sceneController) {
                    sceneController.resetCena();
                }
            });
    }
}
