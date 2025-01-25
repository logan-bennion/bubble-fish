import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import GameCanvas from './GameCanvas';
import Shop from './Shop';

export default function GameScreen() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentFish, setCurrentFish] = useState(null);
  const [fishFood, setFishFood] = useState(0);
  const gameCanvasRef = useRef(null);
  const router = useRouter();

  const handleAddTime = (seconds) => {
    console.log('Adding time:', seconds); // Debug log
    setTimeLeft(current => {
      const newTime = current + seconds;
      console.log('New time:', newTime); // Debug log
      // Update the game engine's time
      if (gameCanvasRef.current) {
        gameCanvasRef.current.timeLeft = newTime;
      }
      return newTime;
    });
  };

  const handleTimeChange = (time) => {
    setTimeLeft(time);
  };

  const handleResume = () => {
    if (gameCanvasRef.current) {
      gameCanvasRef.current.togglePause();
      setIsPaused(false);
    }
  };

  const handleQuit = () => {
    console.log('Handling quit');
    if (gameCanvasRef.current) {
      gameCanvasRef.current.quit();
    }
    setGameStarted(false);
    setIsPaused(false);
    router.replace('/');
  };

  const handleGameOver = (finalScore) => {
    console.log('Game Over! Final score:', finalScore);
    setIsGameOver(true);
    if (gameCanvasRef.current) {
      gameCanvasRef.current.isPaused = true;
    }
  };

  const handlePlayAgain = () => {
    setGameStarted(false);
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    setIsPaused(false);
  };

  if (!gameStarted) {
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.title}>Bubble Time</Text>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => setGameStarted(true)}
        >
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      {/* Game Canvas Area */}
      <View style={styles.canvasWrapper}>
        <GameCanvas 
          ref={gameCanvasRef}
          onScoreChange={setScore}
          onTimeChange={setTimeLeft}
          onPauseChange={setIsPaused}
          onGameOver={handleGameOver}
        />
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.text}>Score: {score}</Text>
          <Text style={styles.text}>Time: {Math.ceil(timeLeft)}s</Text>
        </View>
      </View>

      {/* Shop Area */}
      <View style={styles.shopWrapper}>
        <Shop 
          score={score} 
          setScore={setScore}
          fishFood={fishFood}
          setFishFood={setFishFood}
          currentFish={currentFish}
          setCurrentFish={setCurrentFish}
          addTime={handleAddTime}
          gameCanvasRef={gameCanvasRef}
        />
      </View>

      {/* Game Over Screen */}
      {isGameOver && (
        <View style={styles.gameOverMenu}>
          <View style={styles.gameOverContent}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            <Text style={styles.gameOverText}>Final Score: {score}</Text>
            <Text style={styles.gameOverText}>Time Survived: {30 - timeLeft}s</Text>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={handlePlayAgain}
            >
              <Text style={styles.menuButtonText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => router.replace('/')}
            >
              <Text style={styles.menuButtonText}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pause Menu */}
      {isPaused && !isGameOver && (
        <View style={styles.pauseMenu}>
          <View style={styles.pauseContent}>
            <Text style={styles.pauseTitle}>Paused</Text>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={handleResume}
            >
              <Text style={styles.menuButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={handleQuit}
            >
              <Text style={styles.menuButtonText}>Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
  },
  gameContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    height: '100vh',
    width: '100vw',
  },
  canvasWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
  },
  shopWrapper: {
    width: 250,
    height: '100%',
    borderLeft: '2px solid #ccc',
    backgroundColor: '#fff',
    overflowY: 'auto',
  },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    pointerEvents: 'none',
    zIndex: 1,
  },
  text: {
    fontSize: 20,
    color: 'black',
    marginBottom: 10,
    userSelect: 'none',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px white',
  },
  pauseMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pauseContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 200,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  menuButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 18,
  },
  gameOverMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  gameOverContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 300,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF4444',
  },
  gameOverText: {
    fontSize: 24,
    marginBottom: 15,
    color: '#333',
  },
});
