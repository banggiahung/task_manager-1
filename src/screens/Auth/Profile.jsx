import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Theme from '../../configs/color';
import {useNavigation} from '@react-navigation/native';
import {clearData} from '../../configs/asyncStorage';
import {getData} from '../../configs/asyncStorage';
import axiosInstance from '../../configs/axios';
import Loading from '../../components/Loading';
import Toast from 'react-native-toast-message';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';

function Profile() {
  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [tasksHoanThanh, setTasksHoanThanh] = useState(0);
  const [tasksRoiLich, setTasksRoiLich] = useState(0);
  const [kpi, setKpi] = useState(0);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    fullName: '',
    role: '',
    avatar: null,
  });

  const navigation = useNavigation();

  const handleLogOut = async () => {
    await clearData();
    navigation.navigate('Login');
  };
  const sendUserID = async () => {
    try {
      const userId = await getData('userId');

      const response = await axiosInstance.post(
        '/get-thong-ke',
        JSON.stringify(userId.replace(/"/g, '')),
        {
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json',
          },
        },
      );
      const newData = response.data;
      console.log(newData);
      if (newData.daHoanThanh > 0) {
        setTasksHoanThanh(newData.daHoanThanh);
      }
      if (newData.roiLich > 0) {
        setTasksRoiLich(newData.roiLich);
      }
      if (newData.kpiUser > 0) {
        setKpi(newData.kpiUser);
      }
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error sending UserID:', error);
    }
  };
  const handleImagePick = async () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setLoading(true)

        try {
          const base64String = await RNFS.readFile(uri, 'base64');
          const userId = await getData('userId');
          const formData = new FormData();
        formData.append(`UserID`, userId.replace(/"/g, ''));
        formData.append(`avatar`, `data:image/jpeg;base64,${base64String}`);
        const response = await axiosInstance.post('/tao-tai-khoan', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setLoading(false)
        if (response.code === 400) {
          Toast.show({
            type: 'error',
            text1: response.message,
            text2: response.data,
            text2Style: {fontWeight: '700', color: 'black'},
            visibilityTime: 3000,
          });
        } else {
          setUserData(prevState => ({
            ...prevState,
            avatar: response.data.data,
            
          }));
          Toast.show({
            type: 'success',
            text1: 'Thành công',
          });
        }

          
          
         
        } catch (error) {
        setLoading(false)

          Toast.show({
            type: 'error',
            text1: 'Thất bại',
            text2: 'Đã có lỗi xảy ra',
            text2Style: {fontWeight: '700', color: 'black'},
            visibilityTime: 3000,
          });
          console.error('Error converting image to Base64:', error);
        }
      }
    });
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy dữ liệu từ AsyncStorage
        const avatarPath = await getData('avatar');
        const fullNamePath = await getData('fullName');
        const role = await getData('role');
        console.log(role);
        const cleanedAvatarPath = avatarPath
          ? avatarPath.replace(/"/g, '')
          : null;

        if (cleanedAvatarPath) {
          setAvatar(cleanedAvatarPath);
          setUserData(prevState => ({
            ...prevState,
            avatar: cleanedAvatarPath,
            fullName: fullNamePath || '',
            role: role,
          }));
        } else {
          console.warn('No avatar found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
    sendUserID();
  }, [kpi, tasksHoanThanh, tasksRoiLich]);

  const avatarSource =
    avatar && avatar.trim() !== ''
      ? avatar.startsWith('https://gigiapi.gigi.io.vn/')
        ? {uri: avatar}
        : {uri: `https://gigiapi.gigi.io.vn/${avatar}`}
      : {uri: 'https://i.pravatar.cc/300'};
      if (loading) {
        return <Loading />;
      }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        {avatar && (
          <>
            <View style={styles.row}>
              <TouchableOpacity onPress={handleImagePick}>
              <Image source={avatarSource} style={styles.avatar} />

              </TouchableOpacity>
              <View>
                <Text style={styles.text}>
                  KPI:
                   {tasksHoanThanh > 0 ? tasksHoanThanh.length : '0'}/{kpi}{' '}
                  {kpi > 0
                    ? `(${Math.round((tasksHoanThanh / kpi) * 100)}%)`
                    : '(Chưa có KPI)'}
                </Text>
              </View>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Họ tên:</Text>
              <Text style={styles.value}>
                {userData.fullName.replace(/"/g, '')}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Vai trò:</Text>
              <Text style={styles.value}>
                {userData.role
                  .replaceAll('[', '')
                  .replaceAll(']', '')
                  .replaceAll('"', '')
                  .replaceAll('\\', '')}
              </Text>
            </View>
            <View style={styles.containerButton}>
              <TouchableOpacity style={styles.button} onPress={handleLogOut}>
                <Text style={styles.buttonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      <Toast />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: 700,
  },
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
