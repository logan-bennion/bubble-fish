import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { audioManager } from '../game/AudioManager';

// Import all fish images
const fishImages = {
    fishyBoi: require('../assets/fish_basic_1.png'),
    speedy: require('../assets/fish_speedy_1.png'),
    bigFish: require('../assets/fish_tuna_1.png'),
    clownFish: require('../assets/fish_clown_1.png'),
    sunFish: require('../assets/fish_sun_1.png'),
};

export default function Shop({ score, setScore, fishFood, setFishFood, currentFish, setCurrentFish, addTime, gameCanvasRef }) {
  // Fish progression data - moved outside component to prevent resets
  const [fishData, setFishData] = React.useState({
    fishyBoi: {
      name: "Fishy Boi",
      cost: 50,
      requiredFood: 0,
      maxFood: 10,
      nextFish: "speedy",
      unlocked: true,
      evolved: false
    },
    speedy: {
      name: "Speedy",
      cost: 200,
      requiredFood: 10,
      maxFood: 10,
      nextFish: "bigFish",
      unlocked: false,
      evolved: false
    },
    bigFish: {
      name: "Big Fish",
      cost: 500,
      requiredFood: 10,
      maxFood: 10,
      nextFish: "clownFish",
      unlocked: false,
      evolved: false
    },
    clownFish: {
      name: "Clown Fish",
      cost: 750,
      requiredFood: 10,
      maxFood: 10,
      nextFish: "sunFish",
      unlocked: false,
      evolved: false
    },
    sunFish: {
      name: "Sun Fish",
      cost: 1000,
      requiredFood: 10,
      maxFood: 10,
      nextFish: null,
      unlocked: false,
      evolved: false
    }
  });

  // Handle fish evolution
  const handleFishEvolved = (fishType) => {
    const nextFishType = fishData[fishType].nextFish;
    setFishData(prev => ({
      ...prev,
      [fishType]: {
        ...prev[fishType],
        evolved: true
      },
      ...(nextFishType ? {
        [nextFishType]: {
          ...prev[nextFishType],
          unlocked: true
        }
      } : {})
    }));
    setCurrentFish(null);
    setFishFood(0);
  };

  React.useEffect(() => {
    if (gameCanvasRef.current) {
      gameCanvasRef.current.callbacks.onFishEvolved = handleFishEvolved;
    }
  }, [gameCanvasRef.current]);

  const handleBuyFish = (fishType) => {
    const selectedFish = fishData[fishType];
    if (score >= selectedFish.cost && selectedFish.unlocked) {
      audioManager.playStoreBuy();
      const newScore = score - selectedFish.cost;
      setScore(newScore);
      
      if (gameCanvasRef.current) {
        gameCanvasRef.current.updateScore(newScore);
        gameCanvasRef.current.purchaseFish(fishType);
      }
      
      setCurrentFish(fishType);
      setFishFood(0); // Reset food count for new fish
      addTime(selectedFish.cost / 10);
    }
  };

  const handleBuyFood = () => {
    const foodCost = 50;
    const newFoodCount = fishFood;
    const currentFishData = fishData[currentFish];
    if (score >= foodCost && currentFish && newFoodCount <= currentFishData.maxFood) {
      audioManager.playStoreBuy();
      const newScore = score - foodCost;
      setScore(newScore);
      
      if (gameCanvasRef.current) {
        gameCanvasRef.current.updateScore(newScore);
        gameCanvasRef.current.feedFish(currentFish);
      }
      
      const newFoodCount = fishFood + 1;
      setFishFood(newFoodCount);
      addTime(foodCost / 10);
      if (newFoodCount >= currentFishData.maxFood) {
        console.log('Fish ready for evolution! Click the fish to evolve.');
      }
    }
  };

  const canBuyFood = () => {
    if (!currentFish) return false;
    if (fishFood >= fishData[currentFish].maxFood) return false;
    if (score < 50) return false;
    return true;
  };

  const renderFishButton = (fishType) => {
    const fishInfo = fishData[fishType];
    const canBuy = score >= fishInfo.cost && fishInfo.unlocked;
    const isCurrentFish = currentFish === fishType;
    
    // Don't render if fish isn't unlocked or has evolved
    if (!fishInfo.unlocked || fishInfo.evolved) {
      return null;
    }

    return (
      <View style={styles.fishButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.fishButton,
            canBuy ? styles.buttonEnabled : styles.buttonDisabled,
            isCurrentFish && styles.buttonCurrent
          ]}
          onPress={() => handleBuyFish(fishType)}
          disabled={!canBuy || isCurrentFish}
        >
          <Image 
            source={fishImages[fishType]} 
            style={[
              styles.fishImage,
              !canBuy && styles.fishImageDisabled,
              isCurrentFish && styles.fishImageCurrent
            ]} 
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.fishCost}>
          {fishInfo.name} ({fishInfo.cost})
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SHOP</Text>
      
      <View style={styles.fishGrid}>
        {renderFishButton("fishyBoi")}
        {renderFishButton("speedy")}
        {renderFishButton("bigFish")}
        {renderFishButton("clownFish")}
        {renderFishButton("sunFish")}
      </View>

      {/* Fish Food Button */}
      {canBuyFood() && (
        <TouchableOpacity 
          style={[
            styles.button,
            styles.buttonEnabled
          ]}
          onPress={handleBuyFood}
        >
          <Text style={styles.buttonText}>
            Fish Food (50) - {fishFood}/{currentFish ? fishData[currentFish].maxFood : 0}
          </Text>
        </TouchableOpacity>
      )}

      {/* Current Fish Status */}
      {currentFish && (
        <View>
          <Text style={styles.status}>
            Current Fish: {fishData[currentFish].name}
          </Text>
          {fishFood >= fishData[currentFish].maxFood && (
            <Text style={styles.evolveHint}>
              Click the fish to evolve!
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(230, 230, 230, 0.9)',
    padding: 10,
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  fishGrid: {
    marginBottom: 20,
  },
  fishButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fishButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  fishImage: {
    width: '1000%',
    height: '1000%',
    opacity: 1,
  },
  fishImageDisabled: {
    opacity: 0.5,
  },
  fishImageCurrent: {
    opacity: 0.7,
  },
  fishCost: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  buttonEnabled: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)', // Semi-transparent green
  },
  buttonDisabled: {
    backgroundColor: 'rgba(204, 204, 204, 0.3)', // Semi-transparent gray
  },
  buttonCurrent: {
    backgroundColor: 'rgba(102, 102, 102, 0.3)', // Semi-transparent dark gray
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#333',
    textAlign: 'center',
  },
  status: {
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  evolveHint: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
}); 