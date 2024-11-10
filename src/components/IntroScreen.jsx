import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storeData, getData } from '../configs/asyncStorage';

const { width, height } = Dimensions.get('window'); // Lấy chiều rộng và chiều cao màn hình

const IntroScreen = () => {
  const logoTranslateX = useRef(new Animated.Value(width)).current;
  const sloganTranslateX = useRef(new Animated.Value(-width)).current;
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await getData('userId'); // Lấy userId từ AsyncStorage
      const role = await getData('role');

      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoTranslateX, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(sloganTranslateX, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(800),
        Animated.parallel([
          Animated.timing(logoTranslateX, {
            toValue: width,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(sloganTranslateX, {
            toValue: -width,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (userId) {
          if (role.includes('Admin')) {
            navigation.replace('Main', { screen: 'Dashboard' });
          } else {
            navigation.navigate('Client', {screen: 'Home'});

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
    top: height * 0.35, 
  },
  logo: {
    width: width * 0.4, 
    height: width * 0.4, 
    resizeMode: 'contain',
  },
  sloganContainer: {
    position: 'absolute',
    top: height * 0.5, // Điều chỉnh vị trí slogan để ở khoảng 50% chiều cao màn hình
  },
  slogan: {
    fontSize: width * 0.06, // Điều chỉnh kích thước chữ dựa trên chiều rộng màn hình
    fontStyle: 'italic',
    color: '#555555',
    textAlign: 'center', // Căn giữa slogan
  },
});

export default IntroScreen;


