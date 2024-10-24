import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Button,
} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import TaskItem from '../../components/TaskItem.jsx';
import axiosInstance from '../../configs/axios';
import Theme from '../../configs/color';

function ImportTask() {
  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user;

  // State variables for start and end time selections
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');

  // Sample hour and minute data
  const hoursData = [
    {key: '1', value: '00'},
    {key: '2', value: '01'},
    {key: '3', value: '02'},
    {key: '4', value: '03'},
    {key: '5', value: '04'},
    {key: '6', value: '05'},
    {key: '7', value: '06'},
    {key: '8', value: '07'},
    {key: '9', value: '08'},
    {key: '10', value: '09'},
    {key: '11', value: '10'},
    {key: '12', value: '11'},
    {key: '13', value: '12'},
    {key: '14', value: '13'},
    {key: '15', value: '14'},
    {key: '16', value: '15'},
    {key: '17', value: '16'},
    {key: '18', value: '17'},
    {key: '19', value: '18'},
    {key: '20', value: '19'},
    {key: '21', value: '20'},
    {key: '22', value: '21'},
    {key: '23', value: '22'},
    {key: '24', value: '23'},
  ];

  const minutesData = [
    {key: '1', value: '00'},
    {key: '2', value: '05'},
    {key: '3', value: '10'},
    {key: '4', value: '15'},
    {key: '5', value: '20'},
    {key: '6', value: '25'},
    {key: '7', value: '30'},
    {key: '8', value: '35'},
    {key: '9', value: '40'},
    {key: '10', value: '45'},
    {key: '11', value: '50'},
    {key: '12', value: '55'},
  ];

  const [tasks, setTask] = React.useState([]);

  const [list_task, setList_task] = useState([
    {
      taskID: 0,
      title: 'ten task',
      description: 'huong dan',
      assignedToUserID: user.id,
      status: 'sas',
      createDate: '',
      dueDate: '',
    },
  ]);

  const addTask = () => {
    setList_task(pre => [
      ...pre,
      {
        taskID: 0,
        title: 'ten task',
        description: 'huong dan',
        assignedToUserID: user.id,
        status: 'sas',
        createDate: '',
        dueDate: '',
      },
    ]);
  };

  const SaveTask = ()=>{
    console.log(list_task)
    axiosInstance.post("/import-task-user", list_task)
    .then(res=>{

    })
    .catch(err=>{
        console.log(err)
    })
  }

  useEffect(()=>{
    axiosInstance.get(`/get-list-task-user?UserID=${user.id}`)
    .then(res=>{
        res = res.data
        setTask(res.data||[])
    })
  },[])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userInfoContainer}>
        {user ? (
          <>
            <Text style={styles.userInfoText}>Tên: {user.fullName}</Text>
            <Text style={styles.userInfoText}>Tài khoản: {user.userName}</Text>
            <Text style={styles.userInfoText}>Kpi: {user.kpiUser}</Text>
          </>
        ) : (
          <Text style={styles.userInfoText}>
            Không có thông tin người dùng.
          </Text>
        )}
      </View>
      {list_task &&
        list_task.map((item, index) => {
          return (
            <View key={index} style={{backgroundColor:Theme.accent}}>
              <View style={styles.userInfoContainer}>
                <Text>Chọn giờ bắt đầu</Text>
                <View style={styles.timePickerContainer}>
                  <SelectList
                    setSelected={setStartHour}
                    data={hoursData}
                    save="value"
                    placeholder="Giờ"
                    boxStyles={styles.selectListBox}
                  />
                  <SelectList
                    setSelected={setStartMinute}
                    data={minutesData}
                    save="value"
                    placeholder="Phút"
                    boxStyles={styles.selectListBox}
                  />
                </View>
                {startHour && startMinute && (
                  <Text style={styles.selectedText}>
                    Giờ bắt đầu: {startHour}:{startMinute}
                  </Text>
                )}
              </View>

              <View style={styles.userInfoContainer}>
                <Text>Chọn giờ kết thúc</Text>
                <View style={styles.timePickerContainer}>
                  <SelectList
                    setSelected={setEndHour}
                    data={hoursData}
                    save="value"
                    placeholder="Giờ"
                    boxStyles={styles.selectListBox}
                  />
                  <SelectList
                    setSelected={setEndMinute}
                    data={minutesData}
                    save="value"
                    placeholder="Phút"
                    boxStyles={styles.selectListBox}
                  />
                </View>
                {endHour && endMinute && (
                  <Text style={styles.selectedText}>
                    Giờ kết thúc: {endHour}:{endMinute}
                  </Text>
                )}
              </View>

              <View style={styles.taskContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Tên task</Text>
                  <TextInput style={styles.input} placeholder="Nhập tên task" />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mô tả, hướng dẫn</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mô tả hoặc hướng dẫn"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

            </View>
          );
        })}

      <View>
        <Button onPress={addTask} title="Them task"></Button>
        <Button onPress={SaveTask} title='Luus'></Button>
      </View>

        <View>
            <Text>Task dang co</Text>
            <View>
                {
                    tasks && tasks.map((item, index)=>{
                        return <View key={index}>
                            <Text>{{item}}</Text>
                        </View>
                    })
                }
            </View>
        </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.primary,
  },
  userInfoContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    width: '100%',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 40,
  },
  selectListBox: {
    flex: 1,
    marginRight: 10,
  },
  selectedText: {
    marginTop: 10,
    fontSize: 16,
    color: 'green',
  },
  containerTask: {
    margin: 20,
  },
  taskContainer: {
    flex: 1,
    margin:20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9', // Light background for the container
  },
  inputContainer: {
    marginBottom: 20, // Spacing between input fields
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333', // Darker text color for better readability
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderColor: '#ccc',
    borderWidth: 1, // Light border for input fields
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Slight elevation for a modern effect
  },
});

export default ImportTask;
