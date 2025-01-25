import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const WinScreen = ({ score, timeElapsed, onPlayAgain, onQuit }) => {
    // Convert time elapsed to minutes and seconds
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Victory!</Text>
                <Text style={styles.subtitle}>You've mastered the aquarium!</Text>
                
                <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                        <Image 
                            source={require('../assets/coin.png')} 
                            style={styles.icon}
                        />
                        <Text style={styles.statText}>Final Score: {score}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statText}>
                            Time: {minutes}m {seconds}s
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={onPlayAgain}
                    >
                        <Text style={styles.buttonText}>Play Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, styles.quitButton]} 
                        onPress={onQuit}
                    >
                        <Text style={styles.buttonText}>Main Menu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    content: {
        backgroundColor: '#89CFF0',
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
        width: '80%',
        maxWidth: 400,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1434A4',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 24,
        color: '#1434A4',
        marginBottom: 20,
    },
    statsContainer: {
        width: '100%',
        marginBottom: 20,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    statText: {
        fontSize: 24,
        color: '#1434A4',
        marginLeft: 10,
    },
    icon: {
        width: 24,
        height: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#1434A4',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 10,
        minWidth: 120,
        alignItems: 'center',
    },
    quitButton: {
        backgroundColor: '#FF4444',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default WinScreen; 