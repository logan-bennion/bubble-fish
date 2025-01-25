import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Shop({ score, setScore, fishFood, setFishFood, currentFish, setCurrentFish, addTime, gameCanvasRef }) {
  // Fish progression data - moved outside component to prevent resets
  const [fishData, setFishData] = React.useState({
    fishyBoi: {
      name: "Fishy Boi",
      cost: 50,
      requiredFood: 0,
      maxFood: 10,
      nextFish: "speedy",
      unlocked: true
    },
    speedy: {
      name: "Speedy",
      cost: 200,
      requiredFood: 10,
      maxFood: 10,
      nextFish: "bigFish",
      unlocked: false
    },
    bigFish: {
      name: "Big Fish",
      cost: 500,
      requiredFood: 10,
      maxFood: 10,
      nextFish: "clownFish",
      unlocked: false
    },
    clownFish: {
      name: "Clown Fish",
      cost: 750,
      requiredFood: 10,
      maxFood: 10,
      nextFish: "sunFish",
      unlocked: false
    },
    sunFish: {
      name: "Sun Fish",
      cost: 1000,
      requiredFood: 10,
      maxFood: 10,
      nextFish: null,
      unlocked: false
    }
  });

  // Handle fish evolution
  const handleFishEvolved = (fishType) => {
    const nextFishType = fishData[fishType].nextFish;
    if (nextFishType) {
      setFishData(prev => ({
        ...prev,
        [nextFishType]: {
          ...prev[nextFishType],
          unlocked: true
        }
      }));
    }
    setCurrentFish(null);  // Reset current fish after evolution
    setFishFood(0);        // Reset food count
  };

  React.useEffect(() => {
    if (gameCanvasRef.current) {
      gameCanvasRef.current.callbacks.onFishEvolved = handleFishEvolved;
    }
  }, [gameCanvasRef.current]);

  const handleBuyFish = (fishType) => {
    const selectedFish = fishData[fishType];
    if (score >= selectedFish.cost && selectedFish.unlocked) {
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
    
    // Don't render the button if the fish isn't unlocked
    if (!fishInfo.unlocked) {
      return null;
    }

    return (
      <TouchableOpacity 
        style={[
          styles.button,
          canBuy ? styles.buttonEnabled : styles.buttonDisabled,
          isCurrentFish && styles.buttonCurrent
        ]}
        onPress={() => handleBuyFish(fishType)}
        disabled={!canBuy || isCurrentFish}
      >
        <Text style={styles.buttonText}>
          {fishInfo.name} ({fishInfo.cost})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SHOP</Text>
      
      {/* Fish Buttons */}
      {renderFishButton("fishyBoi")}
      {renderFishButton("speedy")}
      {renderFishButton("bigFish")}
      {renderFishButton("clownFish")}
      {renderFishButton("sunFish")}

      {/* Fish Food Button - Only show if can buy food */}
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
    maxWidth: 250,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonEnabled: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
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
  buttonCurrent: {
    backgroundColor: '#666', // Darker color for current fish
    opacity: 0.7,
  }
}); 