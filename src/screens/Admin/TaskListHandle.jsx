import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../configs/axios';
import moment from 'moment-timezone'; // Thay thế date-fns bằng moment
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {Swipeable, GestureHandlerRootView} from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import Loading from '../../components/Loading';

function TaskListHandle() {
  const navigation = useNavigation();
  const route = useRoute();
  const {user, taskType} = route.params;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const swipeableRefs = useRef([]);
  const [openSwipeableIndex, setOpenSwipeableIndex] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  useEffect(() => {
    filterAndSortTasks();
  }, [searchQuery, sortOrder, tasks]);
  const filterAndSortTasks = () => {
    setLoading(true); 
    let updatedTasks = [...tasks];

    // Lọc task theo search query
    if (searchQuery) {

      updatedTasks = updatedTasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    }

    // Sắp xếp task
    updatedTasks.sort((a, b) => {

      if (sortOrder === 'newest') {

        return new Date(b.createDate) - new Date(a.createDate);
        
      } else {
        return new Date(a.createDate) - new Date(b.createDate);
      }

    });

    setFilteredTasks(updatedTasks);

  };
  useEffect(() => {
    if (isFocused) {
      // Đóng tất cả Swipeable khi màn hình được focus
      swipeableRefs.current.forEach(ref => ref?.close());
    }
  }, [isFocused]);
  const fetchData = async () => {
    try {
      setLoading(true);
      let url = '';

      if (taskType === 'Hoàn thành') {
        url = `/get-thong-ke/hoan-thanh?UserID=${user?.id}`;
      } else {
        url = `/get-thong-ke/roi-lich?UserID=${user?.id}`;
      }
      const response = await axiosInstance.get(url);

      const newData = response.data;
      setLoading(false);
      if (newData.daHoanThanh && newData.daHoanThanh != null) {
        setTasks(newData.daHoanThanh);
      } else {
        setTasks(newData.roiLich);
      }
    } catch (error) {
      console.error('Error sending UserID:', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [user]),
  );
  const handleDetails = taskId => {
    navigation.navigate('ChiTietTaskUser', {user, taskId});
  };
  const handleDelete = taskId => {
    const url = `/delete-task-user?TaskID=${taskId}`;
    axiosInstance
      .post(url)
      .then(response => {
        console.log(response.data);
        if (response.data.code === 200) {
          Toast.show({
            type: 'success',
            text1: 'Đã xoá thành công',
            visibilityTime: 2000,
          });
          setTasks(prevTasks => {
            const updatedTasks = [...prevTasks]; // Tạo bản sao mảng
            const index = updatedTasks.findIndex(
              task => task.taskID === taskId,
            );
            if (index !== -1) {
              updatedTasks.splice(index, 1);
            }
            return updatedTasks;
          });
        } else {
          Toast.show({
            type: 'error',
            text1: response.data.message,
            text2: response.data.data,
            text2Style: {
              fontWeight: '700',
              color: 'black',
            },
            visibilityTime: 3000,
          });
        }
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
  };
  const handleSwipeOpen = index => {
    // Đóng item trước đó nếu có
    if (openSwipeableIndex !== null && openSwipeableIndex !== index) {
      swipeableRefs.current[openSwipeableIndex]?.close();
    }
    // Cập nhật index của item đang mở
    setOpenSwipeableIndex(index);
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm task"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              sortOrder === 'newest' && styles.activeButton,
            ]}
            onPress={() => setSortOrder('newest')}>
            <Text style={styles.buttonText}>Mới nhất</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              sortOrder === 'oldest' && styles.activeButton,
            ]}
            onPress={() => setSortOrder('oldest')}>
            <Text style={styles.buttonText}>Cũ nhất</Text>
          </TouchableOpacity>
        </View>

        {filteredTasks == null || filteredTasks.length === 0 ? (
          <View>
            <Text style={styles.noTasksText}>Không có task nào </Text>
          </View>
        ) : (
          <View style={styles.listItem}>
            <FlatList
              data={tasks}
              keyExtractor={item => item.taskID.toString()}
              renderItem={({item, index}) => {
                const renderRightActions = () => (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.taskID)}>
                    <View>
                      <Text style={styles.deleteButtonText}>Xóa</Text>
                    </View>
                  </TouchableOpacity>
                );
                const renderLeftActions = () => (
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleDetails(item.taskID)}>
                    <View>
                      <Text style={styles.detailButtonText}>Tiến độ</Text>
                    </View>
                  </TouchableOpacity>
                );

                return (
                  <Swipeable
                    ref={ref => (swipeableRefs.current[index] = ref)}
                    renderLeftActions={renderLeftActions}
                    renderRightActions={renderRightActions}
                    onSwipeableClose={() => setOpenSwipeableIndex(null)}
                    onSwipeableOpen={() => handleSwipeOpen(index)}>
                    <TouchableOpacity
                      style={styles.taskItem}
                      onPress={() =>
                        navigation.navigate('TaskDetail', {
                          task: item,
                          user: user,
                        })
                      }>
                      <View style={styles.taskContent}>
                        <Text style={styles.taskTitle}>{item.title}</Text>
                        <Text style={styles.taskDescription}>
                          Lý do: {item.comments.comment}
                        </Text>
                      </View>

                      <View style={styles.rightContent}>
                        <Text style={styles.createDateText}>
                          {moment(item.comments.createdAt)
                            .tz('Asia/Ho_Chi_Minh')
                            .format('HH:mm DD-MM-YYYY')}
                        </Text>
                        <View style={styles.statusContainer}>
                          <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Swipeable>
                );
              }}
            />
          </View>
        )}
        <Toast />
      </View>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  containerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  w100: {
    width: '48%',
    marginVertical: 10,
  },
  square: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  datetimePicker: {
    color: 'red',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  userIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 8,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskDescription: {
    color: '#666',
  },
  statusContainer: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noTasksText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
    marginTop: 20,
  },
  createDateText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff', 
    fontSize: 16,
  },
  button: {
    padding: 12,

    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
export default TaskListHandle;
