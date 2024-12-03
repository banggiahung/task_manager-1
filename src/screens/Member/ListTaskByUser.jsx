import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../configs/axios';
import moment from 'moment-timezone'; // Thay thế date-fns bằng moment
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {Swipeable, GestureHandlerRootView} from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Toast from 'react-native-toast-message';
import DayItem from '../../components/DayItem';
import Loading from '../../components/Loading';
import Theme from '../../configs/color';
import {storeData, getData} from '../../configs/asyncStorage.js';
import {CalendarList, Calendar} from 'react-native-calendars';
import LinearGradient from 'react-native-linear-gradient';

const screenHeight = Dimensions.get('window').height;
const containerHeight = screenHeight * 0.7;
const paddingBottom = screenHeight * 0.3;

import * as FeatherIcons from 'react-native-feather';
function ListTaskByUser() {
  const scrollViewRef = useRef(null);
  const flatListRef = useRef(null);

  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingOld, setRefreshingOld] = useState(false);
  const [refreshingTest, setRefreshingTest] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [paramPage, setParamPage] = useState({});
  const [showCalender, setShowCalender] = useState(false);
  const [selectedDateCalendar, setSelectedDateCalendar] = useState(null);
  const [todayDate, setTodayDate] = useState(false);
  const route = useRoute();
  const userId = route.params?.userId;
  // const userId = '0185bf98-a75e-44ed-a9b6-7ff495fa610e';

  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD'),
  );
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(
    moment().tz('Asia/Ho_Chi_Minh').toDate(),
  );
  const [selectedDateHeader, setSelectedDateHeader] = useState(null);
  const [monthChange,setMonthChange] = useState(moment().format('YYYY-MM-DD'));
  const [monthChangeStatus,setMonthChangeStatus] = useState(false);
  const handleDayPress = async day => {
    setSelectedDateCalendar(day.dateString);
    let url = '';
    url = `/get-list-group-user?UserID=${encodeURIComponent(
      userId.replace(/"/g, ''),
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
    const selectedDate = moment(month.dateString).format('YYYY-MM-DD');

    let url = '';

    // Kiểm tra nếu tháng được chọn là tháng hiện tại
    if (selectedMonth === currentMonth) {
      setMonthChange(selectedDate);
   

      setTodayDate(true);

      await fetchTasksRefresh();
      return;
    } else {
      setPage(1);
      setMonthChangeStatus(true);

      const firstDayOfMonth = moment(month.dateString)
        .startOf('month')
        .format('YYYY-MM-DD');

      // Gọi API cho tháng khác
      url = `/get-list-group-user?UserID=${encodeURIComponent(
        userId.replace(/"/g, ''),
      )}&Page=1&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}&chooseMonth=${encodeURIComponent(
        firstDayOfMonth,
      )}`;
      setMonthChange(firstDayOfMonth);

    }
    try {
      const response = await axiosInstance.get(url);
  
      if (response.data.code === 200) {
        setLoading(true);

        const newTasks = response.data.data;
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
              return b.date.localeCompare(a.date);
            });

            return updatedTasks;
          }
          updatedTasks.push(newTasks);
          return updatedTasks;
        });
        setTotalPage(response.data.pagination.totalPages); // Cập nhật tổng số trang
      } else {
        setTasks({ date: null, tasks: [] }); 
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks({ date: null, tasks: [] }); // Xử lý lỗi
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks(1);
    }, [userId]),
  );
  // useEffect(() => {
  //   fetchTasks();
  // }, [userId,page]);

  const fetchTasks = async pageNew => {
    console.log('selectedDateCalendar', selectedDateCalendar);
    if (selectedDateCalendar != null) {
      setPage(1);
      return;
    }
    if (totalPage != 0 && page > totalPage) return;
    let today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    let url = '';
    setRefreshing(true);

    setLoading(true);
    if(monthChangeStatus){
      console.log('gọi vào đây monthChangeStatus');
      url = `/get-list-group-user?UserID=${encodeURIComponent(
        userId.replace(/"/g, ''),
      )}&Page=${pageNew}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}&chooseMonth=${encodeURIComponent(
        monthChange,
      )}`;
    }
    else if (todayDate) {
      url = `/get-list-group-user?UserID=${encodeURIComponent(
        userId.replace(/"/g, ''),
      )}&Page=${pageNew}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}`;
    } else {
      url = `/get-list-group-user?UserID=${encodeURIComponent(
        userId.replace(/"/g, ''),
      )}&Page=${pageNew}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}&chooseDate=${encodeURIComponent(
        today,
      )}`;
      setTodayDate(true);
    }

    const response = await axiosInstance.get(url);


    console.log(response.data);
    const newTasks = response.data.data;
    if(newTasks != undefined){
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
  
      setTotalPage(response.data.pagination.totalPages);
    }

   
    setRefreshing(false);
    setLoading(false);
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
  const handleHoanThanh = taskId => {
    const url = `/task-user?TaskID=${taskId}`;
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
              updatedTasks.splice(index, 1); // Xóa task khỏi mảng
            }
            return updatedTasks; // Cập nhật state với mảng đã thay đổi
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
  const today = moment().format('dddd, DD');
  const currentMon = moment().format('MM');
  const daysOfWeekWithDates = [];
  const startOfWeek = moment().startOf('isoWeek');

  for (let i = 0; i < 7; i++) {
    const day = startOfWeek.clone().add(i, 'days');
    const formattedDay = day.format('dddd, DD');
    const isoDate = day.format('YYYY-MM-DD');

    daysOfWeekWithDates.push({
      displayDate: formattedDay,
      isoDate: isoDate,
    });
  }

  const onDayPress = day => {
    setSelectedDate(day);
    console.log(day);
  };
  useEffect(() => {
    const activeIndex = daysOfWeekWithDates.findIndex(
      day => day.isoDate === selectedDate,
    );
    if (activeIndex !== -1 && scrollViewRef.current) {
      const itemWidth = 90;
      const scrollPosition = itemWidth * activeIndex - itemWidth * 2; // 3 ở đây là số item hiển thị ở mỗi bên

      scrollViewRef.current.scrollTo({
        x: scrollPosition,
        animated: true,
      });
    }
  }, [daysOfWeekWithDates, selectedDate]);
  const getVietnameseDayName = dayName => {
    switch (dayName.trim()) {
      case 'Monday':
        return 'Thứ 2';
      case 'Tuesday':
        return 'Thứ 3';
      case 'Wednesday':
        return 'Thứ 4';
      case 'Thursday':
        return 'Thứ 5';
      case 'Friday':
        return 'Thứ 6';
      case 'Saturday':
        return 'Thứ 7';
      case 'Sunday':
        return 'Chủ nhật';
      default:
        return dayName.trim();
    }
  };

  // Định dạng ngày cho hiển thị
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
  const fetchTasksRefresh = async () => {
    setSelectedDateCalendar(null);
    setMonthChangeStatus(false)

    setPage(1);
    let today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    const url = `/get-list-group-user?UserID=${encodeURIComponent(
      userId.replace(/"/g, ''),
    )}&Page=1&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}`;

    axiosInstance
      .get(url)
      .then(response => {

        const newTasks = response.data.data;
        setTodayDate(null);
        setRefreshingOld(false);
        if(newTasks != undefined){
          setTasks([newTasks]);
          setTotalPage(response.data.pagination.totalPages);
        }else{

          setTasks([]);
        }
       
      })
      .catch(error => {
        setRefreshingOld(false);

        console.error('Error fetching tasks:', error);
      });
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    fetchTasksRefresh();
  };
  const handleClearSelection = () => {
    setSelectedDateCalendar(null);
    setPage(1);
    fetchTasksRefresh();
  };
  
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* const isActive = date === today || date === selectedDateHeader; */}

      <View style={styles.monthContainer}>
        {/* <ScrollView
          ref={scrollViewRef}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          {daysOfWeekWithDates.map((dayObj, index) => {
            const vietnameseDayName = getVietnameseDayName(
              dayObj.displayDate.split(',')[0],
            );
            const isActive = dayObj.isoDate === selectedDate;
            return (
              <TouchableOpacity
                key={index}
                // onPress={() => onDayPress(dayObj.isoDate)}
              >
                <View style={[styles.dayContainer, isActive && styles.active]}>
                  <Text style={styles.dayText}>
                    {dayObj.displayDate.split(',')[1].trim()}
                  </Text>
                  <Text style={styles.dayNameText}>{vietnameseDayName}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView> */}
        {showCalender ? (
          <View >
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
              <TouchableOpacity onPress={handleClearSelection}>
                <Text style={styles.buttonTextLich}>Hủy chọn ngày</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowCalender(false)}>
                <Text style={styles.buttonTextLich}>Đóng lịch</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.calenderContainer} onPress={() => setShowCalender(true)}>
            <LinearGradient
              colors={['#007bff', '#007bff']}
              style={{width: '100%', padding: 10, borderRadius: 8}}>
              <Text style={{textAlign: 'center', color: '#fff'}}>Mở lịch</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.container}>
        {/* <View style={styles.buttonContainer}>
         
          <Text style={styles.choose}>Ngày {formattedSelectedDate}</Text>
        </View> */}

        <Modal visible={showDatePicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
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
            <Text style={styles.noTasksText}>Không có task nào</Text>
          </View>
        ) : (
          <View style={styles.listItem}>
            <FlatList
              contentContainerStyle={{paddingBottom: paddingBottom}}
              ref={flatListRef}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={tasks}
              keyExtractor={item => item.date}
              refreshControl={
                <RefreshControl
                  refreshing={refreshingOld}
                  onRefresh={() => {
                    setRefreshingOld(true);
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
                      {moment(item.date).format('DD-MM-YYYY')}
                    </Text>

                    <FlatList
                      data={item.tasks}
                      keyExtractor={task => task.taskID.toString()}
                      renderItem={({item: task, index}) => {
                        return (
                          <Swipeable
                          // renderLeftActions={renderLeftActions}
                          // renderRightActions={renderRightActions}
                          >
                            <TouchableOpacity
                              style={styles.taskItem}
                              onPress={() =>
                                navigation.navigate('ConfirmTask', {
                                  taskID: task.taskID,
                                  userId: userId.replace(/"/g, ''),
                                })
                              }>
                              <View style={styles.taskContent}>
                                <View style={styles.leftContent}>
                                  <Text style={styles.createDateText}>
                                    {moment(task.createDate)
                                      .tz('Asia/Ho_Chi_Minh')
                                      .format('HH:mm DD-MM')}
                                  </Text>
                                  <View style={styles.arrowContainer}>
                                    <Text style={styles.arrowText}>↓</Text>
                                  </View>
                                  <Text style={styles.createDateText}>
                                    {moment(task.dueDate)
                                      .tz('Asia/Ho_Chi_Minh')
                                      .format('HH:mm DD-MM')}
                                  </Text>
                                </View>
                                <View style={styles.rightContent}>
                                  <View style={styles.containerItemMain}>
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
                                  <View style={styles.statusContainer}>
                                    <Text style={styles.statusText}>
                                      {task.status}
                                    </Text>
                                  </View>
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

              onEndReachedThreshold={0.3}
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
  calenderContainer: {
    padding: 16,
    paddingBottom: 0
  },
  containerButton: {
    marginTop: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonTextLich: {
    padding: 10,
    backgroundColor: '#4CAF50',
    color: '#fff',
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
  listItem: {
    height: containerHeight,
    paddingBottom: 20,
  },
  containerItemMain: {
    flex: 1,
  },
  monthContainer: {
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
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
    height: 40,
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
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#2196F3',
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
  leftContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 10,
    color: 'black',
  },
  rightContent: {
    flex: 2,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  choose: {
    fontSize: 16,
    fontWeight: 700,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.backGround,
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {color: 'black', fontSize: 16, fontWeight: 700},
  dayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
    width: 70,
    height: 120,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    padding: 10,
    margin: 5,
  },
  active: {
    backgroundColor: '#C6E6F1',
  },
  dayText: {
    color: 'black',
    fontSize: 26,
    fontWeight: 'bold',
  },
  dayNameText: {
    color: 'black',
    fontSize: 10,
  },
});

export default ListTaskByUser;
