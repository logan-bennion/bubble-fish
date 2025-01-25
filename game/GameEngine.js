import { Asset } from 'expo-asset';
import { mat4 } from 'gl-matrix';
import React from 'react';

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
        
        // Create a ref for the canvas
        this.canvasRef = React.createRef();

        // Bind the escape key handler
        this.handleKeyPress = this.handleKeyPress.bind(this);
        window.addEventListener('keydown', this.handleKeyPress);
        
        this.fish = [{
            size: 1,
            feedCount: 0,
            unlocked: true,
            cost: 0,
            name: "Basic Fish"
        }];

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
                name: "Golden Fish",
                cost: 1000,
                requiredFeeds: 30,
                description: "Rare and valuable"
            }
        ];

        this.setupGL();
        this.loadTextures();
    }

    async loadTextures() {
        console.log('Loading textures...');
        try {
            // Define all bubble textures statically
            const bubbleAssets = [
                require('../assets/images/bubble_big_1.png'),
                require('../assets/images/bubble_big_2.png'),
                require('../assets/images/bubble_big_3.png'),
                require('../assets/images/bubble_big_4.png'),
                require('../assets/images/bubble_big_5.png'),
                require('../assets/images/bubble_big_6.png'),
                require('../assets/images/bubble_big_7.png'),
                require('../assets/images/bubble_big_8.png'),
            ];

            // Load each texture
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
                        resolve();
                    };
                    image.onerror = (error) => {
                        console.error(`Error loading bubble frame ${i + 1}:`, error);
                        resolve();
                    };
                });
                
                this.bubbleTextures[i] = texture;
            }
            
            this.bubbleTexture = this.bubbleTextures[0];  // Set initial texture
            this.textureLoaded = true;
            console.log('All textures loaded');
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
        if (!this.gameLoop && this.textureLoaded) {
            console.log('Starting game loop');
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
            this.startTimer();
            // Force add initial bubble
            this.addBubble();
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
            // Add new bubbles randomly
            if (Math.random() < 0.03) {
                this.addBubble();
            }

            // Update bubble positions
            this.particles = this.particles.filter(particle => {
                particle.y -= particle.speed;
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
        const size = Math.random() * 30 + 20; // Bubbles between 20 and 50 pixels
        
        // Keep bubbles within canvas bounds
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = canvas.height + size;
        
        this.particles.push({
            x,
            y,
            size,
            speed: Math.random() * 5 + 1,
        });

    }

    draw() {
        if (!this.gl || !this.bubbleTexture || !this.textureLoaded) {
            return;
        }

        this.gl.clearColor(0.68, 0.85, 0.9, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);

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

    handleTouch(x, y) {
        if (this.isPaused || !this.gl) return;

        // Get canvas dimensions
        const canvas = this.gl.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // Convert click coordinates to canvas coordinates
        const canvasX = x * (canvas.width / rect.width);
        const canvasY = y * (canvas.height / rect.height);

        // Check collision with each bubble
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Calculate distance between click and bubble center
            const distance = Math.sqrt(
                Math.pow(canvasX - particle.x, 2) +
                Math.pow(canvasY - particle.y, 2)
            );

            // Make collision detection more forgiving
            const hitboxSize = particle.size * 2;

            // If click is within bubble hitbox
            if (distance < hitboxSize) {
                // Remove the bubble from regular particles
                this.particles.splice(i, 1);
                
                // Add to popping bubbles with animation frame counter
                this.poppingBubbles.push({
                    ...particle,
                    frame: 0
                });
                
                // Update both internal and external score
                this.score += 1000;
                if (this.callbacks.onScoreChange) {
                    this.callbacks.onScoreChange(this.score);
                }
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
        if (!this.isPaused) {
            // Resume the game loop when unpausing
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
        }
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
} 