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
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../configs/axios';
import moment from 'moment-timezone'; // Thay thế date-fns bằng moment
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {
  Swipeable,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {CalendarList, Calendar} from 'react-native-calendars';
import Loading from '../../components/Loading';

const screenHeight = Dimensions.get('window').height;
const containerHeight = screenHeight * 0.5;
const paddingBottom = screenHeight * 0.1;
function TaskUserList() {
  const flatListRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showCalender, setShowCalender] = useState(false);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingOld, setRefreshingOld] = useState(false);

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
  const [selectedDateCalendar, setSelectedDateCalendar] = useState(null);
  const [todayDate, setTodayDate] = useState(false);
  const handleDayPress = async day => {
    setSelectedDateCalendar(day.dateString);
    let url = '';
    url = `/get-list-group-user?UserID=${encodeURIComponent(
      user.id,
    )}&Page=${page}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}&chooseDate=${encodeURIComponent(
      day.dateString,
    )}`;
    const response = await axiosInstance.get(url);
    const newTasks = response.data.data;
    if (newTasks.tasks.length > 0) {
      setTasks([newTasks]);
    } else {
      setPage(1);
      setTodayDate(false);

      setTasks([]);
    }
  };
  const handleMonthChange = async month => {
    const currentMonth = moment().format('YYYY-MM'); // Lấy tháng hiện tại theo định dạng 'YYYY-MM'
    const selectedMonth = month.dateString.slice(0, 7); // Lấy tháng được chọn từ dateString

    let url = '';

    // Kiểm tra nếu tháng được chọn là tháng hiện tại
    if (selectedMonth === currentMonth) {
      setTodayDate(true);

      await fetchTasksRefresh();
      return;
    } else {
      setPage(1);

      const firstDayOfMonth = moment(month.dateString)
        .startOf('month')
        .format('YYYY-MM-DD');

      // Gọi API cho tháng khác
      url = `/get-list-group-user?UserID=${encodeURIComponent(
        user.id,
      )}&Page=1&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}&chooseMonth=${encodeURIComponent(
        firstDayOfMonth,
      )}`;
    }
    const response = await axiosInstance.get(url);
    const newTasks = response.data.data;
    if (response.data.code != 400) {
      setTasks(newTasks);
    } else {
      setTasks([]);
    }
  };

  useEffect(() => {
    if (isFocused) {
      // Đóng tất cả Swipeable khi màn hình được focus
      swipeableRefs.current.forEach(ref => ref?.close());
    }
  }, [isFocused]);
  useEffect(() => {
    fetchTasks(1);
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      // if (flatListRef.current) {
      //   flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      //   // handleRefresh();
      // }
      // handleRefresh();
      // handleRefresh();
      sendUserID();
    }, [user]),
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
      if (newData.daHoanThanh > 0) {
        setTasksHoanThanh(newData.daHoanThanh);
      }
      if (newData.roiLich > 0) {
        setTasksRoiLich(newData.roiLich);
      }
      if (newData.hoanThanhNotKPI > 0) {
        setTasksHoanThanhNotKPI(newData.hoanThanhNotKPI);
      }
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
  const fetchTasks = async pageNew => {
    console.log('selectedDateCalendar', selectedDateCalendar);
    if (selectedDateCalendar != null) {
      setPage(1);
      return;
    }
    let today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    console.log('page', page);
    console.log(totalPage);
    if (totalPage != 0 && page > totalPage) return;
    let url = '';
    console.log(todayDate);
    setRefreshing(true);
    setLoading(true);
    if (todayDate) {
      console.log('gọi vào đây');

      url = `/get-list-group-user?UserID=${encodeURIComponent(
        user.id,
      )}&Page=${pageNew}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}`;
    } else {
      console.log('gọi vào đây 2');

      url = `/get-list-group-user?UserID=${encodeURIComponent(
        user.id,
      )}&Page=${pageNew}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}&chooseDate=${encodeURIComponent(
        today,
      )}`;
      setTodayDate(true);
    }
    console.log('url', url);
    axiosInstance
      .get(url)
      .then(response => {
        setRefreshing(false);
        const newTasks = response.data.data;
        console.log(newTasks);
        setTasks(prevTasks => {
          let updatedTasks = Array.isArray(prevTasks) ? [...prevTasks] : [];
          if (updatedTasks.length > 0) {
            const isDateExisting = updatedTasks.some(
              item => item.date === newTasks.date,
            );
            if (!isDateExisting) {
              updatedTasks.push(newTasks);
            }
            updatedTasks.sort((a, b) => {
              if (a.date === today) return -1;
              if (b.date === today) return 1;
              return b.date.localeCompare(a.date);
            });

            return updatedTasks;
          }
          updatedTasks.push(newTasks);
          return updatedTasks;
        });

        setTotalPage(response.data.pagination.totalPages); // Cập nhật tổng số trang
        setLoading(false);
      })
      .catch(error => {
        setRefreshing(false);
        setLoading(false);

        console.error('Error fetching tasks:', error);
      });
  };

  const fetchTasksRefresh = () => {
    console.log('goij clear');
    setSelectedDateCalendar(null);

    setPage(1);
    let today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    const url = `/get-list-group-user?UserID=${encodeURIComponent(
      user.id,
    )}&Page=1&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}&chooseDate=${encodeURIComponent(
      today,
    )}`;
    setRefreshing(true);

    console.log(url);
    axiosInstance
      .get(url)
      .then(response => {
        setRefreshingOld(false);

        const newTasks = response.data.data;
        console.log(newTasks);
        setTasks([newTasks]);

        setTotalPage(response.data.pagination.totalPages);
        // // Nếu có task mới sau khi lọc, thêm vào mảng `tasks`
        // if (uniqueNewTasks.length > 0) {
        //   setTasks(prevTasks => [...prevTasks, ...uniqueNewTasks]);
        //   setTotalPage(response.data.pagination.totalPages); // Cập nhật tổng số trang
        // }
      })
      .catch(error => {
        setRefreshingOld(false);

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
  const formattedSelectedDate = moment(selectedDate)
    .tz('Asia/Ho_Chi_Minh')
    .format('DD-MM-YYYY');

  const handleLoadMore = async () => {
    console.log('đã gọi load more');
    console.log(page);
    console.log(totalPage);
    if (page <= totalPage) {
      setPage(prevPage => prevPage + 1);
      await fetchTasks(page);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    fetchTasksRefresh(); // Tải dữ liệu từ trang đầu tiên
  };
  const handleClearSelection = () => {
    setSelectedDateCalendar(null); // Hủy chọn ngày
    setPage(1);
    fetchTasksRefresh();
  };
  

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        {showCalender ? (
          <View>
            <Calendar
              locale={'vi'}
              markedDates={{
                [selectedDateCalendar]: {
                  selected: true,
                  selectedColor: '#ADD8E6',
                }, // Màu xanh nhạt
              }}
              onDayPress={handleDayPress}
              monthFormat={'yyyy MM'}
              markingType={'simple'}
              horizontal={true}
              pagingEnabled={true}
              onMonthChange={handleMonthChange}
            />
            <View style={styles.containerButton}>
              <TouchableOpacity  onPress={()=>handleClearSelection}>
                <Text style={styles.buttonTextLich}>Hủy chọn ngày</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setShowCalender(false)}>
                <Text style={styles.buttonTextLich}>Đóng lịch</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={()=> setShowCalender(true)}>
            <LinearGradient
              colors={['#007bff', '#007bff']}
              style={{width: '100%', padding: 10, borderRadius: 8}}>
              <Text style={{textAlign: 'center', color: '#fff'}}>Mở lịch</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {!showCalender && (
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
                <Text style={styles.text}>
                  KPI:
                  <Text style={styles.text}>
                    {tasksHoanThanh >= 0 ? tasksHoanThanh : '0'}/{user?.kpiUser}
                  </Text>
                  <Text style={styles.text}>
                    {user?.kpiUser > 0
                      ? `(${Math.round(
                          (tasksHoanThanh / user.kpiUser) * 100,
                        )}%)`
                      : '(Chưa có KPI)'}
                  </Text>
                </Text>
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
                  {tasksHoanThanhNotKPI >= 0 ? tasksHoanThanhNotKPI : '0'}
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
        )}

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
              contentContainerStyle={{paddingBottom: paddingBottom}}
              ref={flatListRef}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={tasks} // Main data array with date groups
              keyExtractor={item => item.date}
              refreshControl={
                <RefreshControl
                  refreshing={refreshingOld}
                  onRefresh={() => {
                    setRefreshingOld(true);
                    console.log('Refreshing data');
                    fetchTasksRefresh();
                  }}
                />
              }
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : null
              }
              renderItem={({item}) => {
                return (
                  <View>
                    <Text style={styles.dateHeader}>
                      {' '}
                      {moment(item.date).format('DD-MM-YYYY')}
                    </Text>

                    <FlatList
                      data={item.tasks} // Array of task objects for each date
                      keyExtractor={task => task.taskID.toString()}
                      renderItem={({item: task, index}) => {
                        const renderRightActions = () => (
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(task.taskID)}>
                            <View>
                              <Text style={styles.deleteButtonText}>
                                Delete
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );

                        const renderLeftActions = () => (
                          <TouchableOpacity
                            style={styles.detailButton}
                            onPress={() => handleDetails(task.taskID)}>
                            <View>
                              <Text style={styles.detailButtonText}>
                                Details
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );

                        return (
                          <Swipeable
                            key={task.taskID}
                            ref={ref => (swipeableRefs.current[index] = ref)}
                            renderLeftActions={renderLeftActions}
                            renderRightActions={renderRightActions}
                            onSwipeableClose={() => setOpenSwipeableIndex(null)}
                            onSwipeableOpen={() => handleSwipeOpen(index)}>
                            <TouchableOpacity
                              style={styles.taskItem}
                              onPress={() =>
                                navigation.navigate('TaskDetail', {
                                  task: task,
                                  user: user,
                                })
                              }>
                              <View style={styles.taskContent}>
                                <Text
                                  numberOfLines={2}
                                  ellipsizeMode="tail"
                                  style={styles.taskTitle}>
                                  {task.title}
                                </Text>
                                <Text
                                  numberOfLines={2}
                                  ellipsizeMode="tail"
                                  style={styles.taskDescription}>
                                  {task.description}
                                </Text>
                              </View>

                              <View style={styles.rightContent}>
                                <Text style={styles.createDateText}>
                                  {moment(task.dueDate)
                                    .tz('Asia/Ho_Chi_Minh')
                                    .format('HH:mm DD-MM-YYYY')}
                                </Text>
                                <View style={styles.statusContainer}>
                                  <Text style={styles.statusText}>
                                    {task.status}
                                  </Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          </Swipeable>
                        );
                      }}
                    />
                  </View>
                );
              }}
              onEndReached={() => handleLoadMore()}
              onEndReachedThreshold={0.1}
              refreshing={refreshing}
            />
          </View>
        )}
        <Toast />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  containerButton:{
    marginTop: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  buttonTextLich:{
    padding: 10,
    backgroundColor: '#4CAF50',
    color: "#fff"
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  rightContent: {
    alignItems: 'center',
  },
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
