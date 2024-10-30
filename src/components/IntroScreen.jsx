// src/screens/IntroScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {storeData, getData} from '../configs/asyncStorage';

const IntroScreen = () => {
  const logoTranslateX = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const sloganTranslateX = useRef(new Animated.Value(-Dimensions.get('window').width)).current;
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await getData('userId'); // Lấy userId từ AsyncStorage
      const role = await getData('role');

      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoTranslateX, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(sloganTranslateX, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000),
        Animated.parallel([
          Animated.timing(logoTranslateX, {
            toValue: Dimensions.get('window').width,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(sloganTranslateX, {
            toValue: -Dimensions.get('window').width,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (userId) {
          if (role.includes('Admin')) {
              navigation.replace('Main', {screen: 'Dashboard'});
            } else {
              navigation.replace('Home');
            }
        } else {
          navigation.replace('Login');
        }
        
      });
    };

    checkLoginStatus(); 
  }, [logoTranslateX, sloganTranslateX, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ translateX: logoTranslateX }] }]}>
        <Image source={require('../assets/logo-gigi.jpeg')} style={styles.logo} />
      </Animated.View>
      <Animated.View style={[styles.sloganContainer, { transform: [{ translateX: sloganTranslateX }] }]}>
        <Text style={styles.slogan}>Chạy deadline đi!!!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: '40%',
  },
  logo: {
    width: 120, // Điều chỉnh kích thước logo
    height: 120,
    resizeMode: 'contain',
  },
  sloganContainer: {
    position: 'absolute',
    top: '50%',
  },
  slogan: {
    fontSize: 20,
    fontStyle: 'italic',
    color: '#555555',
  },
});

export default IntroScreen;
