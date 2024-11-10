import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import axiosInstance from '../../configs/axios';
import Toast from 'react-native-toast-message';
import moment from 'moment-timezone';
import LinearGradient from 'react-native-linear-gradient';

export default function AppConfig() {
  const [config, setConfig] = useState([]);
  const [notification, setNotification] = useState({});
  const [zaloNotification, setZaloNotification] = useState({});
  const getListConfig = async () => {
    try {
      const response = await axiosInstance.get('/admin/get-config');
      setConfig(response.data.data);
      const newData = response.data.data;
      setNotification(newData[0]);
      setZaloNotification(newData[1]);
      console.log('Notification Data:', newData[0]);
      console.log('Zalo Notification Data:', newData[1]);
    } catch {
      console.log('Co loi xay ra');
    }
  };
  useEffect(() => {
    getListConfig();
  }, []);
  const setTimeMain = async () => {
    const formData = new FormData();
    formData.append('TimeSet', notification.valueMain);
    formData.append('TimeEnd', notification.valueEnd);
    console.log(notification);
    try {
      const response = await axiosInstance.post('admin/set-time-noti', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.code == 200) {
        Toast.show({
          type: 'success',
          text1: `Set thành công`,
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Có lỗi xảy ra',
          text2: response.data.message,
          text2Style: {
            fontWeight: '700',
            color: 'black',
          },
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra',
        text2: 'Vui lòng kiểm tra các trường',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      console.error('Error during registration:', error);
    }
  };
  const setTimeZalo = async () => {
    const formData = new FormData();
    formData.append('TimeSet', zaloNotification.valueMain);
    formData.append('TimeEnd', zaloNotification.valueEnd);
    try {
      const response = await axiosInstance.post('admin/set-time-zalo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.code == 200) {
        Toast.show({
          type: 'success',
          text1: `Set thành công`,
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Có lỗi xảy ra',
          text2: response.data.message,
          text2Style: {
            fontWeight: '700',
            color: 'black',
          },
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra',
        text2: 'Vui lòng kiểm tra các trường',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      console.error('Error during registration:', error);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {notification && (
        <View>
          <View style={styles.containerText}>
            <Text style={styles.text}>Set thời gian thông báo nhiệm vụ</Text>
          </View>
          <View style={styles.row}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Thời gian thông báo (Phút)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="numeric"
                  value={notification.valueMain}
                  onChangeText={text =>
                    setNotification(prevTask => ({
                      ...prevTask,
                      valueMain: text,
                    }))
                  }
                />
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Giờ kết thúc </Text>
                <TextInput
                  style={styles.input}
                  placeholder="20:00"
                  keyboardType="default"
                  value={notification.valueEnd}
                  onChangeText={text =>
                    setNotification(prevTask => ({
                      ...prevTask,
                      valueEnd: text,
                    }))
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View>
            <TouchableOpacity onPress={setTimeMain}>
              <LinearGradient
                colors={['#6A00F4', '#AE47F1']}
                style={styles.saveButton}>
                <Text style={styles.buttonTextMain}>Xác nhận</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {zaloNotification && (
        <View>
          <View style={styles.containerText}>
            <Text style={styles.text}>Set thời gian thông báo zalo</Text>
          </View>
          <View style={styles.row}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Thông báo cách mấy ngày</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="numeric"
                  value={zaloNotification.valueMain}
                  onChangeText={text =>
                    setZaloNotification(prevTask => ({
                      ...prevTask,
                      valueMain: text,
                    }))
                  }
                />
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Bao nhiêu phút(/lần) </Text>
                <TextInput
                  style={styles.input}
                  placeholder="20"
                  keyboardType="numeric"
                  value={zaloNotification.valueEnd}
                  onChangeText={text =>
                    setZaloNotification(prevTask => ({
                      ...prevTask,
                      valueEnd: text,
                    }))
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View>
            <TouchableOpacity onPress={setTimeZalo}>
              <LinearGradient
                colors={['#6A00F4', '#AE47F1']}
                style={styles.saveButton}>
                <Text style={styles.buttonTextMain}>Xác nhận</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Toast/>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  saveButton: {
    backgroundColor: '#6A00F4',
    paddingVertical: 19,
    paddingHorizontal: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 16,
  },
  buttonTextMain: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  containerText: {
    flex: 1,
    justifyContent: 'center', // Centers vertically
    alignItems: 'center', // Centers horizontally
    marginBottom: 12,
  },
  text: {
    fontSize: 18,
    textAlign: 'center', // Centers text within the Text component
    textDecorationLine: 'underline', // Applies the underline style
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#BFC8E8',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 8,
    paddingRight: 4,
    borderRadius: 5,
  },
});
