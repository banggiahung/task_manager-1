import * as React from 'react';
import {View, Text, StyleSheet, ScrollView, Button} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Theme from '../../configs/color';
import axiosInstance from '../../configs/axios';
import TaskItem from '../../components/TaskItem';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

function ListTask() {
  const [tasks, setTask] = React.useState([]);
  const navigation = useNavigation()

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get('/tasks-for-week');
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
    console.log("chuyen trang")
    navigation.navigate("FormTask", {tasks})
  };

  React.useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PanGestureHandler onGestureEvent={handleGesture}>
        <SafeAreaView style={{flex: 1}}>
          <Header title={'Tong quan job tuan nay'} />
          <ScrollView style={styles.container}>
            {tasks &&
              tasks.map((item, index) => (
                <View key={item.taskIDTongQuanTuan}>
                  <TaskItem task={item} />
                </View>
              ))}
          </ScrollView>
          <View style={styles.containerButton}>
            <Button onPress={HandleEdit} title="Cap nhap"></Button>
          </View>
        </SafeAreaView>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    marginTop: 10,
    padding: 10,
    borderRadius: 20,
    maxHeight: '80%',
    backgroundColor: Theme.secondary,
  },
  containerButton: {},
});

export default ListTask;
