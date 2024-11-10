import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import Header from '../../components/Header';
import axiosInstance from '../../configs/axios';

const {height} = Dimensions.get('window');

export default function EditTaskTongQuan() {
  const initData = [];

  for (let i = 1; i < 8; i++) {
    initData.push({
      taskIDTongQuanTuan: i,
      title: `Thu ${i + 1}`,
      description: `Description for Task ${i}`,
      datetimeTask: new Date(Date.now() + i * 86400000).toISOString(),
    });
  }

  const param = useRoute();
  const data = param.params;
  const [data_task, setDataTask] = useState(data ? data.tasks : initData);
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
    console.log(formattedTasks);
    axiosInstance
      .post('/edit-task-tong-quan', formattedTasks)
      .then(res => {
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
      .finally(() => {
        navigation.navigate('Main', {screen: 'ListTask'});
      });
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
            value={currentTask.description.replace(/<\/?pre>/g, '')}
            placeholder="Nhập nội dung ở đây..."
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };
  // const renderItem = ({ item }) => (
  //   <View style={styles.taskItem}>
  //     <Text style={styles.dateText}>{item.title}</Text>
  //     <TextInput
  //       style={styles.textInput}
  //       multiline
  //       onChangeText={handleForm}
  //       value={item.description.replace(/<\/?pre>/g, '')}
  //       numberOfLines={5}
  //       textAlignVertical="top"
  //       placeholder="Nhập nội dung ở đây..."
  //     />
  //   </View>
  // );

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

      <Toast />
    </SafeAreaView>
  );
  // return (
  //   <SafeAreaView style={styles.container}>
  //     <Header />
  //     <View style={styles.containerTask}>
  //       <FlatList
  //         data={[data_task[currentIndex]]}
  //         renderItem={renderItem}
  //         keyExtractor={(item) => item.taskIDTongQuanTuan.toString()}
  //         horizontal
  //         showsHorizontalScrollIndicator={false}
  //         pagingEnabled
  //       />
  //     </View>

  //     <View style={styles.containerButton}>
  //       <Button
  //         title="Truoc"
  //         onPress={handleBack}
  //         disabled={currentIndex === 0}
  //       />
  //       {currentIndex === data_task.length - 1 ? (
  //         <Button title="Hoàn thành" onPress={post_data} />
  //       ) : (
  //         <Button
  //           title="Sau"
  //           onPress={handleNext}
  //           disabled={currentIndex === data_task.length - 1}
  //         />
  //       )}
  //     </View>
  //     <Toast />
  //   </SafeAreaView>
  // );
}

const styles = StyleSheet.create({
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
});
