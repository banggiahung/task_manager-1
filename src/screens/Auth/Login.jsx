import React, { useState, useCallback } from "react";
import { View, Text, SafeAreaView, Dimensions, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import FastImage from 'react-native-fast-image';
import { useNavigation } from "@react-navigation/native";
import Theme from "../../configs/color";
import axiosInstance from '../../configs/axios';
import { storeData } from '../../configs/asyncStorage';

export default function Login() {
  const { height } = Dimensions.get('window');
  const navigation = useNavigation();

  const [userData, setUserData] = useState({
    userName: 'gigiadmin',
    password: 'gigiadmin123@',
    fcmToken: '',
    rememberMe: true,
  });

  const [error, setError] = useState('');

  const HandelChange = useCallback((key, value) => {
    setUserData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  }, []);

  const HandleLogin = useCallback(() => {
    if (!userData.userName || !userData.password) {
      setError('Vui lòng nhập tài khoản và mật khẩu');
      return;
    }

    console.log("Bấm login");
    axiosInstance.post('/login', userData)
      .then((res) => {
        const res_data = res.data;
        if (res_data.code === 200) {
          storeData('token', res_data.token);
          storeData('refreshToken', res_data.refreshToken);
          storeData('userId', res_data.userId);
          storeData('role', JSON.stringify(res_data.role));

          if (res_data.role.includes('Admin')) {
            navigation.navigate('Dashboard');
          } else {
            navigation.navigate('Home');
          }
        } else {
          setError('Đăng nhập không thành công');
        }
        
      })
      .catch((err) => {
        console.log(err);
        setError('Tài khoản hoặc mật khẩu không đúng');
      });
  }, [userData, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#5440F6" }}>
      <View style={{ justifyContent: 'center', alignItems: 'center', height: height * 0.4 }}>
        <View style={styles.shadowContainer}>
          <FastImage source={require('../../assets/bglog.png')} style={{ width: '100%', height: '100%' }} resizeMode={FastImage.resizeMode.contain} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 10}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tài khoản</Text>
            <TextInput
              placeholder="Nhập tài khoản"
              style={styles.input}
              value={userData.userName}
              onChangeText={(value) => HandelChange("userName", value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              placeholder="Nhập mật khẩu"
              secureTextEntry
              style={styles.input}
              value={userData.password}
              onChangeText={(value) => HandelChange("password", value)}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={HandleLogin}
          >
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  shadowContainer: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    width: '80%',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Theme.primary,
  },
  input: {
    height: 48,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: 'black',
  },
  errorContainer: {
    width: '100%',
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loginButton: {
    width: '80%',
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.primary,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
