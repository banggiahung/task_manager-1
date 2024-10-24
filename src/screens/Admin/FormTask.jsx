import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Theme from '../../configs/color';
import {useNavigation, useRoute} from '@react-navigation/native';
import Header from '../../components/Header';
import axiosInstance from '../../configs/axios';

export default function FormTask() {
  const initData = [];

  for (let i = 1; i < 8; i++) {
        initData.push({
        taskIDTongQuanTuan: i,
        title: `Thu ${i+1}`,
        description: `Description for Task ${i}`,
        datetimeTask: new Date(Date.now() + i * 86400000).toISOString(),
        });
  }

  const param = useRoute()
  const data = param.params
  console.log(data)
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
    axiosInstance
      .post('/import-task-tong-quan', data_task)
      .then(res => {
        res = res.data
        if(res.code == 400){
            Toast.show({
                type:"error",
                "text1":res.message,
                "text2":res.data,
                "text2Style":{
                    "fontWeight":700,
                    color:"black"
                },
                visibilityTime: 3000,
            })
        }else{
            Toast.show({
                type:"success",
                "text1":"Thanh cong"
            })
        }
       
      })
      .catch(err => {
        Toast.show({
            type:"error",
            "text1":"That bai",
            "text2":"Khong gui duoc du lieu",
            "text2Style":{
                "fontWeight":700,
                color:"black"
            },
            visibilityTime: 3000,
        })
      }).finally(()=>{
        navigation.navigate("ListTask")
      })
  };

  useEffect(()=>{
    console.log("data_task", data_task)
  },[data_task])

  const renderItem = ({item}) => (
    <View style={styles.taskItem}>
      <Text style={styles.dateText}>{item.title}</Text>
      <TextInput
        style={styles.textInput}
        multiline
        onChangeText={handleForm}
        value={item.description} // Set the current value from the task
        numberOfLines={5}
        textAlignVertical="top"
        placeholder="Nhập nội dung ở đây..."
      />
    </View>
  );

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
      <Header />
      <View style={styles.containerTask}>
        <FlatList
          data={[data_task[currentIndex]]} // Only render the current task
          renderItem={renderItem}
          keyExtractor={item => item.taskIDTongQuanTuan.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
        />
      </View>

      <View style={styles.containerButton}>
        <Button
          title="Truoc"
          onPress={handleBack}
          disabled={currentIndex === 0}
        />
        {currentIndex === data_task.length - 1 ? (
          <Button
            title="Hoàn thành" 
            onPress={post_data} 
          />
        ) : (
          <Button
            title="Sau"
            onPress={handleNext}
            disabled={currentIndex === data_task.length - 1}
          />
        )}
      </View>
      <Toast/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerTask: {
    flex: 1,
    padding: 10,
    maxHeight: 500,
  },
  taskItem: {
    width: '100%', // Full width for the task item
    padding: 10,
    alignItems: 'center',
  },
  dateText: {
    color: '#000',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minWidth: '60%',
    maxWidth: '80%',
    textAlignVertical: 'top',
  },
  containerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
});
