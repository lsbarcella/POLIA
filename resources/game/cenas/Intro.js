import { BaseCena } from '../../js/library/base/BaseCena.js';

export class Intro extends BaseCena {
    constructor(controladorDeCenas) {
        super('Intro');
        this.controladorDeCenas = controladorDeCenas; 
        this.loaded = false;
    }

    create() {
        const background = this.add.image(0, 0, 'bgIntro1').setOrigin(0, 0);
       
        super.create();
    }
}

export default Intro;

