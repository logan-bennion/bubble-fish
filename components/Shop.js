import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Shop({ score, setScore, fishFood, setFishFood, currentFish, setCurrentFish, addTime, gameCanvasRef }) {
  // Fish progression data
  const fish = {
    fishyBoi: {
      name: "Fishy Boi",
      cost: 50,
      requiredFood: 0,
      maxFood: 10,
      nextFish: "speedy"
    },
    speedy: {
      name: "Speedy",
      cost: 200,
      requiredFood: 10,
      maxFood: 10,
      nextFish: "bigFish"
    },
    bigFish: {
      name: "Big Fish",
      cost: 500,
      requiredFood: 10,
      maxFood: 10,
      nextFish: "goldenFish"
    },
    goldenFish: {
      name: "Golden Fish",
      cost: 1000,
      requiredFood: 10,
      maxFood: 10,
      nextFish: null
    }
  };

  const canBuyNextFish = (fishType) => {
    if (fishType === "fishyBoi") return true;
    
    const previousFish = getPreviousFish(fishType);
    console.log('Previous fish:', previousFish, 'Food count:', fishFood);
    return previousFish && fishFood >= fish[previousFish].maxFood;
  };

  const handleBuyFish = (fishType) => {
    const selectedFish = fish[fishType];
    if (score >= selectedFish.cost && canBuyNextFish(fishType)) {
      const newScore = score - selectedFish.cost;
      setScore(newScore);
      
      if (gameCanvasRef.current) {
        gameCanvasRef.current.updateScore(newScore);
        // Purchase the fish in the game engine
        gameCanvasRef.current.purchaseFish(fishType);
      }
      
      setCurrentFish(fishType);
      setFishFood(0); // Reset food count for new fish
      addTime(selectedFish.cost / 10);
    }
  };

  const handleBuyFood = () => {
    const foodCost = 50;
    if (score >= foodCost && currentFish) {
      const newScore = score - foodCost;
      setScore(newScore);
      
      if (gameCanvasRef.current) {
        gameCanvasRef.current.updateScore(newScore);
        // Feed the fish in the game engine
        gameCanvasRef.current.feedFish(currentFish);
      }
      
      const newFoodCount = fishFood + 1;
      setFishFood(newFoodCount);
      addTime(foodCost / 10);

      // Check if fish has reached max food
      const currentFishData = fish[currentFish];
      if (newFoodCount >= currentFishData.maxFood) {
        console.log('Fish reached max food:', currentFish);
      }
    }
  };

  const renderFishButton = (fishType) => {
    const fishData = fish[fishType];
    const canBuy = score >= fishData.cost && 
                   (!currentFish || currentFish === getPreviousFish(fishType)) && 
                   canBuyNextFish(fishType);

    return (
      <TouchableOpacity 
        style={[
          styles.button,
          canBuy ? styles.buttonEnabled : styles.buttonDisabled
        ]}
        onPress={() => canBuy && handleBuyFish(fishType)}
      >
        <Text style={styles.buttonText}>
          {fishData.name} ({fishData.cost})
          {!canBuy && currentFish && fish[currentFish].nextFish === fishType && 
            ` - Feed current fish ${fish[currentFish].maxFood - fishFood} more times`}
        </Text>
      </TouchableOpacity>
    );
  };

  const getPreviousFish = (fishType) => {
    for (const [key, value] of Object.entries(fish)) {
      if (value.nextFish === fishType) {
        return key;
      }
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SHOP</Text>
      
      {/* Fish Buttons */}
      {renderFishButton("fishyBoi")}
      {renderFishButton("speedy")}
      {renderFishButton("bigFish")}
      {renderFishButton("goldenFish")}

      {/* Fish Food Button */}
      <TouchableOpacity 
        style={[
          styles.button,
          currentFish && score >= 50 ? styles.buttonEnabled : styles.buttonDisabled
        ]}
        onPress={handleBuyFood}
      >
        <Text style={styles.buttonText}>
          Fish Food (50) - {fishFood}/{currentFish ? fish[currentFish].maxFood : 0}
          {currentFish && fishFood >= fish[currentFish].maxFood && 
            ' - Ready for next fish!'}
        </Text>
      </TouchableOpacity>

      {/* Current Fish Status */}
      {currentFish && (
        <View>
          <Text style={styles.status}>
            Current Fish: {fish[currentFish].name}
          </Text>
          {fishFood >= fish[currentFish].maxFood && fish[currentFish].nextFish && (
            <Text style={[styles.status, styles.evolveText]}>
              Ready to buy {fish[fish[currentFish].nextFish].name}!
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
  evolveText: {
    color: '#4CAF50',
    marginTop: 5,
  },
}); 