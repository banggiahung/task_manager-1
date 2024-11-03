import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import axiosInstance from '../../configs/axios';
import {storeData, getData} from '../../configs/asyncStorage';
import Header from '../../components/Header';
import TaskItem from '../../components/TaskItem.jsx';
import Theme from '../../configs/color';
import moment from 'moment';
import * as FeatherIcons from 'react-native-feather';

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
    setUserId(storedUserId);
  };

  const fetchTaskTongQuan = async () => {
    await axiosInstance.get(`/tasks-for-week`).then(res => {
      console.log(res.data.data);
      setTotalTask(res.data.data);
      if (scrollViewRef.current) {
        const todayTaskIndex = totalTask.findIndex(item =>
          moment().isSame(moment(item.datetimeTask), 'day'),
        );

        if (todayTaskIndex !== -1) {
          scrollViewRef.current.scrollTo({
            y: todayTaskIndex * 100,
            animated: true,
          });
        }
      }
    });
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
    navigation.navigate('ListTaskByUser', { userId: userId });


  };
  useEffect(() => {
    fetchData();
    fetchTaskTongQuan();
  }, []);
  const handlePress = () => {
    navigation.navigate('Main', {screen: 'Dashboard'});
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <TouchableOpacity onPress={handlePress} style={styles.headerContainer}>
          <Header title={`Tuần ${weekNumber} tháng ${monthNumber}`} />
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.active]} onPress={fetchTaskTongQuan}>
            <Text style={styles.buttonWhite}>Tổng quan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button,styles.noneActive]} onPress={fetchTaskUser}>
            <Text style={styles.buttonDark}>Task hôm nay</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <ScrollView ref={scrollViewRef} style={styles.taskContainer}>
            {totalTask &&
              totalTask.map((item, index) => (
                <TaskItem task={item} key={index} />
              ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  active:{
    backgroundColor: '#C6E6F1',

  },
  noneActive:{
    borderWidth: 1,
    borderColor: '#ccc'
  },
  buttonWhite: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  buttonDark: {
    color: '#2C5364',
  },
  container: {
    minHeight: 800,
    padding: 16,
    borderRadius: 40,
    overflow: 'hidden',
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
