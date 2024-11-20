import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
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
import CheckBox from '@react-native-community/checkbox';
import {storeData, getData} from '../../configs/asyncStorage.js';
import Loading from '../../components/Loading';

function ImportTask() {
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user;
  const [tasks, setTasks] = useState([
    {
      assignedToUserID: user.id,
      title: '',
      description: '',
      createDate: new Date(),
      dueDate: new Date(),
      isKPI: false,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCreatePicker, setShowCreatePicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [selectedCreateDate, setSelectedCreateDate] = useState(new Date());
  const [selectedDueDate, setSelectedDueDate] = useState(new Date());

  const handleToggleCheckbox = isChecked => {
    const updatedTasks = [...tasks];
    updatedTasks[currentIndex].isKPI = isChecked;
    setTasks(updatedTasks);
  };
  const onCreateDateChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedCreateDate(selectedTime);
    }
  };

  const onDueDateChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedDueDate(selectedTime);
    }
  };

  const confirmCreateDate = () => {
    const updatedTasks = [...tasks];
    const formattedDate = moment(selectedCreateDate)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    updatedTasks[currentIndex].createDate = formattedDate;
    setTasks(updatedTasks);
    setShowCreatePicker(false);
  };

  const confirmDueDate = () => {
    const updatedTasks = [...tasks];
    const formattedDate = moment(selectedDueDate)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    updatedTasks[currentIndex].dueDate = formattedDate;
    setTasks(updatedTasks);
    setShowDuePicker(false);
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        assignedToUserID: user.id,
        title: '',
        description: '',
        createDate: new Date(),
        dueDate: new Date(),
        isKPI: false,
      },
    ]);
    setCurrentIndex(tasks.length);
  };

  const SaveTask = async () => {
    setLoading(true);
    const userId = await getData('userId');
    const dataToSend = tasks.map(task => {
      // Chuyển đổi ngày tháng sang định dạng mong muốn
      const createDateMain = moment(task.createDate)
        .tz('Asia/Ho_Chi_Minh')
        .format('YYYY-MM-DDTHH:mm:ss.SSSZ');

      const dueDateMain = moment(task.dueDate)
        .tz('Asia/Ho_Chi_Minh')
        .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      const taskDescription = task.description || 'Không có mô tả';
      // Trả về đối tượng với các thuộc tính đã được định dạng
      return {
        assignedToUserID: task.assignedToUserID,
        title: task.title,
        description: taskDescription,
        createDate: createDateMain,
        dueDate: dueDateMain,
        isKPI: task.isKPI,
      };
    });

    axiosInstance
      .post(
        `/import-task-user?UserIDAdmin=${userId.replace(/"/g, '')}`,
        dataToSend,
      )
      .then(res => {
        setLoading(false);

        if (res.data.code === 200) {
          Toast.show({
            type: 'success',
            text1: 'Đã thêm thành công',
            visibilityTime: 2000,
            onHide: () => {
              navigation.navigate('TaskUserList', {user});
            },
          });
        } else {
          Toast.show({
            type: 'error',
            text1: res.message,
            text2: res.data,
            text2Style: {
              fontWeight: '700',
              color: 'black',
            },
            visibilityTime: 3000,
          });
        }
      })
      .catch(err => {
        setLoading(false);

        Toast.show({
          type: 'error',
          text1: 'Xảy ra lỗi',
          text2: 'Vui lòng thử lại',
          text2Style: {
            fontWeight: '700',
            color: 'black',
          },
          visibilityTime: 3000,
        });
      });
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <View style={styles.containerMain}>
      <LinearGradient colors={['#6A00F4', '#AE47F1']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            Thêm nhiệm vụ cho {user.fullName}
          </Text>
        </View>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.inputContainerHeader}>
            <Text style={styles.labelHeader}>Tiêu đề</Text>
            <TextInput
              style={styles.inputHeader}
              placeholder="Nhập tiêu đề"
              placeholderTextColor="#FFFFFF"
              value={tasks[currentIndex].title}
              onChangeText={text => {
                const updatedTasks = [...tasks];
                updatedTasks[currentIndex].title = text;
                setTasks(updatedTasks);
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={tasks[currentIndex].isKPI || false}
            onValueChange={newValue => handleToggleCheckbox(newValue)}
          />
          <Text style={styles.checkboxLabel}>Có tính KPI</Text>
        </View>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mô tả:</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Nhập mô tả"
              value={tasks[currentIndex].description}
              multiline={true}
              onChangeText={text => {
                const updatedTasks = [...tasks];
                updatedTasks[currentIndex].description = text;
                setTasks(updatedTasks);
              }}
            />
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.rowContainer}>
          <View style={styles.inputContainer}>
            <Text style={[styles.labelMore]}>Ngày tạo</Text>
            <TextInput
              style={[styles.inputMore]}
              placeholder="Chọn ngày tạo"
              value={moment(tasks[currentIndex].createDate)
                .tz('Asia/Ho_Chi_Minh')
                .format('HH:mm DD-MM-YYYY')}
              editable={false}
              onPressIn={() => setShowCreatePicker(true)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.labelMore]}>Ngày hết hạn</Text>
            <TextInput
              style={[styles.inputMore]}
              placeholder="Chọn ngày hết hạn"
              value={moment(tasks[currentIndex].dueDate)
                .tz('Asia/Ho_Chi_Minh')
                .format('HH:mm DD-MM-YYYY')}
              editable={false}
              onPressIn={() => setShowDuePicker(true)}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
            onPress={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}>
            <Text style={styles.buttonText}>Trước</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={addTask}>
            <Text style={styles.buttonText}>Thêm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              currentIndex === tasks.length - 1 && styles.buttonDisabled,
            ]}
            onPress={() =>
              setCurrentIndex(prev => Math.min(prev + 1, tasks.length - 1))
            }
            disabled={currentIndex === tasks.length - 1}>
            <Text style={styles.buttonText}>Sau</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={SaveTask}>
          <LinearGradient
            colors={['#6A00F4', '#AE47F1']}
            style={styles.saveButton}>
            <Text style={styles.buttonTextMain}>Lưu Task</Text>
          </LinearGradient>
        </TouchableOpacity>

        {showCreatePicker && (
          <Modal
            transparent={true}
            visible={showCreatePicker}
            animationType="slide">
            <View style={styles.modalContainer}>
              <DateTimePicker
                value={selectedCreateDate}
                mode="datetime"
                display="spinner"
                onChange={onCreateDateChange}
                locale="vi"
                textColor={'#000000'}
              />
              <Button title="Xác nhận" onPress={confirmCreateDate} />
            </View>
          </Modal>
        )}

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
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  containerMain: {},
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    color: 'white',
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
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#D7DDF0',
    color: '#FFFFFF',
    paddingHorizontal: 0,
    marginVertical: 4,
    fontSize: 30,
    fontWeight: '700',
  },
  inputMore: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelMore: {
    fontSize: 12,
    marginBottom: 5,
  },
});

export default ImportTask;
