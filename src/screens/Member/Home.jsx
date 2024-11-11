import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';

import {useNavigation,useFocusEffect} from '@react-navigation/native';
import axiosInstance from '../../configs/axios';
import {storeData, getData} from '../../configs/asyncStorage';
import Header from '../../components/Header';
import TaskItem from '../../components/TaskItem.jsx';
import Theme from '../../configs/color';
import moment from 'moment';
import * as FeatherIcons from 'react-native-feather';

const screenHeight = Dimensions.get('window').height;
const containerHeight = screenHeight * 0.7;
function Home() {
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();
  const [task, setTask] = useState();
  const [selected, setSelected] = useState(0);
  const [totalTask, setTotalTask] = useState();
  const [task_user, setTaskUser] = useState([]);
  const scrollViewRef = useRef(null);
  const getWeekOfMonth = () => {
    const weekOfMonth = moment().isoWeek();
    const startOfMonth = moment().startOf('month').isoWeek();
    return weekOfMonth - startOfMonth + 1;
  };

  const weekNumber = getWeekOfMonth();
  const monthName = moment().format('MMMM');
  const monthNumber = moment().month() + 1;
  const fetchData = async () => {
    const storedUserId = await getData('userId');
    console.log(storedUserId);
    setUserId(storedUserId);
  };
  const [firstDate, setFirstDate] = useState(() => {
    const today = moment().tz('Asia/Ho_Chi_Minh');

    const firstDayOfWeek = today.startOf('isoWeek');

    return firstDayOfWeek.toDate();
  });
  const [lastDate, setLastDate] = useState(new Date());
  const createWeekData = async (weekOffset = 0) => {
    // Sử dụng firstDate (ngày bắt đầu) thay vì startOf('isoWeek')
    const startDate = moment(firstDate).tz('Asia/Ho_Chi_Minh').startOf('day');

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
    await fetchTaskTongQuan(
      startOfWeek.format('YYYY-MM-DD'),
      endOfWeek.format('YYYY-MM-DD'),
    );
  };
  const fetchTaskTongQuan = async (startDate, endDate) => {
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
      console.log(response.data)
      if (response.data.code == 200) {
        setTotalTask(response.data.data);
      } else {
        setTotalTask([]);

      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
    }
    // await axiosInstance.get(`/tasks-for-week`).then(res => {
    //   console.log(res.data.data);
    //   if (scrollViewRef.current) {
    //     const todayTaskIndex = totalTask.findIndex(item =>
    //       moment().isSame(moment(item.datetimeTask), 'day'),
    //     );

    //     if (todayTaskIndex !== -1) {
    //       scrollViewRef.current.scrollTo({
    //         y: todayTaskIndex * 100,
    //         animated: true,
    //       });
    //     }
    //   }
    // });
  };
  const fetchTaskUser = async () => {
    // if (userId) {
    //   await axiosInstance
    //     .get(`/get-list-task-user?UserID=${userId}`)
    //     .then(res => {
    //       console.log(res.data.data);
    //       setTotalTask(res.data.data);
    //     });
    // }
    navigation.navigate('ListTaskByUser', {userId: userId});
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );
   useEffect(() => {
    createWeekData();
   
   }, []);
  const handlePress = async () => {
    const role = await getData('role');
    const cleanRole = role
      .replaceAll('[', '')
      .replaceAll(']', '')
      .replaceAll('"', '')
      .replaceAll('\\', '');
    console.log(role);
    if (cleanRole == 'Admin') {
      navigation.navigate('Main', {screen: 'Dashboard'});
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <TouchableOpacity onPress={handlePress} style={styles.headerContainer}>
          <Header title={`Tuần ${weekNumber} tháng ${monthNumber}`} />
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.active]}
            onPress={fetchTaskTongQuan}>
            <Text style={styles.buttonWhite}>Tổng quan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.noneActive]}
            onPress={fetchTaskUser}>
            <Text style={styles.buttonDark}>Task hôm nay</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.paddingScoll}
            ref={scrollViewRef}
            style={styles.taskContainer}>
            {totalTask && totalTask.length > 0 ? (
              totalTask.map((item, index) => (
                <TaskItem task={item} key={index} />
              ))
            ) : (
              <Text style={styles.noDataText}>Không có task tuần này</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  paddingScoll: {
    paddingBottom: 90,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 8,
  },
  scrollView: {
    marginTop: 16,
    width: '100%',
    height: '100%',
  },

  buttonContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  active: {
    backgroundColor: '#C6E6F1',
  },
  noneActive: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonWhite: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  buttonDark: {
    color: '#2C5364',
  },
  container: {
    height: containerHeight,
    paddingBottom: 20,
    padding: 16,
    borderRadius: 40,
    backgroundColor: Theme.primary,
  },
  taskContainer: {
    gap: 16,
    marginTop: 16,
    padding: 8,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
  },
});

export default Home;
