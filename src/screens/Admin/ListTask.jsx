import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Theme from '../../configs/color';
import axiosInstance from '../../configs/axios';
import TaskItem from '../../components/TaskItem';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import moment from 'moment';

function ListTask() {
  const [tasks, setTask] = React.useState([]);
  const [currentWeek, setCurrentWeek] = React.useState(moment());
  const navigation = useNavigation();

  const [prevMonday, setPrevMonday] = React.useState(moment());
  const [prevSunday, setPrevSunday] = React.useState(moment());

  const getWeekOfMonth = date => {
    const weekOfMonth = moment(date).isoWeek();
    const startOfMonth = moment(date).startOf('month').isoWeek();
    return weekOfMonth - startOfMonth + 1; // Return the week number in the month
  };

  // State for week and month numbers
  const [weekNumber, setWeekNumber] = React.useState(getWeekOfMonth(moment()));
  const [monthNumber, setMonthNumber] = React.useState(moment().month() + 1);
  const handlePreviousWeek = async () => {
    // Lấy tuần hiện tại và tính toán tuần mới

    setCurrentWeek(prev => {
      const newWeek = moment(prev).subtract(1, 'week');
      const thuHai = newWeek.startOf('week').format('YYYY-MM-DD');
      const thuHaiPlusOne = newWeek.clone().add(1, 'day').format('YYYY-MM-DD');
      const chuNhat = newWeek.endOf('week').format('YYYY-MM-DD');
      const chuNhatPlusOne = newWeek
        .clone()
        .endOf('week')
        .add(1, 'day')
        .format('YYYY-MM-DD');
      // Cập nhật giá trị cho prevMonday và prevSunday
      setPrevMonday(thuHaiPlusOne);
      setPrevSunday(chuNhatPlusOne);
      // Cập nhật tuần và tháng ngay tại đây
      updateWeek(newWeek)
      fetchTasks(thuHaiPlusOne, chuNhatPlusOne);

      // Trả về tuần mới
      return newWeek;
    });
  };
  const updateWeek = async(date)=>{
    const newDate = moment(date).subtract(1, 'week');
    const newWeekNumber = getWeekOfMonth(newDate);
    const newMonthNumber = newDate.month() + 1;
    console.log(newWeekNumber);
    // Cập nhật tuần và tháng
    setWeekNumber(newWeekNumber);
    setMonthNumber(newMonthNumber);
  }
  const fetchTasks = async (startDate, endDate) => {
    console.log(startDate);
    console.log(endDate);
    try {
      const response = await axiosInstance.post(
        `/search-task-tong-quan?startDate=${startDate}&endDate=${endDate}`,
        {},
        {
          headers: {
            accept: '*/*',
          },
        },
      );
      if (response.data.code == 200) {
        setTask(response.data.data);
      } else {
        setTask([]);
      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
    }
  };
  const fetchTasksWeek = async () => {
    try {
      const response = await axiosInstance.get('/tasks-for-week');

      if (response.data.code == 200) {
        setTask(response.data.data);
      } else {
        setTask([]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleCurrentWeek = async () => {
    try {
      const currentWeekMoment = moment().tz('Asia/Ho_Chi_Minh').startOf('week');
      setCurrentWeek(currentWeekMoment);
      setWeekNumber(getWeekOfMonth(currentWeekMoment));
      setMonthNumber(currentWeekMoment.month() + 1);

      await fetchTasksWeek();
    } catch (error) {
      console.error('Lỗi khi gọi API cho tuần hiện tại:', error);
    }
  };

  const HandleEdit = () => {
    navigation.navigate('EditTaskTongQuan', {tasks});
  };

  useFocusEffect(
    React.useCallback(() => {
      handleCurrentWeek();
    }, []),
  );

  // Calculate the current week of the month

  return (
    <GestureHandlerRootView>
      <PanGestureHandler>
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handlePreviousWeek}>
              <Text style={styles.buttonText}>Tuần trước</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleCurrentWeek}>
              <Text style={styles.buttonText}>Tuần này</Text>
            </TouchableOpacity>
          </View>
          {weekNumber && (
            <View style={styles.header}>
              <Text style={styles.weekTitle}>
                Tuần {weekNumber} tháng {monthNumber}
              </Text>
            </View>
          )}

          <ScrollView style={styles.container}>
            {tasks && tasks.length > 0 ? (
              tasks.map(item => (
                <View key={item.taskIDTongQuanTuan}>
                  <TaskItem task={item} />
                </View>
              ))
            ) : (
              <View style={styles.noTasksContainer}>
                <Text style={styles.noTasksText}>Không có task</Text>
              </View>
            )}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  // Các kiểu dáng khác
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noTasksText: {
    fontSize: 18,
    color: 'red',
  },

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
