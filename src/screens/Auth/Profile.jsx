import React, {useEffect, useState, Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ImageBackground,
  ScrollView,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Theme from '../../configs/color';
import {useNavigation} from '@react-navigation/native';
import {clearData} from '../../configs/asyncStorage';
import {getData, storeData} from '../../configs/asyncStorage';
import axiosInstance from '../../configs/axios';
import Loading from '../../components/Loading';
import Toast from 'react-native-toast-message';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import image from '../../assets/background.png';
import LinearGradient from 'react-native-linear-gradient';

function Profile() {
  const [isModalVisible, setModalVisible] = useState(false);

  const [avatar, setAvatar] = useState(null);
  const [avatarBia, setAvatarBia] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [tasksHoanThanh, setTasksHoanThanh] = useState(0);
  const [tasksRoiLich, setTasksRoiLich] = useState(0);
  const [kpi, setKpi] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [userData, setUserData] = useState({
    fullName: '',
    role: '',
    avatar: null,
    anhBia: null,
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
      if (newData.daHoanThanh > 0) {
        setTasksHoanThanh(newData.daHoanThanh);
      }
      if (newData.roiLich > 0) {
        setTasksRoiLich(newData.roiLich);
      }
      if (newData.kpiUser > 0) {
        setKpi(newData.kpiUser);
      }
    } catch (error) {
      console.error('Error sending UserID:', error);
    }
  };
  const handleImagePick = async () => {
    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setLoading(true);

        try {
          const base64String = await RNFS.readFile(uri, 'base64');
          const userId = await getData('userId');
          const formData = new FormData();
          formData.append(`UserID`, userId.replace(/"/g, ''));
          formData.append(`avatar`, `data:image/jpeg;base64,${base64String}`);
          const response = await axiosInstance.post(
            '/upload-image-avatar',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          );
          setLoading(false);
          if (response.code === 400) {
            Toast.show({
              type: 'error',
              text1: response.message,
              text2: response.data,
              text2Style: {fontWeight: '700', color: 'black'},
              visibilityTime: 3000,
            });
          } else {
            setAvatar(response.data.data);
            storeData('avatar', response.data.data);

            console.log(response.data.data);
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
          setLoading(false);

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
  const handleImagePickProfile = async () => {
    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setLoading(true);

        try {
          const base64String = await RNFS.readFile(uri, 'base64');
          const userId = await getData('userId');
          const formData = new FormData();
          formData.append(`UserID`, userId.replace(/"/g, ''));
          formData.append(`avatar`, `data:image/jpeg;base64,${base64String}`);
          const response = await axiosInstance.post(
            '/upload-image-profile',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          );
          setLoading(false);
          if (response.code === 400) {
            Toast.show({
              type: 'error',
              text1: response.message,
              text2: response.data,
              text2Style: {fontWeight: '700', color: 'black'},
              visibilityTime: 3000,
            });
          } else {
            setAvatarBia(response.data.data);
            storeData('anhBia', response.data.data);

            console.log(response.data.data);
            setUserData(prevState => ({
              ...prevState,
              anhBia: response.data.data,
            }));
            Toast.show({
              type: 'success',
              text1: 'Thành công',
            });
          }
        } catch (error) {
          setLoading(false);

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
        let avatarPath = await getData('avatar');
        let anhBiaPath = await getData('anhBia');
        const userId = await getData('userId');
        console.log(avatarPath);
        if (!avatarPath || avatarPath == 'null') {
          const response = await axiosInstance.get(
            `get-deatils-user?UserID=${userId.replace(/"/g, '')}`,
          );
          if (response.data.code == 200) {
            storeData('avatar', response.data.data.avatar);

            avatarPath = response.data.data.avatar;
          }
        }
        if (!anhBiaPath || anhBiaPath == 'null') {
          const response = await axiosInstance.get(
            `get-deatils-user?UserID=${userId.replace(/"/g, '')}`,
          );
          if (response.data.code == 200) {
            storeData('anhBia', response.data.data.profileAvatar);

            anhBiaPath = response.data.data.profileAvatar;
          }
        }

        const fullNamePath = await getData('fullName');
        const role = await getData('role');
        console.log(role);
        const cleanedAvatarPath = avatarPath
          ? avatarPath.replace(/"/g, '')
          : null;
        const cleanedAnhBiaPath = anhBiaPath
          ? anhBiaPath.replace(/"/g, '')
          : null;

        if (cleanedAvatarPath) {
          setAvatar(cleanedAvatarPath);
          setUserData(prevState => ({
            ...prevState,
            avatar: cleanedAvatarPath,
            fullName: fullNamePath || '',
            role: role,
            anhBia: cleanedAnhBiaPath,
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
  }, [kpi, tasksHoanThanh, tasksRoiLich, avatar]);

  const avatarSource =
    avatar && avatar.trim() !== '' && avatar !== 'null'
      ? avatar.startsWith('https://gigiapi.gigi.io.vn/')
        ? {uri: avatar}
        : {uri: `https://gigiapi.gigi.io.vn/${avatar}`}
      : {uri: 'https://i.pravatar.cc/300'};
  console.log(avatar);
  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handlePasswordChange = async () => {
    // Logic xử lý đổi mật khẩu
    console.log('Mật khẩu mới:', newPassword);
    if (newPassword.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Mật khẩu lỗi',
        text2: 'Mật khẩu phải lớn hơn 8 ký tự',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      setLoading(false);

      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('UserID', userId.replace(/"/g, ''));
    formData.append('NewPassword', newPassword);
    try {
      const response = await axiosInstance.post(
        '/change-password-user',
        formData,
        {
          headers: {
            Accept: '*/*',
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Response:', response.data);
      if (response.data.code == 200) {
        setLoading(false);
        setModalVisible(false);

        Toast.show({
          type: 'success',
          text1: 'Đã đổi thành công',
          visibilityTime: 2000,
        });
      } else {
        setLoading(false);

        Toast.show({
          type: 'error',
          text1: 'Xảy ra lỗi',
          text2: response.data.message,
          text2Style: {
            fontWeight: '700',
            color: 'black',
          },
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      setLoading(false);

      Toast.show({
        type: 'error',
        text1: ' Đã xảy ra lỗi',
        text2: ' Đã xảy ra lỗi',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
    }
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <SafeAreaView style={{flex: 1}} edges={['left', 'right', 'bottom']}>
      {userData && (
        <>
          <View style={styles.container}>
            <TouchableOpacity onPress={handleImagePickProfile}>
            <ImageBackground
              source={{uri: userData.anhBia}} // Set the background image here
              style={styles.header} // Apply styles for the header
            >
              {/* <Text style={styles.name}>Welcome</Text>
              <Text style={styles.userInfo}>
                {' '}
                {userData.fullName.replace(/"/g, '')}
              </Text> */}
            </ImageBackground>
            </TouchableOpacity>
           
            {/* <View style={styles.header}>
             
            </View> */}
            <TouchableOpacity
              style={styles.avatarBase}
              onPress={handleImagePick}>
              <Image style={styles.avatar} source={avatarSource} />
            </TouchableOpacity>
            <View style={styles.body}>
              <ScrollView contentContainerStyle={styles.bodyContent}>
                <View style={styles.containerRow}>
                  <TouchableOpacity style={styles.w100}>
                    <LinearGradient
                      colors={['#ff7e5f', '#feb47b']}
                      style={styles.square}>
                      <Text style={styles.text}>
                        Nhân viên:{' '}
                        {userData?.fullName.replace(/"/g, '') ||
                          'Nhân viên không tên'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.w100}>
                    <LinearGradient
                      colors={['#86e3ce', '#91eae4']}
                      style={styles.square}>
                      <Text style={styles.text}>KPI: {kpi}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.w100}>
                    <LinearGradient
                      colors={['#6a11cb', '#2575fc']}
                      style={styles.square}>
                      <Text style={styles.text}>Task hoàn thành</Text>

                      <Text style={styles.text}>
                        {tasksHoanThanh > 0 ? tasksHoanThanh.length : '0'}/{kpi}
                      </Text>
                      <Text style={styles.text}>
                        {kpi > 0
                          ? `(${Math.round((tasksHoanThanh / kpi) * 100)}%)`
                          : '(Chưa có KPI)'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.w100}>
                    <LinearGradient
                      colors={['#ff6a00', '#ee0979']}
                      style={styles.square}>
                      <Text style={styles.text}>Task rời lịch</Text>

                      <Text style={styles.text}>
                        {tasksRoiLich > 0 ? tasksRoiLich : '0'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.w100}
                    onPress={handleOpenModal}>
                    <LinearGradient
                      colors={['#4facfe', '#00f2fe']}
                      style={styles.square}>
                      <Text style={styles.text}>Đổi mật khẩu</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.w100} onPress={handleLogOut}>
                    <LinearGradient
                      colors={['#fbc2eb', '#a6c1ee']}
                      style={styles.square}>
                      <Text style={styles.text}>Đăng xuất</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleCloseModal}>
            <TouchableWithoutFeedback onPress={handleCloseModal}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu mới"
                    secureTextEntry={true}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handlePasswordChange}>
                    <Text style={styles.confirmText}>Xác nhận</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleCloseModal}>
                    <Text style={styles.cancelText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </>
      )}
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  containerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  w100: {
    width: '48%',
    marginVertical: 10,
  },
  square: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  container: {},
  containerSafe: {
    padding: 0,
    margin: 0,
  },
  name: {
    fontSize: 22,
    color: 'black',
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  userInfo: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#00BFFF',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBase: {
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 130,
  },
  avatar: {
    borderColor: 'white',

    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
  },
  name: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  body: {
    marginTop: 40,
  },
  bodyContent: {
    alignItems: 'center',
    padding: 30,
    height: 'auto',
  },
  name: {
    fontSize: 28,
    color: '#696969',
    fontWeight: '600',
  },
  info: {
    fontSize: 16,
    color: '#00BFFF',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#696969',
    marginTop: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
    backgroundColor: '#00BFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#4facfe',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#ff0000',
    marginTop: 10,
  },
});

export default Profile;
