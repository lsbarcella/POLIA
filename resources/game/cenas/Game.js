import { BaseCena } from '../../js/library/base/BaseCena.js';

export class Game extends BaseCena {
    constructor(controladorDeCenas) {
        super('Game'); // Passa o nome da cena para a classe base
        this.controladorDeCenas = controladorDeCenas; // Armazena a referência ao controlador de cenas
        this.loaded = false;
    }

    create() {

        const background = this.add.image(0, 0, 'backgroundGame').setOrigin(0, 0);
       

        super.create(); // manter essa linha pois o super.create() é necessário para que a cena seja criada corretamente. Caso tenha próximas cenas também deve ser chamado o super.create().
    }


}

export default Game;

