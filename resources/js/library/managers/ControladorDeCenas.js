export class ControladorDeCenas {
    constructor(game, cenas) {
        this.game = game; // Armazena a referência ao objeto game
        this.cenas = cenas; // Array de cenas
        this.cenaAtualIndex = 0; // Índice da cena atual
        this.cenasCarregadas = new Set();
        this._gameData = null; // Inicializa como null
        this.data = null;
    }

    // Getter e Setter para gameData
    get gameData() {
        return this._gameData;
    }

    set gameData(data) {
        this._gameData = data;
    }

    // Método para inicializar o gameData
    initGameData() {
        this._gameData = this.game.registry.get('gameData');
    }

    // Métodos para navegação entre cenas
    proximaCena() {
        if (this.cenaAtualIndex < this.cenas.length - 1) {
            this.mudarCena(this.cenaAtualIndex + 1);
        }
    }

    cenaAnterior() {
        if (this.cenaAtualIndex > 0) {
            this.mudarCena(this.cenaAtualIndex - 1);
        }
    }

    home() {
        // Inicia a cena inicial apenas se todas estiverem carregadas
        this.cenaAtualIndex = 0;
        if (this.cenasCarregadas.size === this.cenas.length + 1) {
            this.mudarCena(this.cenaAtualIndex);
        } else {
        }
    }

    mudarCena(index) {
        if (index >= 0 && index < this.cenas.length) {
            const cenaAtual = this.cenas[this.cenaAtualIndex].key;
            const proximaCena = this.cenas[index].key;

            // Atualizar o índice
            this.cenaAtualIndex = index;

            // Para apenas efeitos sonoros, preserva música de fundo
            if (this.game.sound) {
                
                // Usar o SoundManager para parar apenas efeitos sonoros
                const SoundManager = this.game.registry.get('SoundManager');
                if (SoundManager) {
                    SoundManager.stopSoundEffects();
                } else {
                    // Fallback: parar todos os sons se SoundManager não estiver disponível
                    this.game.sound.stopAll();
                }
            }

            // Para a cena atual
            this.game.scene.stop(cenaAtual);

            // Inicia a nova cena
            this.game.scene.start(proximaCena);
        }
    }

    get cenaAtual() {
        return this.cenas[this.cenaAtualIndex];
    }

    cenaCarregada(nomeCena) {
        this.cenasCarregadas.add(nomeCena);
        
        // Verifica se todas as cenas foram carregadas
        if (this.cenasCarregadas.size === this.cenas.length + 1) { // +1 para incluir o Boot
            // Esconde o indicador de carregamento
            const loadingIndicator = document.getElementById('loading');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    resetarCena() {
        const cenaAtual = this.cenas[this.cenaAtualIndex].key;
        
        // Para todos os sons
        if (this.game.sound) {
            this.game.sound.stopAll();
        }

        // Para a cena atual
        this.game.scene.stop(cenaAtual);

        // Reinicia a mesma cena
        this.game.scene.start(cenaAtual);
    }
}
