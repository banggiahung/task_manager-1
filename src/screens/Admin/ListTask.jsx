import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Theme from '../../configs/color';
import axiosInstance from '../../configs/axios';
import TaskItem from '../../components/TaskItem';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
const screenHeight = Dimensions.get('window').height;
const containerHeight = screenHeight * 0.5;
function ListTask() {
  const scrollViewRef = React.useRef(null);
  const [tasks, setTask] = React.useState([]);
  const [currentWeek, setCurrentWeek] = React.useState(moment());
  const navigation = useNavigation();
  const [selectedTime, setSelectedTime] = React.useState(new Date());
  const [showMakePicker, setShowMakePicker] = React.useState(false);
  const [prevMonday, setPrevMonday] = React.useState(moment());
  const [prevSunday, setPrevSunday] = React.useState(moment());

  const getWeekOfMonth = date => {
    console.log(date)
    const newDate = moment(date).add(1, 'day')

    const weekOfMonth = moment(newDate).isoWeek();
    const startOfMonth = moment(newDate).startOf('month').isoWeek();
    return weekOfMonth - startOfMonth; // Return the week number in the month
  };
  const [firstDate, setFirstDate] = React.useState(() => {
    // Lấy ngày hôm nay
    const today = moment().tz('Asia/Ho_Chi_Minh');

    // Lấy ngày Thứ 2 của tuần hiện tại
    const firstDayOfWeek = today.startOf('isoWeek'); // Thứ 2 của tuần hiện tại

    return firstDayOfWeek.toDate(); // Chuyển sang đối tượng Date
  });
  const [lastDate, setLastDate] = React.useState(new Date());

  const onFirstDateChange = (event, selectedTime) => {
    if (selectedTime) {
      setFirstDate(selectedTime);
    }
  };
  const confirmFirstDate = () => {
    const formattedDate = moment(firstDate)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    setShowMakePicker(false);
    createWeekData(0);
  };
  const createWeekData = async (weekOffset = 0, choseDate) => {
    let startDate;
    if (choseDate) {
      console.log('choseDate', choseDate);

      startDate = moment(choseDate).tz('Asia/Ho_Chi_Minh').startOf('day');
    } else {
      console.log('firstDate', firstDate);

      startDate = moment(firstDate).tz('Asia/Ho_Chi_Minh').startOf('day');
    }
    // Sử dụng firstDate (ngày bắt đầu) thay vì startOf('isoWeek')
    const dayOfWeek = startDate.isoWeekday();

    if (dayOfWeek !== 1) {
      startDate.subtract(dayOfWeek - 1, 'days');
    }

    const startOfWeek = startDate.clone();
    const endOfWeek = startDate.clone().add(6, 'days'); // Lấy ngày Chủ nhật

    setFirstDate(new Date(startOfWeek.format('YYYY-MM-DDTHH:mm:ss')));
    setLastDate(new Date(endOfWeek.format('YYYY-MM-DDTHH:mm:ss')));

    console.log('Ngày đầu tuần:', startOfWeek.format('YYYY-MM-DD'));
    console.log('Ngày cuối tuần:', endOfWeek.format('YYYY-MM-DD'));
    fetchTasks(
      startOfWeek.format('YYYY-MM-DD'),
      endOfWeek.format('YYYY-MM-DD'),
    );
    updateWeek(startOfWeek.format('YYYY-MM-DD'));
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
      fetchTasks(thuHai, chuNhat);
      setFirstDate(new Date(thuHai));
      // Trả về tuần mới
      return newWeek;
    });
  };
  const updateWeek = async date => {
    console.log("date",date)
    const newDate = moment(date).add(1, 'day')
    // Lấy số tuần trong tháng và tháng từ adjustedDate
    const newWeekNumber = getWeekOfMonth(newDate);
    const newMonthNumber = newDate.month() + 1;
    console.log("newWeekNumber",newWeekNumber);
    // Cập nhật tuần và tháng
    setWeekNumber(newWeekNumber);
    setMonthNumber(newMonthNumber);
  };
  React.useEffect(() => {}, [firstDate, weekNumber, monthNumber, currentWeek]);
  const fetchTasks = async (startDate, endDate) => {
    updateWeek(startDate);

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
        console.log('đây là data', response.data.data);
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
      const currentWeekMoment = moment().tz('Asia/Ho_Chi_Minh');
      console.log('currentWeekMoment', currentWeekMoment);
      setCurrentWeek(currentWeekMoment);
      setWeekNumber(getWeekOfMonth(currentWeekMoment));
      setMonthNumber(currentWeekMoment.month() + 1);
      setFirstDate(currentWeekMoment);
      await createWeekData(0, currentWeekMoment);
    } catch (error) {
      console.error('Lỗi khi gọi API cho tuần hiện tại:', error);
    }
  };

  const HandleEdit = () => {
    navigation.navigate('EditTaskTongQuan', {tasks});
  };

  useFocusEffect(
    React.useCallback(() => {
      // handleCurrentWeek()
    }, []),
  );
  React.useEffect(() => {
    // Tìm phần tử có isToday
    const todayTask = tasks.find(task =>
      moment().isSame(moment(task.datetimeTask), 'day'),
    );

    if (scrollViewRef.current) {
      if (todayTask) {
        // Nếu tìm thấy task có isToday, cuộn đến phần tử đó
        const todayIndex = tasks.indexOf(todayTask);
        scrollViewRef.current.scrollTo({y: todayIndex * 100, animated: true}); // Điều chỉnh giá trị y nếu cần
      } else {
        // Nếu không tìm thấy task có isToday, cuộn lên đầu
        scrollViewRef.current.scrollTo({y: 0, animated: true});
      }
    }
  }, [tasks]);

  // Calculate the current week of the month

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{flex: 1}}>
      <TouchableOpacity onPress={() => setShowMakePicker(true)}>
        <View style={styles.DateTimeMain}>
          <Text style={[styles.labelMore]}>Đầu tuần</Text>
          <TextInput
            style={[styles.inputMore]}
            placeholder="Đầu tuần"
            value={moment(firstDate)
              .tz('Asia/Ho_Chi_Minh')
              .format('DD-MM-YYYY')}
            editable={false}
          />
        </View>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePreviousWeek}>
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
      <View style={styles.containerScroll}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.containerMainScoll}
          style={styles.container}>
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
      </View>

      <View style={styles.containerButton}>
        <TouchableOpacity style={styles.button} onPress={HandleEdit}>
          <Text style={styles.buttonText}>Cập nhật</Text>
        </TouchableOpacity>
      </View>
      {showMakePicker && (
        <Modal
          transparent={true}
          visible={showMakePicker}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  DateTimeMain: {
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    borderTopWidth: 0,
  },
  containerScroll: {
    height: containerHeight,
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  containerMainScoll: {
    paddingBottom: 20,
  },
  containerMain: {
    padding: 0,
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
    paddingBottom: 20,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
});

export default ListTask;
