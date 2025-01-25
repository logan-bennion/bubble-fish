import { Asset } from 'expo-asset';
import { mat4 } from 'gl-matrix';
import React from 'react';
import { audioManager } from './AudioManager';

export class GameEngine {
    
    constructor(gl, callbacks) {
        this.gl = gl;
        this.callbacks = callbacks;
        this.score = 0;
        this.timeLeft = 30;
        this.timer = 0;
        this.particles = [];
        this.isPaused = false;
        this.isGameOver = false;
        this.frameCount = 0;
        this.bubbleTextures = new Array(8);
        this.poppingBubbles = [];
        this.fishTextures = {
            fishyBoi: new Array(8),
            speedy: new Array(8),
            bigFish: new Array(8),
            clownFish: new Array(8),
            sunFish: new Array(8)
        };
        this.currentFishFrame = 1;
        this.isEvolvingFish = false;
        
        // Create a ref for the canvas
        this.canvasRef = React.createRef();

        // Bind the escape key handler
        this.handleKeyPress = this.handleKeyPress.bind(this);
        window.addEventListener('keydown', this.handleKeyPress);
        
        this.fish = {
            fishyBoi: {
                unlocked: true,
                purchased: false,
                currentFrame: 1,
                isEvolving: false,
                feedCount: 0,
                x: 0,
                y: 0,
                direction: 1,
                speed: 0.01,
                verticalSpeed: 0.005,
                verticalDirection: 1,
                verticalOffset: 0,
                scale: 0.8
            },
            speedy: {
                unlocked: false,
                purchased: false,
                currentFrame: 1,
                isEvolving: false,
                feedCount: 0,
                x: 0,
                y: 0,
                direction: 1,
                speed: 0.02,
                verticalSpeed: 0.008,
                verticalDirection: 1,
                verticalOffset: 0,
                scale: 0.8
            },
            bigFish: {
                unlocked: false,
                purchased: false,
                currentFrame: 1,
                isEvolving: false,
                feedCount: 0,
                x: 0,
                y: 0,
                direction: 1,
                speed: 0.008,
                verticalSpeed: 0.004,
                verticalDirection: 1,
                verticalOffset: 0,
                scale: 1.2
            },
            clownFish: {
                unlocked: false,
                purchased: false,
                currentFrame: 1,
                isEvolving: false,
                feedCount: 0,
                x: 0,
                y: 0,
                direction: 1,
                speed: 0.015,
                verticalSpeed: 0.007,
                verticalDirection: 1,
                verticalOffset: 0,
                scale: 1.0
            },
            sunFish: {
                unlocked: false,
                purchased: false,
                currentFrame: 1,
                isEvolving: false,
                feedCount: 0,
                x: 0,
                y: 0,
                direction: 1,
                speed: 0.012,
                verticalSpeed: 0.006,
                verticalDirection: 1,
                verticalOffset: 0,
                scale: 1.5
            }
        };

        this.availableFish = [
            {
                name: "Speedy Fish",
                cost: 200,
                requiredFeeds: 10,
                description: "A quick little friend"
            },
            {
                name: "Big Fish",
                cost: 500,
                requiredFeeds: 20,
                description: "A larger companion"
            },
            {
                name: "Sun Fish",
                cost: 1000,
                requiredFeeds: 30,
                description: "Rare and valuable"
            }
        ];

        // Add background texture
        this.backgroundTexture = null;
        this.texturesLoaded = {
            background: false,
            bubbles: false,
            fish: false
        };

        this.setupGL();
        this.loadTextures();
    }

    async loadTextures() {
        console.log('Loading textures...');
        try {
            // Load background texture first
            const backgroundAsset = Asset.fromModule(require('../assets/background.png'));
            await backgroundAsset.downloadAsync();
            const { localUri } = backgroundAsset;
            
            const texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            
            const image = new Image();
            image.src = localUri;
            
            await new Promise((resolve) => {
                image.onload = () => {
                    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                    this.gl.texImage2D(
                        this.gl.TEXTURE_2D,
                        0,
                        this.gl.RGBA,
                        this.gl.RGBA,
                        this.gl.UNSIGNED_BYTE,
                        image
                    );
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                    this.backgroundTexture = texture;
                    this.texturesLoaded.background = true;
                    resolve();
                };
                image.onerror = (error) => {
                    console.error('Error loading background texture:', error);
                    resolve();
                };
            });

            // Define all bubble textures statically
            const bubbleAssets = [
                require('../assets/bubble_big_1.png'),
                require('../assets/bubble_big_2.png'),
                require('../assets/bubble_big_3.png'),
                require('../assets/bubble_big_4.png'),
                require('../assets/bubble_big_5.png'),
                require('../assets/bubble_big_6.png'),
                require('../assets/bubble_big_7.png'),
                require('../assets/bubble_big_8.png'),
            ];

            // Load bubble textures
            for (let i = 0; i < bubbleAssets.length; i++) {
                const asset = Asset.fromModule(bubbleAssets[i]);
                await asset.downloadAsync();
                const { localUri } = asset;
                
                const texture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                
                const image = new Image();
                image.src = localUri;
                
                await new Promise((resolve) => {
                    image.onload = () => {
                        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                        this.gl.texImage2D(
                            this.gl.TEXTURE_2D,
                            0,
                            this.gl.RGBA,
                            this.gl.RGBA,
                            this.gl.UNSIGNED_BYTE,
                            image
                        );
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                        this.bubbleTextures[i] = texture;
                        this.texturesLoaded.bubbles = true;
                        resolve();
                    };
                    image.onerror = (error) => {
                        console.error(`Error loading bubble frame ${i + 1}:`, error);
                        resolve();
                    };
                });
            }
            
            this.bubbleTexture = this.bubbleTextures[0];  // Set initial texture
            this.textureLoaded = true;
            console.log('Bubble textures loaded');

            // Fish texture imports
            const fishTextures = {
                fishyBoi: [
                    require('../assets/fish_basic_1.png'),
                    require('../assets/fish_basic_2.png'),
                    require('../assets/fish_basic_3.png'),
                    require('../assets/fish_basic_4.png'),
                    require('../assets/fish_basic_5.png'),
                    require('../assets/fish_basic_6.png'),
                    require('../assets/fish_basic_7.png'),
                    require('../assets/fish_basic_8.png'),
                ],
                speedy: [
                    require('../assets/fish_speedy_1.png'),
                    require('../assets/fish_speedy_2.png'),
                    require('../assets/fish_speedy_3.png'),
                    require('../assets/fish_speedy_4.png'),
                    require('../assets/fish_speedy_5.png'),
                    require('../assets/fish_speedy_6.png'),
                    require('../assets/fish_speedy_7.png'),
                    require('../assets/fish_speedy_8.png'),
                ],
                bigFish: [
                    require('../assets/fish_tuna_1.png'),
                    require('../assets/fish_tuna_2.png'),
                    require('../assets/fish_tuna_3.png'),
                    require('../assets/fish_tuna_4.png'),
                    require('../assets/fish_tuna_5.png'),
                    require('../assets/fish_tuna_6.png'),
                    require('../assets/fish_tuna_7.png'),
                    require('../assets/fish_tuna_8.png'),
                ],
                clownFish: [
                    require('../assets/fish_clown_1.png'),
                    require('../assets/fish_clown_2.png'),
                    require('../assets/fish_clown_3.png'),
                    require('../assets/fish_clown_4.png'),
                    require('../assets/fish_clown_5.png'),
                    require('../assets/fish_clown_6.png'),
                    require('../assets/fish_clown_7.png'),
                    require('../assets/fish_clown_8.png'),
                ],
                sunFish: [
                    require('../assets/fish_sun_1.png'),
                    require('../assets/fish_sun_2.png'),
                    require('../assets/fish_sun_3.png'),
                    require('../assets/fish_sun_4.png'),
                    require('../assets/fish_sun_5.png'),
                    require('../assets/fish_sun_6.png'),
                    require('../assets/fish_sun_7.png'),
                    require('../assets/fish_sun_8.png'),
                ],
            };

            // Load textures for each fish type
            for (const [fishType, textureArray] of Object.entries(fishTextures)) {
                console.log(`Loading ${fishType} textures...`);
                for (let i = 0; i < textureArray.length; i++) {
                    try {
                        const asset = Asset.fromModule(textureArray[i]);
                        await asset.downloadAsync();
                        const { localUri } = asset;
                        
                        const texture = this.gl.createTexture();
                        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                        
                        const image = new Image();
                        image.src = localUri;
                        
                        await new Promise((resolve) => {
                            image.onload = () => {
                                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                                this.gl.texImage2D(
                                    this.gl.TEXTURE_2D,
                                    0,
                                    this.gl.RGBA,
                                    this.gl.RGBA,
                                    this.gl.UNSIGNED_BYTE,
                                    image
                                );
                                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                                this.fishTextures[fishType][i] = texture;
                                this.texturesLoaded.fish = true;
                                resolve();
                            };
                            image.onerror = (error) => {
                                console.error(`Error loading ${fishType} frame ${i + 1}:`, error);
                                resolve();
                            };
                        });
                    } catch (error) {
                        console.error(`Error loading ${fishType} texture ${i + 1}:`, error);
                    }
                }
                console.log(`${fishType} textures loaded`);
            }

            this.start();
        } catch (error) {
            console.error('Error loading textures:', error);
        }
    }

    setupGL() {
        // Create shaders and program
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, `
            attribute vec4 position;
            attribute vec2 texcoord;
            varying vec2 v_texcoord;
            void main() {
                gl_Position = position;
                v_texcoord = texcoord;
            }
        `);

        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, `
            precision mediump float;
            uniform sampler2D texture;
            varying vec2 v_texcoord;
            void main() {
                vec4 color = texture2D(texture, v_texcoord);
                gl_FragColor = color;
            }
        `);

        this.program = this.createProgram(vertexShader, fragmentShader);

        // Get attribute locations
        this.positionLocation = this.gl.getAttribLocation(this.program, "position");
        this.texcoordLocation = this.gl.getAttribLocation(this.program, "texcoord");

        // Create buffers
        this.positionBuffer = this.gl.createBuffer();
        this.texcoordBuffer = this.gl.createBuffer();

        // Enable alpha blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    start() {
        if (!this.gameLoop && this.texturesLoaded.background) {
            console.log('Starting game loop');
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
            this.startTimer();
            this.addBubble();
            audioManager.playBackground();
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.timeLeft = Math.max(0, this.timeLeft - 1);
                
                if (this.callbacks.onTimeChange) {
                    this.callbacks.onTimeChange(this.timeLeft);
                }
                
                if (this.timeLeft <= 0 && !this.isGameOver) {
                    this.isGameOver = true;
                    if (this.callbacks.onGameOver) {
                        this.callbacks.onGameOver(this.score);
                    }
                }
            }
        }, 1000);
    }

    update() {
        if (!this.isPaused && !this.isGameOver) {
            // Update fish positions
            Object.values(this.fish).forEach(fish => {
                if (fish.purchased && fish.unlocked) {
                    // Update horizontal position
                    fish.x += fish.speed * fish.direction;
                    
                    // Reverse direction at screen edges
                    if (fish.x > 0.8) { // Right edge
                        fish.direction = -1;
                    } else if (fish.x < -0.8) { // Left edge
                        fish.direction = 1;
                    }
                    
                    // Update vertical position with sine wave movement
                    fish.verticalOffset += fish.verticalSpeed * fish.verticalDirection;
                    if (fish.verticalOffset > 0.3) {
                        fish.verticalDirection = -1;
                    } else if (fish.verticalOffset < -0.3) {
                        fish.verticalDirection = 1;
                    }
                    fish.y = fish.verticalOffset;
                }
            });

            // Add new bubbles randomly
            if (Math.random() < 0.03) {
                this.addBubble();
            }

            // Update bubble positions
            this.particles = this.particles.filter(particle => {
                particle.y -= particle.speed;
                // var period = particle.period * particle.y;
                // var amplitude = 5 * particle.apmlitude;
                particle.x = 5 * Math.sin(0.05 * particle.y) + particle.col;
                return particle.y + particle.size > 0;
            });

            // Update timer
            if (this.timeLeft <= 0 && !this.isGameOver) {
                this.isGameOver = true;
                if (this.callbacks.onGameOver) {
                    this.callbacks.onGameOver(this.score);
                }
                return; // Stop updating once game is over
            }

            // Draw everything
            this.draw();
            
            // Continue game loop
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
        }
    }

    addBubble() {
        if (!this.gl || !this.gl.canvas) return;
        
        const canvas = this.gl.canvas;
        const size = 40; // Bubbles between 20 and 50 pixels
        const strength = Math.ceil(Math.random() * 3);
        const period = Math.random * 5;
        const amplitude = Math.random * 2 + 1;
        
        // Keep bubbles within canvas bounds
        const col = Math.random() * (canvas.width - size * 2) + size;
        const x = col;
        const y = canvas.height + size;
        
        this.particles.push({
            x,
            y,
            size,
            strength,
            period,
            amplitude,
            col,
            speed: Math.random() * 10 + 3,
        });

    }

    draw() {
        if (!this.gl || !this.texturesLoaded.background) {
            return;
        }

        this.gl.clearColor(0.68, 0.85, 0.9, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);

        // Draw background
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.backgroundTexture);
        const backgroundPositions = new Float32Array([
            -1, -1,  // Bottom left
            1, -1,   // Bottom right
            -1, 1,   // Top left
            1, 1,    // Top right
        ]);
        const backgroundTexcoords = new Float32Array([
            0.0, 1.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
        ]);

        // Upload position data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, backgroundPositions, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Upload texture coordinate data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, backgroundTexcoords, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Draw the background
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Draw regular bubbles
        this.particles.forEach(particle => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.bubbleTextures[0]);
            this.drawBubble(particle);
        });

        // Draw popping bubbles with original animation speed
        this.poppingBubbles = this.poppingBubbles.filter(bubble => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.bubbleTextures[bubble.frame]);
            this.drawBubble(bubble);
            bubble.frame++;
            return bubble.frame < 8;
        });

        // Draw purchased fish
        Object.entries(this.fish).forEach(([fishType, fish]) => {
            if (fish.purchased && fish.unlocked) {
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.fishTextures[fishType][fish.currentFrame - 1]);
                this.drawFish(fish, fishType);
            }
        });

        // Update timer display through callback
        if (this.callbacks.onTimeChange) {
            this.callbacks.onTimeChange(Math.max(0, this.timeLeft));
        }

        // Check for game over
        if (this.timeLeft <= 0 && !this.isGameOver) {
            this.isGameOver = true;
            if (this.callbacks.onGameOver) {
                this.callbacks.onGameOver(this.score);
            }
        }
    }

    drawBubble(particle) {
        if (!this.gl) return;

        const canvas = this.gl.canvas;
        
        // Convert screen coordinates to clip space (-1 to 1)
        const x = (particle.x / canvas.width) * 2 - 1;
        const y = -((particle.y / canvas.height) * 2 - 1); // Flip Y coordinate
        const size = (particle.size / canvas.width) * 2;

        // Set up vertex positions in clip space
        const positions = new Float32Array([
            x - size, y - size,
            x + size, y - size,
            x - size, y + size,
            x + size, y + size,
        ]);

        const texcoords = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ]);

        // Upload position data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Upload texture coordinate data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texcoords, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Draw the bubble
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    drawFish(fish, fishType) {
        if (!this.gl) return;

        const canvas = this.gl.canvas;
        const currentTexture = this.fishTextures[fishType][fish.currentFrame - 1];
        
        // Calculate size relative to canvas while maintaining aspect ratio
        const baseScale = Math.min(canvas.width, canvas.height) * 0.2;
        const scale = baseScale * (fish.scale || 0.2); // Use fish-specific scale or default
        const aspectRatio = 1;
        const width = scale * aspectRatio;
        const height = scale;
        
        // Convert to clip space coordinates (-1 to 1)
        const normalizedWidth = (width / canvas.width) * 2;
        const normalizedHeight = (height / canvas.height) * 2;

        // Use fish's position for x and y
        const x = fish.x;
        const y = fish.y;

        // Set up vertex positions in clip space
        // Flip UVs horizontally when swimming left (reversed from previous version)
        const texcoords = new Float32Array(
            fish.direction === 1 ? [
                1.0, 1.0, // Swimming right
                0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,
            ] : [
                0.0, 1.0, // Swimming left
                1.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
            ]
        );

        const positions = new Float32Array([
            x - normalizedWidth/2, y - normalizedHeight/2,
            x + normalizedWidth/2, y - normalizedHeight/2,
            x - normalizedWidth/2, y + normalizedHeight/2,
            x + normalizedWidth/2, y + normalizedHeight/2,
        ]);

        // Upload position data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Upload texture coordinate data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texcoords, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Draw the fish
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    handleTouch(x, y) {
        if (this.isPaused || !this.gl) return;

        // Get canvas dimensions
        const canvas = this.gl.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // Convert click coordinates to canvas coordinates
        const canvasX = x * (canvas.width / rect.width);
        const canvasY = y * (canvas.height / rect.height);

        // First check for fish clicks (evolution)
        Object.entries(this.fish).forEach(([fishType, fish]) => {
            if (fish.purchased && fish.feedCount >= 10) {
                // Convert fish position to canvas coordinates
                const fishX = (fish.x + 1) * canvas.width / 2;
                const fishY = (-fish.y + 1) * canvas.height / 2;
                
                // Calculate hitbox size based on fish scale
                const hitboxSize = (fish.scale || 0.8) * canvas.width * 0.2;
                
                // Calculate distance between click and fish center
                const distance = Math.sqrt(
                    Math.pow(canvasX - fishX, 2) +
                    Math.pow(canvasY - fishY, 2)
                );

                // If click is within fish hitbox
                if (distance < hitboxSize) {
                    this.evolveFish(fishType);
                    return;
                }
            }
        });

        // Then check for bubble clicks
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Calculate distance between click and bubble center
            const distance = Math.sqrt(
                Math.pow(canvasX - particle.x, 2) +
                Math.pow(canvasY - particle.y, 2)
            );

            // Make collision detection more forgiving
            const hitboxSize = particle.size * 1.3;

            // If click is within bubble hitbox
            if (distance < hitboxSize) {
                
                
                // Add to popping bubbles with animation frame counter
                if (particle.strength <= 1) {
                    // Remove the bubble from regular particles
                    this.particles.splice(i, 1);x
                    this.poppingBubbles.push({
                        ...particle,
                        frame: 0
                    });
                } else {
                    particle.strength -= 1;
                }
                // Update both internal and external score
                this.score += 1000;
                if (this.callbacks.onScoreChange) {
                    this.callbacks.onScoreChange(this.score);
                }
                audioManager.playBubblePop();
                break;
            }
        }
    }
    
    handleKeyPress(event) {
        if (event.key === 'Escape') {
            this.togglePause();
            // Notify the UI to show/hide pause menu
            if (this.callbacks.onPauseChange) {
                this.callbacks.onPauseChange(this.isPaused);
            }
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        audioManager.stopBackground();
        if (!this.isPaused) {
            audioManager.playBackground();
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
        }
    }

    end() {
        this.isGameOver = true;
        clearInterval(this.timerInterval);
        cancelAnimationFrame(this.gameLoop);
    }

    quit() {
        console.log('Quitting game');
        this.cleanup();
        if (this.callbacks.onQuit) {
            this.callbacks.onQuit();
        }
    }

    cleanup() {
        console.log('Cleaning up game');
        this.end();
        window.removeEventListener('keydown', this.handleKeyPress);
        
        if (this.gl) {
            this.gl.deleteProgram(this.program);
            this.gl.deleteBuffer(this.positionBuffer);
            this.gl.deleteBuffer(this.texcoordBuffer);
            // Clean up all textures
            this.bubbleTextures.forEach(texture => {
                if (texture) {
                    this.gl.deleteTexture(texture);
                }
            });
            // Clean up fish textures
            Object.values(this.fishTextures).forEach(textures => {
                textures.forEach(texture => {
                    if (texture) {
                        this.gl.deleteTexture(texture);
                    }
                });
            });
        }
        audioManager.stopBackground();
    }

    // Add method to update time
    updateTime(newTime) {
        this.timeLeft = newTime;
        if (this.callbacks.onTimeChange) {
            this.callbacks.onTimeChange(Math.max(0, this.timeLeft));
        }
    }

    // Add method to update score from outside
    updateScore(newScore) {
        this.score = newScore;
    }

    feedFish(fishType) {
        const fish = this.fish[fishType];
        if (fish && fish.purchased) {
            fish.feedCount++;

            // Update fish frame based on feed count
            if (fish.feedCount < 10) {
                fish.currentFrame = Math.floor(fish.feedCount / 2) + 1;
            }

            // Check if fish can evolve
            if (fish.feedCount >= 10 && !fish.isEvolving) {
                fish.canEvolve = true;
                fish.currentFrame = 6;
                fish.speed = 0.000001;
                fish.verticalSpeed = 0.000001;
            }
            audioManager.playFishEat();
        }
    }

    handleFishClick() {
        const currentFish = this.fish[0];
        if (currentFish.canEvolve && !currentFish.isEvolving) {
            currentFish.isEvolving = true;
            this.evolveFish();
        }
    }

    async evolveFish(fishType) {
        const fish = this.fish[fishType];
        if (!fish || !fish.purchased || fish.feedCount < 10 || fish.isEvolving) return;

        fish.isEvolving = true;
        
        // Play evolution animation
        for (let frame = 7; frame <= 8; frame++) {
            fish.currentFrame = frame;
            await new Promise(resolve => setTimeout(resolve, 500)); // Half second per frame
        }

        // Delete the evolved fish
        delete this.fish[fishType];

        // Notify the UI to unlock next fish
        if (this.callbacks.onFishEvolved) {
            this.callbacks.onFishEvolved(fishType);
        }
        audioManager.playFishEvolve();
    }

    // Update purchase method
    purchaseFish(fishType) {
        if (this.fish[fishType]) {
            const fish = this.fish[fishType];
            fish.purchased = true;
            fish.unlocked = true;
            // Keep existing movement properties from the fish object
            fish.x = 0;
            fish.y = 0;
            fish.direction = 1;
            // Speed and scale are already set in the fish object
        }
    }
} 