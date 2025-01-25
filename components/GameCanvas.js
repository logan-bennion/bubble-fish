import React, { useEffect, useRef, forwardRef } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import { GameEngine } from '../game/GameEngine';

const GameCanvas = forwardRef(({ onScoreChange, onTimeChange, onPauseChange, onGameOver }, ref) => {
    const engineRef = useRef(null);

    const handleContextCreate = (gl) => {
        console.log('GL Context Created');
        // Set fixed canvas size
        gl.canvas.width = 800;
        gl.canvas.height = 600;
        
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
        <View 
            style={styles.container}
            onClick={handleTouch}
        >
            <GLView
                style={styles.canvas}
                onContextCreate={handleContextCreate}
            />
        </View>
    );
});

const styles = {
    container: {
        width: 800,
        height: 600,
        backgroundColor: '#fff',
        userSelect: 'none',
    },
    canvas: {
        width: '100%',
        height: '100%',
    },
};

export default GameCanvas; 