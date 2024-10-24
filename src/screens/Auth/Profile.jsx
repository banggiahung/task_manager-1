import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, Button} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Theme from '../../configs/color';
import { useNavigation } from '@react-navigation/native';

function Profile() {
  const [userData, setUserData] = useState({
    fullName: 'Nguyễn Văn A',
    phoneNumber: '0123456789',
    role: 'Quản trị viên',
    avatar: 'https://i.pravatar.cc/150',
  });

  const navigation = useNavigation()

  const handleLogOut = ()=>{
    navigation.navigate("Login")
  }

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

        <View>
          <Button onPress={handleLogOut} title="Dang xuat"></Button>
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
});

export default Profile;
