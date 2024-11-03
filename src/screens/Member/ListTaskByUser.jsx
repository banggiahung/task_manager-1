import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
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

import * as FeatherIcons from 'react-native-feather';
function ListTaskByUser() {
  const navigation = useNavigation();
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
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [userId, selectedDate]),
  );

  const fetchTasks = () => {
    setLoading(true);

    const formattedDate = moment(selectedDate)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DD');

    const url = `/get-list-task-user?UserID=${userId}&createDate=${formattedDate}`;
    console.log(url);
    axiosInstance
      .get(url)
      .then(response => {
        setLoading(false);

        setTasks(response.data.data);
      })
      .catch(error => {
        setLoading(false);

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
        return '';
    }
  };

  // Định dạng ngày cho hiển thị
  const formattedSelectedDate = moment(selectedDate)
    .tz('Asia/Ho_Chi_Minh')
    .format('DD-MM-YYYY');
  const sortedTasks = tasks
    ? [...tasks].sort((a, b) => {
        return moment(a.dueDate).diff(moment(b.dueDate));
      })
    : [];
  if (loading) {
    return <Loading />;
  }
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* const isActive = date === today || date === selectedDateHeader; */}

      <View style={styles.monthContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {daysOfWeekWithDates.map((dayObj, index) => {
            const vietnameseDayName = getVietnameseDayName(
              dayObj.displayDate.split(',')[0],
            );
            const isActive = dayObj.isoDate === selectedDate;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => onDayPress(dayObj.isoDate)}>
                <View style={[styles.dayContainer, isActive && styles.active]}>
                  <Text style={styles.dayText}>
                    {dayObj.displayDate.split(',')[1].trim()}
                  </Text>
                  <Text style={styles.dayNameText}>{vietnameseDayName}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          {/* <Button title="Chọn ngày" onPress={() => setShowDatePicker(true)} /> */}
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              setSelectedDate(
                moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD'),
              )
            }>
            <Text style={styles.buttonText}>Hôm nay</Text>
            
          </TouchableOpacity>
          <Text style={styles.choose}>Ngày {formattedSelectedDate}</Text>
        </View>

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
            <Text style={styles.noTasksText}>
              Ngày {formattedSelectedDate} không có task nào
            </Text>
          </View>
        ) : (
          <View style={styles.listItem}>
            <FlatList
              data={sortedTasks}
              keyExtractor={item => item.taskID.toString()}
              renderItem={({item}) => {
                const renderRightActions = () => (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleHoanThanh(item.taskID)}>
                    <View>
                      <Text style={styles.deleteButtonText}>Hoàn thành</Text>
                    </View>
                  </TouchableOpacity>
                );
                const renderLeftActions = () => (
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleDetails(item.taskID)}>
                    <View>
                      <Text style={styles.detailButtonText}>Chi tiết</Text>
                    </View>
                  </TouchableOpacity>
                );

                return (
                  <Swipeable
                    renderLeftActions={renderLeftActions}
                    renderRightActions={renderRightActions}>
                    <TouchableOpacity
                      style={styles.taskItem}
                      onPress={() =>
                        navigation.navigate('ConfirmTask', {
                          taskID: item.taskID,
                          userId: userId,
                        })
                      }>
                      <View style={styles.taskContent}>
                        <View style={styles.leftContent}>
                          <Text style={styles.createDateText}>
                            {moment(item.createDate)
                              .tz('Asia/Ho_Chi_Minh')
                              .format('HH:mm DD-MM')}
                          </Text>
                          <View style={styles.arrowContainer}>
                            <Text style={styles.arrowText}>↓</Text>
                          </View>
                          <Text style={styles.createDateText}>
                            {moment(item.dueDate)
                              .tz('Asia/Ho_Chi_Minh')
                              .format('HH:mm DD-MM')}
                          </Text>
                        </View>
                        <View style={styles.rightContent}>
                          <View style={styles.containerItemMain}>
                            <Text style={styles.taskTitle}>{item.title}</Text>
                            <Text style={styles.taskDescription}>
                              {item.description}
                            </Text>
                          </View>

                          <View style={styles.statusContainer}>
                            <Text style={styles.statusText}>{item.status}</Text>
                          </View>
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
  containerItemMain:{
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
