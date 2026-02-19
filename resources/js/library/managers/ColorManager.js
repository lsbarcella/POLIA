export class ColorManager {
    // Constantes estáticas para as cores
    static BLUE = 'blue';
    static YELLOW = 'yellow';
    static PINK = 'pink';
    static ORANGE = 'orange';
    static RED = 'red';
    static GREEN = 'green';
    static CYAN = 'cyan';

    // Cores padrão (fallback)
    static DEFAULT_COLORS = {
        main: 0x5ADCFF,
        shadow: 0x288FCE
    };

    // Configurações de cores por marca
    static COLOR_SCHEMES = {
        SAE: {
            blue: {
                main: 0x5ADCFF,
                shadow: 0x288FCE
            },
            yellow: {
                main: 0xFBC82C,
                shadow: 0xD86F19
            },
            green: {
                main: 0x2DF98E,
                shadow: 0x26A373
            },
            red: {
                main: 0xF2516C,
                shadow: 0x9B214D
            }
        },
        SPE: {
            orange: {
                main: 0xFF5000,
                shadow: 0xBD3200
            },
            blue: {
                main: 0x4E6ADC,
                shadow: 0x273A8E
            },
            pink: {
                main: 0x945ACE,
                shadow: 0x641486
            },
            red: {
                main: 0xF2516C,
                shadow: 0x9B214D
            },
            cyan: {
                main: 0x13C0C0,
                shadow: 0x0F7677
            }
        },
        CQT: {
            blue: {
                main: 0x21BDBE,
                shadow: 0x0F7677
            },
            yellow: {
                main: 0xF3C836,
                shadow: 0xD86F19
            },
            pink: {
                main: 0xAE217F,
                shadow: 0x59093F
            }
        }
    };

    // Cores padrão que não mudam entre marcas
    static COMMON_COLORS = {
        shadow2: 0x1F292D,
        text: '#FFFFFF',
        stroke: '#1F292D'
    };

    /**
     * Obtém as cores para uma marca específica
     * @param {string} marca - A marca (SAE, SPE, CQT)
     * @param {string} colorName - O nome da cor (blue, yellow, pink, orange, red, green)
     * @returns {Object} Objeto com as cores main, shadow, shadow2, text, stroke
     */
    static getColors(marca, colorName = 'blue') {
        const marcaColors = this.COLOR_SCHEMES[marca];
        if (!marcaColors) {
            console.warn(`Marca '${marca}' não encontrada. Usando SAE como padrão.`);
            return this.getColors('SAE', colorName);
        }

        const colorScheme = marcaColors[colorName];
        if (!colorScheme) {
            console.warn(`Cor '${colorName}' não encontrada para marca '${marca}'. Aplicando cores padrão.`);
            return {
                main: this.DEFAULT_COLORS.main,
                shadow: this.DEFAULT_COLORS.shadow,
                ...this.COMMON_COLORS
            };
        }

        return {
            main: colorScheme.main,
            shadow: colorScheme.shadow,
            ...this.COMMON_COLORS
        };
    }

    /**
     * Obtém todas as cores disponíveis para uma marca
     * @param {string} marca - A marca (SAE, SPE, CQT)
     * @returns {Object} Objeto com todos os esquemas de cores da marca
     */
    static getAllColors(marca) {
        const marcaColors = this.COLOR_SCHEMES[marca];
        if (!marcaColors) {
            console.warn(`Marca '${marca}' não encontrada. Usando SAE como padrão.`);
            return this.getAllColors('SAE');
        }

        const result = {};
        for (const [colorName, colors] of Object.entries(marcaColors)) {
            result[colorName] = {
                main: colors.main,
                shadow: colors.shadow,
                ...this.COMMON_COLORS
            };
        }
        return result;
    }

    /**
     * Obtém a marca atual do gameData
     * @param {Phaser.Scene} scene - A cena atual
     * @returns {string} A marca atual
     */
    static getCurrentMarca(scene) {
        try {
            const gameData = scene.cache.json.get('gameData');
            return gameData.configuracoes.marca || 'SAE';
        } catch (error) {
            console.warn('Erro ao obter marca do gameData. Usando SAE como padrão.');
            return 'SAE';
        }
    }

    /**
     * Verifica se uma cor está disponível para uma marca
     * @param {string} marca - A marca (SAE, SPE, CQT)
     * @param {string} colorName - O nome da cor
     * @returns {boolean} True se a cor está disponível
     */
    static hasColor(marca, colorName) {
        const marcaColors = this.COLOR_SCHEMES[marca];
        return marcaColors && marcaColors[colorName];
    }
} 