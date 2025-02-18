import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import GameCanvas from './GameCanvas';
import Shop from './Shop';
import WinScreen from './WinScreen';

export default function GameScreen() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [restart, setRestart] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentFish, setCurrentFish] = useState(null);
  const [fishFood, setFishFood] = useState(0);
  const [inTutorial, setInTutorial] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
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
    setFishFood(0);
    setCurrentFish(null);
    setScore(0);
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
    setCurrentFish(null);
    setFishFood(0);
  };

  const handleRestart = () => {
    setRestart(true);
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    setIsPaused(false);
    setCurrentFish(null);
    setFishFood(0);
    
  };

  const handleFishEvolved = (fishType) => {
    console.log(`Fish evolved: ${fishType}`);
    // Any additional game-wide state updates needed for evolution
  };

  const handleWin = (stats) => {
    setShowWinScreen(true);
    setTimeElapsed(stats.timeElapsed);
  };

  if (!gameStarted && !inTutorial) {
    return (
      <ImageBackground 
        source={require('../assets/background.png')} 
        style={styles.menuContainer}
        resizeMode="cover"
      >
        <View style={styles.menuOverlay}>
          <Text style={styles.title}>Bubble Fish</Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setGameStarted(true)}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setInTutorial(true)}
          >
            <Text style={styles.startButtonText}>Tutorial</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>"Fish are friends, not food." - Bruce</Text>
        </View>
      </ImageBackground>
    );

    
  }

  return (
    <View style={styles.gameContainer}>
      {/* Game Canvas Area */}
      {!inTutorial && (
      <View style={styles.canvasWrapper}>
        <GameCanvas 
          ref={gameCanvasRef}
          onScoreChange={setScore}
          onTimeChange={setTimeLeft}
          onPauseChange={setIsPaused}
          onGameOver={handleGameOver}
          onFishEvolved={handleFishEvolved}
          onWin={handleWin}
        />
      </View>
      )}

      {/* Shop Area */}
      {!inTutorial && (
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
          timeLeft={timeLeft}
        />
      </View>
      )}

      {/* Win Screen */}
      {showWinScreen && (
        <WinScreen
          score={score}
          timeElapsed={timeElapsed}
          onPlayAgain={handlePlayAgain}
          onQuit={handleQuit}
        />
      )}

      {/* Game Over Screen */}
      {isGameOver && !inTutorial && (
        <View style={styles.gameOverMenu}>
          <View style={styles.gameOverContent}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            <Text style={styles.gameOverText}>Final Score: {score}</Text>
            {/* <Text style={styles.gameOverText}>Time Survived: {30 - timeLeft}s</Text> */}
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={handlePlayAgain}
            >
              <Text style={styles.menuButtonText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={handlePlayAgain}
            >
              <Text style={styles.menuButtonText}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pause Menu */}
      {isPaused && !isGameOver && !inTutorial && (
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

      {/* Tutorial Screen */}
      {inTutorial && (
        <ImageBackground 
          source={require('../assets/background.png')} 
          style={styles.menuContainer}
          resizeMode="cover"
        >
          <View style={styles.menuOverlay}>
            <Text style={styles.title}>Tutorial</Text>
            <Text style={styles.text}>Welcome to Bubble Fish!</Text>
            <Text style={styles.text}>Click bubbles to collect money!</Text>
            <Text style={styles.text}>Buy fish and feed them in the shop!</Text>
            <Text style={styles.text}>Avoid running out of time by buying things!</Text>
            <Text style={styles.text}>Click fish to evolve when they have been fed enough!</Text>
            <Text style={styles.text}>Click the shark to defend your money!</Text>
            <Text style={styles.text}>Evolve all your fish to win!</Text>
            <Text style={styles.text}>Have fun!</Text>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => setInTutorial(false)}
            >
              <Text style={styles.startButtonText}>Ready to Play?</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 52, 164, 0.6)', // Semi-transparent blue overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#7393B3',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)', // Added shadow for better readability
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#7393B3',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: '#89CFF0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    color: '#1434A4',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  canvasWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
    overflow: 'hidden',
  },
  shopWrapper: {
    width: 250,
    height: '100%',
    borderLeft: '2px solid #ccc',
    backgroundColor: '#fff',
    overflow: 'hidden',
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
