import { Audio } from 'expo-av';

class AudioManager {
    constructor() {
        this.sounds = {};
        this.loadSounds();
    }

    async loadSounds() {
        try {
            // Load and configure background music
            const backgroundSound = new Audio.Sound();
            await backgroundSound.loadAsync(require('../assets/audio/background_music.mp3'));
            await backgroundSound.setIsLoopingAsync(true);
            await backgroundSound.setVolumeAsync(0.3);
            this.sounds.background = backgroundSound;

            // Load sound effects
            const bubblePopSound = new Audio.Sound();
            await bubblePopSound.loadAsync(require('../assets/audio/bubble_pop.wav'));
            await bubblePopSound.setVolumeAsync(0.5);
            this.sounds.bubblePop = bubblePopSound;

            const fishEvolveSound = new Audio.Sound();
            await fishEvolveSound.loadAsync(require('../assets/audio/fish_evolve.wav'));
            await fishEvolveSound.setVolumeAsync(0.5);
            this.sounds.fishEvolve = fishEvolveSound;

            const storeBuySound = new Audio.Sound();
            await storeBuySound.loadAsync(require('../assets/audio/shop_buy.wav'));
            await storeBuySound.setVolumeAsync(0.5);
            this.sounds.storeBuy = storeBuySound;

            const fishEatSound = new Audio.Sound();
            await fishEatSound.loadAsync(require('../assets/audio/fish_eat.wav'));
            await fishEatSound.setVolumeAsync(0.5);
            this.sounds.fishEat = fishEatSound;

            const sharkExplodeSound = new Audio.Sound();
            await sharkExplodeSound.loadAsync(require('../assets/audio/shark_explode.wav'));
            await sharkExplodeSound.setVolumeAsync(0.5);
            this.sounds.sharkExplode = sharkExplodeSound;

            const sharkHitSound = new Audio.Sound();
            await sharkHitSound.loadAsync(require('../assets/audio/shark_hit.wav'));
            await sharkHitSound.setVolumeAsync(0.5);
            this.sounds.sharkHit = sharkHitSound;
        } catch (error) {
            console.error('Error loading sounds:', error);
        }
    }

    async playBackground() {
        try {
            if (this.sounds.background) {
                await this.sounds.background.playAsync();
            }
        } catch (error) {
            console.log('Error playing background music:', error);
        }
    }

    async stopBackground() {
        try {
            if (this.sounds.background) {
                await this.sounds.background.stopAsync();
            }
        } catch (error) {
            console.log('Error stopping background music:', error);
        }
    }

    async playBubblePop() {
        await this.playSound('bubblePop');
    }

    async playFishEvolve() {
        await this.playSound('fishEvolve');
    }

    async playStoreBuy() {
        await this.playSound('storeBuy');
    }

    async playFishEat() {
        await this.playSound('fishEat');
    }

    async playSharkExplode() {
        await this.playSound('sharkExplode');
    }

    async playSharkHit() {
        await this.playSound('sharkHit');
    }

    async playSound(soundName) {
        try {
            if (this.sounds[soundName]) {
                await this.sounds[soundName].replayAsync();
            }
        } catch (error) {
            console.log(`Error playing ${soundName}:`, error);
        }
    }

    async cleanup() {
        try {
            for (const sound of Object.values(this.sounds)) {
                await sound.unloadAsync();
            }
        } catch (error) {
            console.log('Error cleaning up sounds:', error);
        }
    }
}

export const audioManager = new AudioManager(); 