import React, {useState, useCallback, useEffect} from 'react';

import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axiosInstance from '../../configs/axios';
import {storeData, getData} from '../../configs/asyncStorage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

const Registration = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    UserName: '',
    FullName: '',
    KPIUser: '',
    PasswordHash: '',
    ConfirmPassword: '',
  });

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append('UserName', formData.UserName);
    data.append('FullName', formData.FullName);
    data.append('KPIUser', parseInt(formData.KPIUser, 10));
    data.append('PasswordHash', formData.PasswordHash);
    data.append('ConfirmPassword', formData.ConfirmPassword);
    data.append('FCMToken', formData.FCMToken);

    try {
      const response = await axiosInstance.post('/dang-ky', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');

    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Error', 'Registration failed!');
    }
  };
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getData('userId');
      const role = await getData('role');
      const fcm = await getData('fcm');
      const cleanedToken = fcm.replace(/["\\]/g, '');
      setFormData(prevState => ({
        ...prevState,
        FCMToken: cleanedToken || '',
      }));
      if (id) {
        console.log('đã có id rồi', id);
        if (role.includes('Admin')) {
          navigation.navigate('Main', {screen: 'Dashboard'});
        } else {
          navigation.navigate('Home');
        }
        setUserId(id);
      } else {
        console.log('Không tìm thấy userId');
      }
    };

    fetchUserId(); // Gọi hàm fetchUserId
  }, []);
  return (
    <View style={styles.container}>
      {[
        { key: 'UserName', label: 'User Name' },
        { key: 'FullName', label: 'Full Name' },
        { key: 'KPIUser', label: 'KPI User (integer)' },
        { key: 'PasswordHash', label: 'Password', secureTextEntry: true },
        { key: 'ConfirmPassword', label: 'Confirm Password', secureTextEntry: true },
      ].map(field => (
        <View key={field.key} style={styles.inputContainer}>
          <Text>{field.label}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={field.secureTextEntry}
            placeholder={`Enter ${field.label}`}
            value={formData[field.key]}
            onChangeText={value => handleInputChange(field.key, value)}
          />
        </View>
      ))}
      <Button title="Register" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default Registration;
