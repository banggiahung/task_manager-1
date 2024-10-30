import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, Button,TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Theme from '../../configs/color';
import { useNavigation } from '@react-navigation/native';
import {clearData} from '../../configs/asyncStorage';

function Profile() {
  const [userData, setUserData] = useState({
    fullName: 'Nguyễn Văn A',
    phoneNumber: '0123456789',
    role: 'Quản trị viên',
    avatar: 'https://i.pravatar.cc/150',
  });

  const navigation = useNavigation()

  const handleLogOut = async () => {
    await clearData();  
    navigation.navigate("Login");  
  };

  useEffect(() => {}, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{uri: userData.avatar}} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Họ tên:</Text>
          <Text style={styles.value}>{userData.fullName}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Số điện thoại:</Text>
          <Text style={styles.value}>{userData.phoneNumber}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Vai trò:</Text>
          <Text style={styles.value}>{userData.role}</Text>
        </View>
        <View style={styles.containerButton}>
            <TouchableOpacity style={styles.button} onPress={handleLogOut}>
              <Text style={styles.buttonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Theme.primary,
  },
  profileContainer: {
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1, 
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%', 
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    padding: 12,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Bóng đổ cho Android
    shadowColor: '#000', // Bóng đổ cho iOS
    shadowOffset: {width: 0, height: 2}, // Độ lệch của bóng
    shadowOpacity: 0.3, // Độ mờ của bóng
    shadowRadius: 4, // Bán kính mờ của bóng
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Profile;
