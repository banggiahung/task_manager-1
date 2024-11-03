import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import Theme from '../../configs/color';
import axiosInstance from '../../configs/axios';
import {storeData, getData} from '../../configs/asyncStorage';
import Loading from '../../components/Loading';

export default function Login() {
  const {height} = Dimensions.get('window');
  const navigation = useNavigation();

  const [userData, setUserData] = useState({
    userName: '',
    password: '',
    fcmToken: '',
    rememberMe: true,
  });

  const [error, setError] = useState('');

  const HandelChange = useCallback((key, value) => {
    setUserData(prevData => ({
      ...prevData,
      [key]: value,
    }));
  }, []);
  const [loading, setLoading] = useState(false);
  const HandleLogin = useCallback(() => {
    if (!userData.userName || !userData.password) {
      setError('Vui lòng nhập tài khoản và mật khẩu');
      return;
    }

    setLoading(true);
    axiosInstance
      .post('/login', userData)
      .then(res => {
        setLoading(false);
        const res_data = res.data;
        console.log(res_data);
        if (res_data.code === 200) {
          storeData('token', res_data.token);
          storeData('refreshToken', res_data.refreshToken);
          storeData('userId', res_data.userId);
          storeData('avatar', res_data.avatar);
          storeData('fullName', res_data.fullName);
          storeData('fcm', res_data.fcmToken);
          storeData('role', JSON.stringify(res_data.role));
          console.log(userData.fcmToken);
          if (res_data.role.includes('Admin')) {
            navigation.navigate('Main', {screen: 'Dashboard'});
          } else {
            navigation.navigate('Home');
          }
        } else {
          setLoading(false);

          setError('Đăng nhập không thành công');
        }
      })
      .catch(err => {
        setLoading(false);

        console.log(err);
        setError('Tài khoản hoặc mật khẩu không đúng');
      });
  }, [userData, navigation]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getData('userId');
      const role = await getData('role');
      const fcm = await getData('fcm');
      const cleanedToken = fcm.replace(/["\\]/g, '');
      console.log(cleanedToken);

      setUserData(prevState => ({
        ...prevState,
        fcmToken: cleanedToken || '',
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

  if (loading) {
    return <Loading />;
  }
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#5440F6'}}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: height * 0.2,
        }}>
        <View style={styles.shadowContainer}>
          <FastImage
            source={require('../../assets/bglog.png')}
            style={{width: '100%', height: '80%'}}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
            
          }}
          >
          <Image
            source={{uri: 'https://gigiapi.gigi.io.vn/gigi-logo.png'}}
            style={{
              width: 100, 
              height: 100, 
              marginBottom: 20, 
            }}
            resizeMode="contain"
          />
          <View style={{
            width: '100%',
            flex: 1,
            alignItems: 'center',
            height: 100
          }}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tài khoản</Text>
                <TextInput
                  placeholder="Nhập tài khoản"
                  style={styles.input}
                  value={userData.userName}
                  onChangeText={value => HandelChange('userName', value)}
                />
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                  placeholder="Nhập mật khẩu"
                  secureTextEntry
                  style={styles.input}
                  value={userData.password}
                  onChangeText={value => HandelChange('password', value)}
                />
              </View>
            </TouchableWithoutFeedback>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.loginButton} onPress={HandleLogin}>
              <Text style={styles.buttonText}>Đăng nhập</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 50, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Chào mừng các nhân viên của GiGi Academy!
        </Text>
        <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
          Hãy đăng nhập để trải nghiệm đầy đủ các tính năng.
        </Text>
      </View>
          </View>
          
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    width: '80%',
    paddingHorizontal: 10,
    marginBottom: 15,
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
    width: '60%',
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBBF24',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },

  label: {
    color: '#4B5563',
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    borderRadius: 16,
    marginBottom: 16,
  },
});
