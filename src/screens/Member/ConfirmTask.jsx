import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../configs/axios';
import moment from 'moment-timezone'; // Thay thế date-fns bằng moment
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {Swipeable, GestureHandlerRootView} from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';

export default function ConfirmTask() {
  const navigation = useNavigation();
  const route = useRoute();
  const taskID = route.params?.taskID;
  const userID = route.params?.userId;

  const [showRescheduleButton, setShowRescheduleButton] = useState(true);
  const [showConfirmButton, setShowConfirmButton] = useState(true);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState('');
  const [linkTask, setLinkTask] = useState('');

  const [showDuePicker, setShowDuePicker] = useState(false);

  const [selectedDueDate, setSelectedDueDate] = useState(new Date());

  const onDueDateChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedDueDate(selectedTime);
    }
  };
  const confirmDueDate = () => {
    
    setSelectedDueDate(selectedDueDate);
    setShowDuePicker(false);
  };
  const [taskData, setTaskData] = useState(null);
  const fetchData = async () => {
    const url = `/get-task-user?UserID=${userID}&TaskID=${taskID}`;
    try {
      const response = await axiosInstance.post(url);

      if (response.data.code == 200) {
        const newTaskData = response.data.data;
        setTaskData(newTaskData);
        console.log(newTaskData.taskHistory);

        if (newTaskData.taskHistory != null) {
          setLinkTask(newTaskData.taskHistory.linkHoanThanh);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleReschedule = () => {
    setShowReasonInput(true);
    setShowRescheduleButton(false);
    setShowConfirmButton(false);
  };
  const handleConfirmRoiLich = async () => {

    const stringConfirm = 'Rời lịch';
    if (reason == null || reason == '') {
      Toast.show({
        type: 'error',
        text1: 'Nhập lý do',
        text2: 'Vui lòng nhập lý do',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      return;
    }
    const formattedDate = moment(selectedDueDate)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DDTHH:mm');
    const url = `/hoan-thanh-task?type=${encodeURIComponent(stringConfirm)}&UserID=${encodeURIComponent(userID)}&TaskID=${encodeURIComponent(taskID)}&dueDate=${encodeURIComponent(formattedDate)}&lyDo=${encodeURIComponent(reason)}`;
    console.log(url)

    axiosInstance
      .post(url)
      .then(response => {
        if (response.data.code === 200) {
          Toast.show({
            type: 'success',
            text1: 'Đã cập nhập trạng thái "rời lịch" ',
            visibilityTime: 2000,
            onHide: () => {
              fetchData();
            },
          });
        } else {
          Toast.show({
            type: 'error',
            text1: response.data.message,
            text2: response.data.data,
            text2Style: {
              fontWeight: '700',
              color: 'black',
            },
            visibilityTime: 3000,
          });
          return;
        }
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
  };
  const handleConfirmHoanThanh = async () => {
    const stringConfirm = 'Hoàn thành';

    const url = `/hoan-thanh-task?type=${encodeURIComponent(stringConfirm)}&UserID=${encodeURIComponent(userID)}&TaskID=${encodeURIComponent(taskID)}&linkHoanThanh=${encodeURIComponent(linkTask)}`;
    axiosInstance
      .post(url)
      .then(response => {
        if (response.data.code === 200) {
          Toast.show({
            type: 'success',
            text1: 'Đã cập nhập trạng thái "hoàn thành" ',
            visibilityTime: 2000,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: response.data.message,
            text2: response.data.data,
            text2Style: {
              fontWeight: '700',
              color: 'black',
            },
            visibilityTime: 3000,
          });
          return;
        }
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
    console.log('hoanf thanh');
    console.log('linkTask', linkTask);
  };
  const handleCancel = async () => {
    setShowReasonInput(false);
    setShowRescheduleButton(true);
    setShowConfirmButton(true);
    setReason('');
    setSelectedDueDate(new Date());
  };

  return (
    taskData && (
      <View style={styles.containerMain}>
        <LinearGradient colors={['#C6E6F1', '#007BFF']} style={styles.header}>
          <View style={styles.statusContainer}>
            <Text style={styles.status}>{taskData.task.status }</Text>
          </View>
          <View style={styles.inputContainerHeader}>
            <Text style={styles.labelHeader}>Tiêu đề</Text>
            <Text style={styles.inputHeader}>{taskData.task.title}</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mô tả</Text>
            <Text>{taskData.task.description}</Text>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.labelMore]}>Ngày tạo</Text>
              <TextInput
                style={[styles.inputMore]}
                placeholder="Chọn ngày tạo"
                value={moment(taskData.task.createDate)
                  .tz('Asia/Ho_Chi_Minh')
                  .format('HH:mm DD-MM-YYYY')}
                editable={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.labelMore]}>Ngày hết hạn</Text>
              <TextInput
                style={[styles.inputMore]}
                placeholder="Chọn ngày hết hạn"
                value={moment(taskData.task.dueDate)
                  .tz('Asia/Ho_Chi_Minh')
                  .format('HH:mm DD-MM-YYYY')}
                editable={false}
              />
            </View>
          </View>
          {showConfirmButton && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Link sản phẩm(nếu có)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Nhập link sản phẩm(nếu có)"
                value={linkTask}
                multiline={true}
                onChangeText={setLinkTask}
              />
            </View>
          )}

          {showReasonInput && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Lý do:</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Nhập lý do"
                value={reason}
                multiline={true}
                onChangeText={setReason}
              />
            </View>
          )}
          {showReasonInput && (
            <View style={styles.inputContainer}>
              <Text style={[styles.labelMore]}>Ngày rời lịch</Text>
              <TextInput
                style={[styles.inputMore]}
                placeholder="Chọn ngày rời lịch"
                value={moment(selectedDueDate)
                  .tz('Asia/Ho_Chi_Minh')
                  .format('HH:mm DD-MM-YYYY')}
                editable={false}
                onPressIn={() => setShowDuePicker(true)}
              />
            </View>
          )}
          <View style={styles.buttonContainer}>
            {showRescheduleButton && (
              <LinearGradient
                colors={['#FF6F00', '#FF9800']}
                style={styles.saveButton}>
                <TouchableOpacity onPress={handleReschedule}>
                  <Text style={styles.buttonTextMain}>Rời lịch</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
            {showConfirmButton && (
              <LinearGradient
                colors={['#C6E6F1', '#C6E6F1']}
                style={styles.saveButton}>
                <TouchableOpacity onPress={handleConfirmHoanThanh}>
                  <Text style={styles.buttonTextMainConfirm}>Hoàn thành</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
            {!showConfirmButton && (
              <LinearGradient
                colors={['#C6E6F1', '#C6E6F1']}
                style={styles.saveButton}>
                <TouchableOpacity onPress={handleConfirmRoiLich}>
                  <Text style={styles.buttonTextMainConfirm}>Xác nhận</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
            {!showConfirmButton && (
              <LinearGradient
                colors={['#FF6F00', '#FF9800']}
                style={styles.saveButton}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.buttonTextMain}>Huỷ</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
          {showDuePicker && (
            <Modal
              transparent={true}
              visible={showDuePicker}
              animationType="slide">
              <View style={styles.modalContainer}>
                <DateTimePicker
                  value={selectedDueDate}
                  mode="datetime"
                  display="spinner"
                  onChange={onDueDateChange}
                  locale="vi"
                  textColor={'#000000'}
                />
                <Button title="Xác nhận" onPress={confirmDueDate} />
              </View>
            </Modal>
          )}
          <Toast />
        </ScrollView>
      </View>
    )
  );
}
const styles = StyleSheet.create({
  containerMain: {},
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
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
  buttonDisabled: {
    backgroundColor: '#aaa', // Màu khi nút bị vô hiệu hóa
    elevation: 0,
    shadowOpacity: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  multilineInput: {
    height: 100,
    borderColor: '#FF8C00',
  },
  saveButton: {
    backgroundColor: '#6A00F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 16,
  },
  buttonTextMain: {
    color: '#E8C4F2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextMainConfirm: {
    color: '#FF8C00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputContainerHeader: {
    marginTop: 16,
  },
  labelHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  inputHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#D7DDF0',
    color: '#fff',
    paddingHorizontal: 0,
    marginVertical: 4,
    fontSize: 30,
    fontWeight: '700',
    flexWrap: 'wrap',  
  },
  inputMore: {  
    fontSize: 16,
    fontWeight: '600',
  },
  labelMore: {
    fontSize: 12,
    marginBottom: 5,
  },
  statusContainer: {
    position: 'absolute', 
    right: 16,           
    top: 20,             
    backgroundColor: 'white',
    borderRadius: 8,   
    padding: 8,         
  },
  status: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});
