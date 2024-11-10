import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Button,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import Header from '../../components/Header';
import axiosInstance from '../../configs/axios';
import moment from 'moment'; // Import moment
import DateTimePicker from '@react-native-community/datetimepicker';

const {height} = Dimensions.get('window');

export default function FormTask() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [firstDate, setFirstDate] = useState(() => {
    // Lấy ngày hôm nay
    const today = moment().tz('Asia/Ho_Chi_Minh');

    // Lấy ngày Thứ 2 của tuần hiện tại
    const firstDayOfWeek = today.startOf('isoWeek'); // Thứ 2 của tuần hiện tại

    return firstDayOfWeek.toDate(); // Chuyển sang đối tượng Date
  });

  const [lastDate, setLastDate] = useState(null);
  const [showFirstPicker, setShowFirstPicker] = useState(false);
  const onFirstDateChange = (event, selectedTime) => {
    if (selectedTime) {
      setFirstDate(selectedTime);
    }
  };
  const confirmFirstDate = () => {
    const formattedDate = moment(firstDate)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    setShowFirstPicker(false);
    createWeekData(0);
  };
  const createWeekData = (weekOffset = 0) => {
    const weekData = [];

    // Sử dụng firstDate (ngày bắt đầu) thay vì startOf('isoWeek')
    const startDate = moment(firstDate).tz('Asia/Ho_Chi_Minh').startOf('day');

    const dayOfWeek = startDate.isoWeekday(); // Lấy số thứ tự ngày trong tuần (1 = Thứ 2, 7 = Chủ nhật)

    // Nếu startDate không phải là Thứ 2, điều chỉnh để bắt đầu từ Thứ 2
    if (dayOfWeek !== 1) {
      startDate.subtract(dayOfWeek - 1, 'days'); // Cộng (hoặc trừ) số ngày cần thiết để chuyển về Thứ 2
    }
    for (let i = 0; i < 7; i++) {
      const date = startDate.clone().add(i, 'days');

      let title =
        date.format('E') === '1'
          ? 'Thứ 2'
          : date.format('E') === '2'
          ? 'Thứ 3'
          : date.format('E') === '3'
          ? 'Thứ 4'
          : date.format('E') === '4'
          ? 'Thứ 5'
          : date.format('E') === '5'
          ? 'Thứ 6'
          : date.format('E') === '6'
          ? 'Thứ 7'
          : 'Chủ nhật';

      // Nếu muốn điều chỉnh từ Thứ 1 thành Thứ 2
      if (title === 'Thứ 1') {
        title = 'Thứ 2';
      }

      weekData.push({
        title,
        description: '',
        datetimeTask: date.format('YYYY-MM-DDTHH:mm:ss'),
      });
    }

    // Lấy ngày bắt đầu và ngày kết thúc
    setFirstDate(new Date(weekData[0].datetimeTask));
    setLastDate(weekData[weekData.length - 1].datetimeTask);
    setDataTask(weekData);
    setCurrentIndex(0); // Đặt lại về task đầu tiên trong tuần

    console.log(weekData);
  };
  useEffect(() => {
    createWeekData(currentWeek);
  }, []);
  const goToNextWeek = () => {
    setCurrentWeek(currentWeek + 1);
    setCurrentIndex(0); // Đặt lại về task đầu tiên trong tuần
  };

  const goToPreviousWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
      setCurrentIndex(0); // Đặt lại về task đầu tiên trong tuần
    }
  };
  const initData = [];

  // Create task data for the week
  for (let i = 1; i < 8; i++) {
    const dayOfWeek = moment().add(i, 'days').format('dddd');
    let title;

    if (i === 6) {
      title = 'Thứ 7'; // For Saturday
    } else if (i === 7) {
      title = 'Chủ Nhật'; // For Sunday
    } else {
      title = `Thứ ${i + 1}`; // For other days (Monday to Friday)
    }

    initData.push({
      title: title,
      description: '',
      datetimeTask: moment().add(i, 'days').toISOString(),
    });
  }

  const param = useRoute();
  const data = param.params;
  const [data_task, setDataTask] = useState(data ? data : initData);
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleForm = value => {
    const updatedTasks = data_task.map((task, idx) => {
      if (idx === currentIndex) {
        return {...task, description: value};
      }
      return task;
    });
    setDataTask(updatedTasks);
  };

  const post_data = () => {
    const formattedTasks = data_task.map(task => ({
      ...task,
      description: `<pre>${task.description}</pre>`,
    }));
    const startDate = moment(firstDate).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm:ss');
    axiosInstance
      .post(`/import-task-tong-quan?startTime=${encodeURIComponent(startDate)}`, formattedTasks)
      .then(res => {
        res = res.data;
        if (res.code === 400) {
          Toast.show({
            type: 'error',
            text1: res.message,
            text2: res.data,
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
      })
      .catch(err => {
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
      })
      // .finally(() => {
      //   navigation.navigate('Main', {screen: 'ListTask'});
      // });
  };

  useEffect(() => {
    console.log('data_task', data_task);
  }, [data_task]);

  const renderItem = () => {
    const currentTask = data_task[currentIndex];
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{currentTask.title}</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            multiline={true}
            onChangeText={handleForm}
            value={currentTask.description}
            placeholder="Nhập nội dung ở đây..."
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const handleNext = () => {
    if (currentIndex < data_task.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={() => setShowFirstPicker(true)}>
          <Text style={styles.dateText}>
            {firstDate ? moment(firstDate).format('DD/MM/YYYY') : 'Đang tải...'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.arrowText}> ➔ </Text>
        <Text style={styles.dateText}>
          {lastDate ? moment.utc(lastDate).format('DD/MM/YYYY') : 'Đang tải...'}
        </Text>
      </View>

      {/* <View style={styles.weekNavigation}>
        <TouchableOpacity
          style={styles.weekButton}
          onPress={goToPreviousWeek}
          disabled={currentWeek === 0}>
          <Text style={styles.buttonText}>Tuần trước</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.weekButton} onPress={goToNextWeek}>
          <Text style={styles.buttonText}>Tuần tiếp theo</Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.containerTask}>{renderItem()}</View>

      <View style={styles.containerButton}>
        <TouchableOpacity
          style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
          onPress={handleBack}
          disabled={currentIndex === 0}>
          <Text style={styles.buttonText}>Trước</Text>
        </TouchableOpacity>

        {currentIndex === data_task.length - 1 ? (
          <TouchableOpacity style={styles.saveButton} onPress={post_data}>
            <Text style={styles.buttonText}>Hoàn thành</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Sau</Text>
          </TouchableOpacity>
        )}
      </View>
      {showFirstPicker && (
        <Modal
          transparent={true}
          visible={showFirstPicker}
          animationType="slide">
          <View style={styles.modalContainer}>
            <DateTimePicker
              value={firstDate}
              mode="datetime"
              display="spinner"
              onChange={onFirstDateChange}
              locale="vi"
              textColor={'#000000'}
            />
            <Button title="Xác nhận" onPress={confirmFirstDate} />
          </View>
        </Modal>
      )}
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Đảm bảo căn giữa các phần tử
    justifyContent: 'center',
    marginTop: 12,
  },
  dateText: {
    fontSize: 16,
    marginHorizontal: 5, // Thêm khoảng cách giữa ngày và mũi tên
  },
  arrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 12,
  },
  container: {
    padding: 20,
  },
  containerTask: {
    padding: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 40,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
  },
  multilineInput: {
    height: 300,
  },
  containerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  weekButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
});
