import React, { useEffect, useRef, forwardRef } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import { GameEngine } from '../game/GameEngine';

const GameCanvas = forwardRef(({ onScoreChange, onTimeChange, onPauseChange, onGameOver }, ref) => {
    const engineRef = useRef(null);

    const handleContextCreate = (gl) => {
        console.log('GL Context Created');
        const height = window.innerHeight;
        const width = height;
        
        // Set canvas size
        gl.canvas.width = width;
        gl.canvas.height = height;
        
        engineRef.current = new GameEngine(gl, {
            onScoreChange,
            onTimeChange,
            onPauseChange,
            onGameOver
        });
    };

    const handleTouch = (event) => {
        event.preventDefault();
        if (engineRef.current) {
            const rect = event.target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            engineRef.current.handleTouch(x, y);
        }
    };

    useEffect(() => {
        if (ref) {
            ref.current = engineRef.current;
        }
        return () => {
            if (engineRef.current) {
                engineRef.current.cleanup();
            }
        };
    }, [ref]);

    return (
        <View style={styles.container}
            onClick={handleTouch}
        >
            <View style={styles.canvasContainer}>
                <GLView
                    style={styles.canvas}
                    onContextCreate={handleContextCreate}
                />
            </View>
        </View>
    );
});

const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#fff',
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    canvasContainer: {
        width: '100vh', // Square size based on viewport height
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: '1/1', // Force square aspect ratio
        maxWidth: '100%',
        maxHeight: '100%',
    },
    canvas: {
        width: '100%',
        height: '100%',
    },
};

export default GameCanvas; 