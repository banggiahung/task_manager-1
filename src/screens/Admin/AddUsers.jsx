import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import axiosInstance from '../../configs/axios';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

function AddUsers() {
  const [users, setUsers] = useState([
    {
      fullName: '',
      userName: '',
      passwordHash: '',
      confirmPassword: '',
      kpiUser: '',
    },
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  useFocusEffect(
    React.useCallback(() => {
      // Reset dữ liệu khi màn hình được tải lại
      setUsers([
        {
          fullName: '',
          userName: '',
          passwordHash: '',
          confirmPassword: '',
          kpiUser: '',
        },
      ]);
      setCurrentIndex(0);
    }, []) // Chạy chỉ một lần khi component mount
  );
  const handleAddUserField = () => {
    setUsers([
      ...users,
      {
        fullName: '',
        userName: '',
        passwordHash: '',
        confirmPassword: '',
        kpiUser: '',
      },
    ]);
  };

  const handleInputChange = (field, value) => {
    const updatedUsers = [...users];
    updatedUsers[currentIndex][field] = value;
    setUsers(updatedUsers);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  const handleAdd = () => {
    handleAddUserField();
    setCurrentIndex(users.length);
  };

  const handleConfirm = async () => {
    const data = users.map(user => ({
      fullName: user.fullName,
      userName: user.userName,
      passwordHash: user.passwordHash,
      confirmPassword: user.confirmPassword,
      kpiUser: user.kpiUser,
    }));
    for (const user of data) {
      if (
        !user.fullName ||
        !user.userName ||
        !user.passwordHash ||
        !user.confirmPassword ||
        !user.kpiUser
      ) {
        Toast.show({
          type: 'error',
          text1: 'Kiểm tra dữ liệu',
          text2: 'Tất cả các trường đều phải được điền đầy đủ.',
          text2Style: {
            fontWeight: 700,
            color: 'black',
          },
          visibilityTime: 3000,
        });
        return;
      }

      if (user.passwordHash.length < 8) {
        Toast.show({
          type: 'error',
          text1: 'Kiểm tra dữ liệu',
          text2: 'Mật khẩu phải lớn hơn 8 ký tự.',
          text2Style: {
            fontWeight: 700,
            color: 'black',
          },
          visibilityTime: 3000,
        });
        return;
      }

      if (user.passwordHash !== user.confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'Kiểm tra dữ liệu',
          text2: 'Mật khẩu và xác nhận mật khẩu không khớp.',
          text2Style: {
            fontWeight: 700,
            color: 'black',
          },
          visibilityTime: 3000,
        });
        return;
      }
    }
    try {
      const response = await axiosInstance.post('/tao-tai-khoan', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.code === 400) {
        Toast.show({
          type: 'error',
          text1: response.message,
          text2: response.data,
          text2Style: {
            fontWeight: 700,
            color: 'black',
          },
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Thất bại',
        text2: 'Đã có lỗi xảy ra',
        text2Style: {
          fontWeight: 700,
          color: 'black',
        },
        visibilityTime: 3000,
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Thêm nhân viên</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Họ tên:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập họ tên"
          value={users[currentIndex].fullName}
          onChangeText={text => handleInputChange('fullName', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tài khoản:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tài khoản"
          value={users[currentIndex].userName}
          onChangeText={text => handleInputChange('userName', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          value={users[currentIndex].passwordHash}
          onChangeText={text => handleInputChange('passwordHash', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nhập lại mật khẩu:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          value={users[currentIndex].confirmPassword}
          onChangeText={text => handleInputChange('confirmPassword', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>KPI của nhân viên:</Text>
        <TextInput
          style={styles.input}
          placeholder="KPI của nhân viên"
          value={users[currentIndex].kpiUser}
          onChangeText={text => handleInputChange('kpiUser', text)}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}>
          <Text style={styles.buttonText}>Trước</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Thêm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            currentIndex === users.length - 1 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === users.length - 1}>
          <Text style={styles.buttonText}>Sau</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.buttonTextMain}>Xác nhận</Text>
      </TouchableOpacity>
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  confirmButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonTextMain: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddUsers;
