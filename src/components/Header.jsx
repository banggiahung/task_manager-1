import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {getData} from '../configs/asyncStorage';
function Header({title}) {
  const navigation = useNavigation();
  const handleNavigate = () => {
    navigation.navigate('Profile');
  };
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        // Lấy dữ liệu avatar từ AsyncStorage
        const avatarPath = await getData('avatar');
        console.log('Avatar path fetched:', avatarPath); 
        if(avatarPath){
          const cleanedAvatarPath = avatarPath
          ? avatarPath.replace(/"/g, '')
          : null;
          if (cleanedAvatarPath) {
            setAvatar(cleanedAvatarPath);
          } else {
            console.warn('No avatar found in AsyncStorage');
          }
        }
        // Xóa dấu nháy nếu có
      
        // Nếu có giá trị, thiết lập avatar
      
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };
    fetchUserAvatar();
  }, []);
  const avatarSource =
  avatar && avatar.trim() !== '' && avatar !== 'null'
    ? avatar.startsWith('https://gigiapi.gigi.io.vn/')
      ? {uri: avatar}
      : {uri: `https://gigiapi.gigi.io.vn/${avatar}`}
    : {uri: 'https://i.pravatar.cc/300'};

  return (
    <View style={styles.container}>
      {avatar && (
        <>
          <View>
            <Text style={styles.title}>{title}</Text>
          </View>

          <TouchableOpacity onPress={handleNavigate}>
            <Image source={avatarSource} style={styles.avatar} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    margin: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 48,
  },
});

export default Header;
