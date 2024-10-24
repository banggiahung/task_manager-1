import React, {useEffect, useState} from 'react';
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

function Home() {
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();
  const [task, setTask] = useState();
  const [selected, setSelected] = useState(0);
  const [totalTask, setTotalTask] = useState();
  const [task_user, setTaskUser] = useState([]);

  const fetchData = async () => {
    const storedUserId = await getData('userId');
    setUserId(storedUserId);
  };

  useEffect(() => {
    fetchData();

    axiosInstance.get(`/tasks-for-week`).then(res => {
      console.log(res.data.data);
      setTotalTask(res.data.data);
    });

    if (userId) {
      axiosInstance.get(`/get-list-task-user?UserID=${userId}`).then(res => {
        console.log(res.data.data);
        setTotalTask(res.data.data);
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scrollView}>
        <Header title={''} />

        <View style={styles.overviewContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Tổng quan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Task hôm nay</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.container}>
          <ScrollView style={styles.taskContainer}>
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
  overviewContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    padding: 16,
    marginBottom:20
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    width: '100%',
    minHeight: 800,
    padding: 16,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: Theme.primary,
  },
  taskContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    padding: 8,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 'auto',
  },
});

export default Home;
