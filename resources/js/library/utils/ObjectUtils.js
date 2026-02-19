export class ObjectUtil {
    static LAYER_DEPTHS = {
        BASE: 0,
        HUD: 1000,
        POPUP: 2000,
        STATEMENT: 9999  // Changed from ENUNCIADO to STATEMENT
    };

    static bringToFront(gameObject) {
        if (!gameObject) {
            //console.warn('bringToFront: gameObject é nulo ou indefinido.');
            return;
        }

        // Verifica se o objeto tem um container válido
        if (gameObject.container && gameObject.container instanceof Phaser.GameObjects.Container) {
            gameObject.container.setDepth(this.LAYER_DEPTHS.STATEMENT);
        }
        // Verifica se o objeto é um GameObject válido
        else if (gameObject instanceof Phaser.GameObjects.GameObject) {
            gameObject.setDepth(this.LAYER_DEPTHS.STATEMENT);
        }
        // Caso o objeto não seja válido
        else {
            //console.warn('bringToFront: gameObject não é um GameObject ou Container válido.');
        }
    }
}