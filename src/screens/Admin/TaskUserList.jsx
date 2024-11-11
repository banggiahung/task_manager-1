import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Modal,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../configs/axios';
import moment from 'moment-timezone'; // Thay thế date-fns bằng moment
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {Swipeable, GestureHandlerRootView} from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
const screenHeight = Dimensions.get('window').height;
const containerHeight = screenHeight * 0.5;
function TaskUserList() {
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paramPage, setParamPage] = useState({});
  const route = useRoute();
  const user = route.params?.user;
  const returnPage = route.params?.returnPage;
  const [tasks, setTasks] = useState([]);
  const [tasksHoanThanh, setTasksHoanThanh] = useState(0);
  const [tasksHoanThanhNotKPI, setTasksHoanThanhNotKPI] = useState(0);
  const [tasksRoiLich, setTasksRoiLich] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    moment().tz('Asia/Ho_Chi_Minh').toDate(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(
    moment().tz('Asia/Ho_Chi_Minh').toDate(),
  );
  const isFocused = useIsFocused();
  const swipeableRefs = useRef([]);
  const [openSwipeableIndex, setOpenSwipeableIndex] = useState(null);
  useEffect(() => {
    if (isFocused) {
      // Đóng tất cả Swipeable khi màn hình được focus
      swipeableRefs.current.forEach(ref => ref?.close());
    }
  }, [isFocused]);
   useEffect(() => {
    fetchTasks();

   }, [user, page]);
  useFocusEffect(
    React.useCallback(() => {
      // if (flatListRef.current) {
      //   flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      //   // handleRefresh();
      // }
      // handleRefresh();
      // handleRefresh();
      sendUserID();
    }, [user, page]),
  );
  const sendUserID = async () => {
    try {
      const response = await axiosInstance.post(
        '/get-thong-ke',
        JSON.stringify(user.id),
        {
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json',
          },
        },
      );
      const newData = response.data;
      console.log(newData)
      if (newData.daHoanThanh > 0) {
        setTasksHoanThanh(newData.daHoanThanh);
      }
      if (newData.roiLich > 0) {
        setTasksRoiLich(newData.roiLich);
      }
      if(newData.hoanThanhNotKPI > 0){
        setTasksHoanThanhNotKPI(newData.hoanThanhNotKPI)
      }
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error sending UserID:', error);
    }
  };
  const handleSwipeOpen = index => {
    // Đóng item trước đó nếu có
    if (openSwipeableIndex !== null && openSwipeableIndex !== index) {
      swipeableRefs.current[openSwipeableIndex]?.close();
    }
    // Cập nhật index của item đang mở
    setOpenSwipeableIndex(index);
  };
  const fetchTasks = () => {
    console.log(page);
    console.log(totalPage);
    if(totalPage != 0 && page > totalPage) return;
    const formattedDate = moment(selectedDate)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DD');
    console.log('formattedDate', formattedDate);
    const url = `/get-list-task-user-main?UserID=${encodeURIComponent(user.id)}&Page=${page}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}`;
    setRefreshing(true);

    console.log(url);
    axiosInstance
      .get(url)
      .then(response => {
        setRefreshing(false);
        const newTasks = response.data.data;
        console.log(newTasks)
        setTasks(prevTasks => {
          // Đảm bảo prevTasks không phải là undefined bằng cách cung cấp một mảng trống làm giá trị mặc định
          const uniqueNewTasks = newTasks.filter(
            newTask => !(prevTasks || []).some(
              existingTask => existingTask.taskID === newTask.taskID
            ),
          );
        
          // Nếu có task mới sau khi lọc, thêm vào mảng `prevTasks`
          if (uniqueNewTasks.length > 0) {
            // Kết hợp các task cũ và task mới
            const allTasks = [...(prevTasks || []), ...uniqueNewTasks];
        
            // // Lấy ngày hiện tại để sắp xếp các task theo dueDate
            // const now = moment().startOf('day');
        
            // // Sắp xếp `allTasks` với điều kiện:
            // allTasks.sort((a, b) => {
            //   // Kiểm tra status của task
            //   const isACompleted = a.status === "Đã giao";
            //   const isBCompleted = b.status === "Đã giao";
        
            //   // Đặt các task "Đã giao" lên đầu
            //   if (isACompleted && !isBCompleted) return -1; // `a` lên đầu
            //   if (!isACompleted && isBCompleted) return 1;  // `b` lên đầu
        
            //   // Nếu cả hai task đều chưa hoặc đều đã "Đã giao", sắp xếp theo `dueDate`
            //   const aDueDate = moment(a.dueDate, 'YYYY-MM-DD');
            //   const bDueDate = moment(b.dueDate, 'YYYY-MM-DD');
        
            //   // Sắp xếp các task chưa "Đã giao" theo `dueDate` gần nhất trước
            //   return aDueDate.diff(bDueDate);
            // });
        
            return allTasks;
          }
        
          // Nếu không có task mới, trả về prevTasks hiện tại
          return prevTasks || [];
        });
        setTotalPage(response.data.pagination.totalPages); // Cập nhật tổng số trang

        // // Nếu có task mới sau khi lọc, thêm vào mảng `tasks`
        // if (uniqueNewTasks.length > 0) {
        //   setTasks(prevTasks => [...prevTasks, ...uniqueNewTasks]);
        //   setTotalPage(response.data.pagination.totalPages); // Cập nhật tổng số trang
        // }
      })
      .catch(error => {
        setRefreshing(false);

        console.error('Error fetching tasks:', error);
      });
  };
  const fetchTasksRefresh = () => {
    setPage(1); 
    
  
    const url = `/get-list-task-user-main?UserID=${encodeURIComponent(user.id)}&Page=1&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}`;
    setRefreshing(true);

    console.log(url);
    axiosInstance
      .get(url)
      .then(response => {
        setRefreshing(false);
        const newTasks = response.data.data;
        console.log(newTasks)
        setTasks(() => {
          // Xóa hết các task cũ và thêm task mới
          const allTasks = [...newTasks];
  
          // Lấy ngày hiện tại
          // const now = moment().startOf('day');
        
          //   // Sắp xếp `allTasks` với điều kiện:
          //   allTasks.sort((a, b) => {
          //     // Kiểm tra status của task
          //     const isACompleted = a.status === "Đã giao";
          //     const isBCompleted = b.status === "Đã giao";
        
          //     // Đặt các task "Đã giao" lên đầu
          //     if (isACompleted && !isBCompleted) return -1; // `a` lên đầu
          //     if (!isACompleted && isBCompleted) return 1;  // `b` lên đầu
        
          //     // Nếu cả hai task đều chưa hoặc đều đã "Đã giao", sắp xếp theo `dueDate`
          //     const aDueDate = moment(a.dueDate, 'YYYY-MM-DD');
          //     const bDueDate = moment(b.dueDate, 'YYYY-MM-DD');
        
          //     // Sắp xếp các task chưa "Đã giao" theo `dueDate` gần nhất trước
          //     return aDueDate.diff(bDueDate);
          //   });
        
            return allTasks;
        });
        setTotalPage(response.data.pagination.totalPages); 
        // // Nếu có task mới sau khi lọc, thêm vào mảng `tasks`
        // if (uniqueNewTasks.length > 0) {
        //   setTasks(prevTasks => [...prevTasks, ...uniqueNewTasks]);
        //   setTotalPage(response.data.pagination.totalPages); // Cập nhật tổng số trang
        // }
      })
      .catch(error => {
        setRefreshing(false);

        console.error('Error fetching tasks:', error);
      });
  };
  const onDateChange = (event, selected) => {
    if (event.type === 'set') {
      const adjustedDate = selected ? new Date(selected) : tempDate;
      setTempDate(adjustedDate);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleConfirmDate = () => {
    setSelectedDate(tempDate);
    setShowDatePicker(false);
  };
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
            const updatedTasks = [...prevTasks];
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
  const handleDetailsTask = type => {
    navigation.navigate('TaskListHandle', {
      user: user,
      taskType: type,
    });
  };
  // Định dạng ngày cho hiển thị
  const formattedSelectedDate = moment(selectedDate)
    .tz('Asia/Ho_Chi_Minh')
    .format('DD-MM-YYYY');
  const handleLoadMore = () => {
    if (page < totalPage) {
      setPage(prevPage => prevPage + 1);
    }
  };
  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasksRefresh(); // Tải dữ liệu từ trang đầu tiên
  };
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        <View style={styles.containerRow}>
          <TouchableOpacity style={styles.w100}>
            <LinearGradient
              colors={['#ff7e5f', '#feb47b']}
              style={styles.square}>
              <Text style={styles.text}>
                Nhân viên: {user?.fullName || 'Nhân viên không tên'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.w100}>
            <LinearGradient
              colors={['#86e3ce', '#91eae4']}
              style={styles.square}>
              <Text style={styles.text}>KPI: {user?.kpiUser}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.w100}
            onPress={() => handleDetailsTask('Hoàn thành')}>
            <LinearGradient
              colors={['#6a11cb', '#2575fc']}
              style={styles.square}>
              <Text style={styles.text}>Task hoàn thành</Text>

              <Text style={styles.text}>
                {tasksHoanThanhNotKPI >= 0 ? tasksHoanThanhNotKPI : '0'}/
                {user?.kpiUser}
              </Text>
              <Text style={styles.text}>
                {user?.kpiUser > 0
                  ? `(${Math.round((tasksHoanThanh / user.kpiUser) * 100)}%)`
                  : '(Chưa có KPI)'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.w100}
            onPress={() => handleDetailsTask('Rời lịch')}>
            <LinearGradient
              colors={['#ff6a00', '#ee0979']}
              style={styles.square}>
              <Text style={styles.text}>Task rời lịch</Text>

              <Text style={styles.text}>
                {tasksRoiLich > 0 ? tasksRoiLich : '0'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          {/* <Button title="Chọn ngày" onPress={() => setShowDatePicker(true)} /> */}
          <Button
            title="Thêm Task"
            onPress={() => navigation.navigate('ImportTask', {user})}
          />
        </View>

        <Modal visible={showDatePicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                style={styles.datetimePicker}
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                locale="vi"
                textColor={'#000000'}
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmDate}>
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {tasks == null || tasks.length === 0 ? (
          <View>
            <Text style={styles.noTasksText}>
              Không có task nào của {user.fullName}
            </Text>
          </View>
        ) : (
          <View style={styles.listItem}>
            <FlatList
            ref={flatListRef}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={tasks}
              keyExtractor={item => item.taskID}
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
                    onSwipeableOpen={() => handleSwipeOpen(index)} // Gọi hàm khi item được mở
                  >
                    <TouchableOpacity
                      style={styles.taskItem}
                      onPress={() =>
                        navigation.navigate('TaskDetail', {
                          task: item,
                          user: user,
                        })
                      }>
                      <View style={styles.taskContent}>
                        <Text
                          numberOfLines={2}
                          ellipsizeMode="tail"
                          style={styles.taskTitle}>
                          {item.title}
                        </Text>
                        <Text
                          numberOfLines={2}
                          ellipsizeMode="tail"
                          style={styles.taskDescription}>
                          {item.description}
                        </Text>
                      </View>

                      <View style={styles.rightContent}>
                        <Text style={styles.createDateText}>
                          {moment(item.dueDate)
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
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          </View>
        )}
        <Toast />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  listItem: {
    height: containerHeight,
    paddingBottom: 20,
  },
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
    maxWidth: '80%',
  },
  taskDescription: {
    color: '#666',
    maxWidth: '80%',
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
    justifyContent: 'space-between',
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
});

export default TaskUserList;
