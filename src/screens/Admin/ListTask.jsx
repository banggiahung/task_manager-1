import * as React from 'react';
import {View, Text, StyleSheet, ScrollView, Button, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Theme from '../../configs/color';
import axiosInstance from '../../configs/axios';
import TaskItem from '../../components/TaskItem';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

function ListTask() {
  const [tasks, setTask] = React.useState([]);
  const navigation = useNavigation();

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get('/tasks-for-week');
      console.log(res);
      setTask(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGesture = event => {
    if (event.nativeEvent.translationY > 100) {
      fetchTasks();
    }
  };

  const HandleEdit = () => {
    navigation.navigate('EditTaskTongQuan', {tasks});
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const getWeekOfMonth = () => {
    const weekOfMonth = moment().isoWeek(); // Lấy số tuần của tuần hiện tại
    const startOfMonth = moment().startOf('month').isoWeek(); // Số tuần tại ngày đầu tiên của tháng
    return weekOfMonth - startOfMonth + 1;
  };
  
  const weekNumber = getWeekOfMonth();
  const monthName = moment().format('MMMM'); // Lấy tên tháng
  const monthNumber = moment().month() + 1; // Calculate the current week of the month

  return (
    <GestureHandlerRootView>
      <PanGestureHandler onGestureEvent={handleGesture}>
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.header}>
            <Text style={styles.weekTitle}>Tuần {weekNumber} tháng {monthNumber}</Text>
          </View>
          <ScrollView style={styles.container}>
            {tasks &&
              tasks.map(item => (
                <View key={item.taskIDTongQuanTuan}>
                  <TaskItem task={item} />
                </View>
              ))}
          </ScrollView>

          <View style={styles.containerButton}>
            <TouchableOpacity style={styles.button} onPress={HandleEdit}>
              <Text style={styles.buttonText}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: Theme.secondary,
    
  },
  header: {
    padding: 10,
    backgroundColor: Theme.primary, 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  containerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    margin: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Shadow radius
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ListTask;
