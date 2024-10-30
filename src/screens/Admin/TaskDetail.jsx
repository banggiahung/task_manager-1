
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Modal,
  TouchableOpacity,
  TextInput
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../configs/axios';
import {format} from 'date-fns';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import moment from 'moment-timezone';
function TaskDetail() {
  const navigation = useNavigation();

  const route = useRoute();
  const { task ,user} = route.params; 
  const [tasks, setTasks] = useState([
    {taskID:task.taskID, assignedToUserID: task.assignedToUserID, title: task.title, description: task.description, createDate: new Date(task.createDate), dueDate: new Date(task.dueDate )},
  ]);
  useEffect(() => {
  }, [task, user]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const users = user;
  const [showCreatePicker, setShowCreatePicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);

  const [selectedCreateDate, setSelectedCreateDate] = useState(tasks[0].createDate);
  const [selectedDueDate, setSelectedDueDate] = useState(tasks[0].dueDate);

  const onCreateDateChange = (event, date) => {
    setSelectedCreateDate(date || selectedCreateDate);
  };

  const onDueDateChange = (event, date) => {
    setSelectedDueDate(date || selectedDueDate);
  };

  const confirmCreateDate = () => {
    const updatedTasks = [...tasks];

    // Sử dụng moment để định dạng và chuyển đổi múi giờ
    const formattedDate = moment(selectedCreateDate).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

    updatedTasks[currentIndex].createDate = formattedDate; // Lưu dưới dạng chuỗi ISO
    setTasks(updatedTasks);

    setShowCreatePicker(false);
};

  const confirmDueDate = () => {
   

    const updatedTasks = [...tasks];
     // Sử dụng moment để định dạng và chuyển đổi múi giờ
     const formattedDate = moment(selectedDueDate).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

   
     // Cập nhật giá trị createDate trong tasks
    updatedTasks[currentIndex].dueDate = formattedDate;
    setTasks(updatedTasks);
    setShowDuePicker(false);
  };
  const GoToTaskList = () => {
    if (user) {
      console.log("Navigating with user:", user);
      navigation.navigate('TaskUserList', { user });
    } else {
      console.error("User is undefined, can't navigate.");
      Toast.show({
        type: 'error',
        text1: "User information is missing",
        visibilityTime: 3000,
      });
    }
  };
 
  const SaveTask = () => {
    
    const dataToSend = tasks.map(task => {
        // Tạo Date mới từ selectedCreateDate để giữ nguyên múi giờ
       
        console.log(task.createDate)
        console.log(task.dueDate)
    
        return {
          taskID: task.taskID,
          assignedToUserID: task.assignedToUserID,
          title: task.title,
          description: task.description,
          createDate: task.createDate, 
          dueDate: task.dueDate, 
        };
      });
    
    axiosInstance
      .post('/edit-task-user', dataToSend)
      .then(res => {

        if (res.data.code === 200) {
          Toast.show({
            type: 'success',
            text1: 'Đã sửa thành công',
            visibilityTime: 2000,
            onHide: () => {
                GoToTaskList();
                
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
        Toast.show({
          type: 'error',
          text1: "Xảy ra lỗi",
          text2: "Vui lòng thử lại",
          text2Style: {
            fontWeight: '700',
            color: 'black',
          },
          visibilityTime: 3000,
        });
      });
  };
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tiêu đề:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề"
          value={tasks[currentIndex].title}
          onChangeText={(text) => {
            const updatedTasks = [...tasks];
            updatedTasks[currentIndex].title = text;
            setTasks(updatedTasks);
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mô tả:</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Nhập mô tả"
          value={tasks[currentIndex].description}
          multiline={true}
          onChangeText={(text) => {
            const updatedTasks = [...tasks];
            updatedTasks[currentIndex].description = text;
            setTasks(updatedTasks);
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ngày tạo:</Text>
        <TextInput
          style={styles.input}
          placeholder="Chọn ngày tạo"
          value={moment(tasks[currentIndex].createDate).tz('Asia/Ho_Chi_Minh').format('HH:mm DD-MM-YYYY')}
          editable={false}
          onPressIn={() => {
            // setSelectedCreateDate(tasks[currentIndex].createDate);
            setShowCreatePicker(true);
          }}
        />
       
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ngày hết hạn:</Text>
        <TextInput
          style={styles.input}
          placeholder="Chọn ngày hết hạn"
          value={moment(tasks[currentIndex].dueDate).tz('Asia/Ho_Chi_Minh').format('HH:mm DD-MM-YYYY')}
          editable={false}
          onPressIn={() => {
            // setSelectedDueDate(tasks[currentIndex].dueDate);
            setShowDuePicker(true);
          }}
        />
       
      </View>

     
      <TouchableOpacity style={styles.saveButton} onPress={SaveTask}>
        <Text style={styles.buttonTextMain}>Lưu Task</Text>
      </TouchableOpacity>

     
      {showCreatePicker && (
        <Modal transparent={true} visible={showCreatePicker} animationType="slide">
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

      {/* Modal cho Ngày Hết Hạn */}
      {showDuePicker && (
        <Modal transparent={true} visible={showDuePicker} animationType="slide">
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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',

  },
  saveButton: {
    backgroundColor: '#28a745', // Màu nền nút
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 16,
    
    
  },
  buttonTextMain: {
    color: 'white' ,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TaskDetail;
