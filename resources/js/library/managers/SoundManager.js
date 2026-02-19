class SoundManager {
    static instance = null;
    static soundEffects = [];
    static isMuted = false;
    static isMusicMuted = false;  // Novo estado para música
    static currentSound = null;
    static backgroundMusic = null;  // Nova propriedade para música
    static game = null;
    static lastMusicVolume = 0.1;
    static lastSoundEffectsVolume = 1.0;  // Volume original dos efeitos sonoros

    // Método para obter a instância única
    static getInstance() {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    static init(game) {
        if (!this.game) {
            this.game = game;
            this.soundEffects = [];
            this.currentSound = null;
            this.backgroundMusic = null;
            this.loadVolumeSettings();
        }
    }

    // Carrega configurações de volume do localStorage
    static loadVolumeSettings() {
        try {
            const savedSettings = localStorage.getItem('soundManagerSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.isMuted = settings.isMuted || false;
                this.isMusicMuted = settings.isMusicMuted || false;
                this.lastMusicVolume = settings.lastMusicVolume || 0.1;
                this.lastSoundEffectsVolume = settings.lastSoundEffectsVolume || 1.0;
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de volume:', error);
        }
    }

    // Salva configurações de volume no localStorage
    static saveVolumeSettings() {
        try {
            const settings = {
                isMuted: this.isMuted,
                isMusicMuted: this.isMusicMuted,
                lastMusicVolume: this.lastMusicVolume,
                lastSoundEffectsVolume: this.lastSoundEffectsVolume
            };
            localStorage.setItem('soundManagerSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Erro ao salvar configurações de volume:', error);
        }
    }

    // Método para tocar um som
    static play(key, volume = 1.0, loop = false, onComplete = null) {
        if (!this.game || !this.game.sound) return null;

        try {
            // Salva o volume original se não estiver mutado
            if (!this.isMuted) {
                this.lastSoundEffectsVolume = volume;
                this.saveVolumeSettings();
            }

            const sound = this.game.sound.add(key, {
                volume: this.isMuted ? 0 : volume,
                loop: loop
            });

            if (onComplete && typeof onComplete === 'function') {
                sound.once('complete', onComplete);
            }

            sound.play();
            this.soundEffects.push(sound);
            return sound;
        } catch (error) {
            console.error('Erro ao tocar som:', error);
            return null;
        }
    }

    // Carrega o som sem tocar imediatamente
    static loadSound(key, volume = 1.0, loop = false) {
        if (!this.game || !this.game.sound) return null;

        try {
            // Salva o volume original se não estiver mutado
            if (!this.isMuted) {
                this.lastSoundEffectsVolume = volume;
                this.saveVolumeSettings();
            }

            if (this.currentSound) {
                this.stop(this.currentSound);
            }
            this.currentSound = this.game.sound.add(key, {
                volume: this.isMuted ? 0 : volume,
                loop: loop
            });
            return this.currentSound;
        } catch (error) {
            console.error('Erro ao carregar som:', error);
            return null;
        }
    }

    // Pausa um som específico
    static pause(sound) {
        if (sound && typeof sound.pause === 'function') {
            try {
                sound.pause();
            } catch (error) {
                console.error('Erro ao pausar som:', error);
            }
        }
    }

    // Retoma um som específico
    static resume(sound) {
        if (sound && typeof sound.resume === 'function') {
            try {
                sound.resume();
            } catch (error) {
                console.error('Erro ao retomar som:', error);
            }
        }
    }

    // Para um som específico
    static stop(sound) {
        if (sound && typeof sound.stop === 'function') {
            try {
                sound.stop();
                const index = this.soundEffects.indexOf(sound);
                if (index > -1) {
                    this.soundEffects.splice(index, 1);
                }
            } catch (error) {
                console.error('Erro ao parar som:', error);
            }
        }
    }

    // Pausa todos os sons
    static pauseAll() {
        if (this.game && this.game.sound) {
            try {
                this.game.sound.pauseAll();
            } catch (error) {
                console.error('Erro ao pausar todos os sons:', error);
            }
        }
    }

    // Retoma todos os sons
    static resumeAll() {
        if (this.game && this.game.sound) {
            try {
                this.game.sound.resumeAll();
            } catch (error) {
                console.error('Erro ao retomar todos os sons:', error);
            }
        }
    }

    // Para todos os sons (exceto música de fundo)
    static stopAll() {
        try {
            // Limpa sons inválidos
            this.soundEffects = this.soundEffects.filter(sound => {
                if (sound && typeof sound.stop === 'function') {
                    try {
                        sound.stop();
                        return false;
                    } catch (error) {
                        return false;
                    }
                }
                return false;
            });

            if (this.currentSound && typeof this.currentSound.stop === 'function') {
                try {
                    this.currentSound.stop();
                } catch (error) {
                    console.error('Erro ao parar som atual:', error);
                }
            }

            this.currentSound = null;
        } catch (error) {
            console.error('Erro ao parar todos os sons:', error);
        }
    }

    // Para apenas efeitos sonoros (preserva música de fundo)
    static stopSoundEffects() {
        try {
            // Limpa apenas efeitos sonoros, preserva música de fundo
            this.soundEffects = this.soundEffects.filter(sound => {
                if (sound && typeof sound.stop === 'function') {
                    try {
                        sound.stop();
                        return false;
                    } catch (error) {
                        return false;
                    }
                }
                return false;
            });

            if (this.currentSound && typeof this.currentSound.stop === 'function') {
                try {
                    this.currentSound.stop();
                } catch (error) {
                    console.error('Erro ao parar som atual:', error);
                }
            }

            this.currentSound = null;
        } catch (error) {
            console.error('Erro ao parar efeitos sonoros:', error);
        }
    }

    // Muta todos os sons
    static muteAll() {
        this.isMuted = true;
        try {
            // Limpa sons inválidos e atualiza volume dos válidos
            this.soundEffects = this.soundEffects.filter(sound => {
                if (sound && typeof sound.setVolume === 'function') {
                    try {
                        sound.setVolume(0);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
                return false;
            });

            if (this.currentSound && typeof this.currentSound.setVolume === 'function') {
                try {
                    this.currentSound.setVolume(0);
                } catch (error) {
                    console.error('Erro ao mutar som atual:', error);
                }
            }
        } catch (error) {
            console.error('Erro ao mutar todos os sons:', error);
        }
    }

    // Desmuta todos os sons
    static unmuteAll(volume = 1.0) {
        this.isMuted = false;
        try {
            // Limpa sons inválidos e atualiza volume dos válidos
            this.soundEffects = this.soundEffects.filter(sound => {
                if (sound && typeof sound.setVolume === 'function') {
                    try {
                        sound.setVolume(volume);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
                return false;
            });

            if (this.currentSound && typeof this.currentSound.setVolume === 'function') {
                try {
                    this.currentSound.setVolume(volume);
                } catch (error) {
                    console.error('Erro ao desmutar som atual:', error);
                }
            }
        } catch (error) {
            console.error('Erro ao desmutar todos os sons:', error);
        }
    }

    // Método para verificar se está mutado
    static isSoundMuted() {
        return this.isMuted;
    }

    // Métodos específicos para música
    static playMusic(key, volume = 1.0) {
        if (!this.game || !this.game.sound) return null;

        try {
            this.lastMusicVolume = volume;
            this.saveVolumeSettings(); // Salva o volume da música

            // Se já existe uma música tocando e é a mesma, não faz nada
            if (this.backgroundMusic && this.backgroundMusic.key === key && this.backgroundMusic.isPlaying) {
                return this.backgroundMusic;
            }

            // Para a música anterior se existir
            if (this.backgroundMusic && typeof this.backgroundMusic.stop === 'function') {
                this.backgroundMusic.stop();
            }

            this.backgroundMusic = this.game.sound.add(key, {
                volume: this.isMusicMuted ? 0 : this.lastMusicVolume,
                loop: true
            });
            
            this.backgroundMusic.play();
            return this.backgroundMusic;
        } catch (error) {
            console.error('Erro ao tocar música:', error);
            return null;
        }
    }

    // Verifica se a música de fundo está tocando
    static isMusicPlaying() {
        return this.backgroundMusic && this.backgroundMusic.isPlaying;
    }

    // Para apenas a música de fundo
    static stopMusic() {
        if (this.backgroundMusic && typeof this.backgroundMusic.stop === 'function') {
            try {
                this.backgroundMusic.stop();
                this.backgroundMusic = null;
            } catch (error) {
                console.error('Erro ao parar música:', error);
            }
        }
    }

    static muteMusic() {
        this.isMusicMuted = true;
        this.saveVolumeSettings(); // Salva o estado mutado
        if (this.backgroundMusic && typeof this.backgroundMusic.setVolume === 'function') {
            try {
                this.backgroundMusic.setVolume(0);
            } catch (error) {
                console.error('Erro ao mutar música:', error);
            }
        }
    }

    static unmuteMusic() {
        this.isMusicMuted = false;
        this.saveVolumeSettings(); // Salva o estado desmutado
        if (this.backgroundMusic && typeof this.backgroundMusic.setVolume === 'function') {
            try {
                this.backgroundMusic.setVolume(this.lastMusicVolume);
            } catch (error) {
                console.error('Erro ao desmutar música:', error);
            }
        }
    }

    static toggleMusic() {
        if (this.isMusicMuted) {
            this.unmuteMusic();
        } else {
            this.muteMusic();
        }
        return this.isMusicMuted;
    }

    // Métodos específicos para efeitos sonoros (não afetam música)
    static muteSoundEffects() {
        this.isMuted = true;
        this.saveVolumeSettings(); // Salva o estado mutado
        try {
            // Apenas os efeitos sonoros, não a música
            this.soundEffects = this.soundEffects.filter(sound => {
                if (sound && typeof sound.setVolume === 'function') {
                    try {
                        sound.setVolume(0);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
                return false;
            });

            if (this.currentSound && typeof this.currentSound.setVolume === 'function') {
                try {
                    this.currentSound.setVolume(0);
                } catch (error) {
                    console.error('Erro ao mutar som atual:', error);
                }
            }
        } catch (error) {
            console.error('Erro ao mutar efeitos sonoros:', error);
        }
    }

    static unmuteSoundEffects(volume = null) {
        this.isMuted = false;
        // Usa o volume salvo se não foi especificado um volume específico
        const targetVolume = volume !== null ? volume : this.lastSoundEffectsVolume;
        this.saveVolumeSettings(); // Salva o estado desmutado
        try {
            // Apenas os efeitos sonoros, não a música
            this.soundEffects = this.soundEffects.filter(sound => {
                if (sound && typeof sound.setVolume === 'function') {
                    try {
                        sound.setVolume(targetVolume);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
                return false;
            });

            if (this.currentSound && typeof this.currentSound.setVolume === 'function') {
                try {
                    this.currentSound.setVolume(targetVolume);
                } catch (error) {
                    console.error('Erro ao desmutar som atual:', error);
                }
            }
        } catch (error) {
            console.error('Erro ao desmutar efeitos sonoros:', error);
        }
    }
}

export default SoundManager;