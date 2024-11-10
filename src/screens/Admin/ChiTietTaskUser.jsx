import React, {useEffect, useState} from 'react';

import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  Keyboard
} from 'react-native';
import {Card, Button} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../configs/axios';
import moment from 'moment-timezone'; // Thay thế date-fns bằng moment
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {Swipeable, GestureHandlerRootView} from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';

function ChiTietTaskUser() {
  const navigation = useNavigation();
  const route = useRoute();
  const taskID = route.params?.taskId;
  const userID = route.params?.user.id;
  console.log(taskID);

  const [showRescheduleButton, setShowRescheduleButton] = useState(true);
  const [showConfirmButton, setShowConfirmButton] = useState(true);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState('');
  const [linkTask, setLinkTask] = useState('');

  const [taskData, setTaskData] = useState(null);
  const [taskHistory, setTaskHistory] = useState(null);
  const [taskComments, setTaskComments] = useState(null);

  const [countdown, setCountdown] = useState('');
  const [dueDate, setDueDate] = useState(null);

  const fetchData = async () => {
    const url = `/get-task-user?UserID=${userID}&TaskID=${taskID}`;
    try {
      const response = await axiosInstance.post(url);

      if (response.data.code == 200) {
        const newTaskData = response.data.data;
        setTaskData(newTaskData);
        if (
          newTaskData.task &&
          newTaskData.task.status === 'Đã giao' &&
          newTaskData.task.dueDate
        ) {
          setDueDate(moment(newTaskData.task.dueDate).tz('Asia/Ho_Chi_Minh'));
        }
        if (newTaskData.taskHistory != null) {
          setTaskHistory(newTaskData.taskHistory);
        }
        if (newTaskData.taskComments !== null) {
          setTaskComments(newTaskData.taskComments);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (dueDate) {
      const intervalId = setInterval(() => {
        const now = moment().tz('Asia/Ho_Chi_Minh');
        const duration = moment.duration(dueDate.diff(now));

        if (duration.asMilliseconds() <= 0) {
          setCountdown('Đã hết hạn');
          clearInterval(intervalId);
        } else {
          setCountdown(
            `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`,
          );
        }
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [dueDate]);
  useEffect(() => {
    fetchData();
  }, []);
  const handleLink = url => {
    if (!url || url.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Link hỏng',
        text2: 'Link không hợp lệ hoặc chưa có link',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      return;
    }
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/\S*)?$/;

    if (urlPattern.test(url)) {
      Linking.openURL(url);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Link hỏng',
        text2: 'Link không hợp lệ hoặc chưa có link',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      return;
    }
  };
  return (
    taskData && (
      <View style={styles.container}>
        <LinearGradient colors={['#6A00F4', '#AE47F1']} style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>{taskData.task.title}</Text>
            {taskData.task.status === 'Đã giao' && (
            <Text style={styles.timeValue}>
              {countdown ? countdown : 'Đang tải...'}
            </Text>
          )}
          </View>
        </LinearGradient>

        <View style={styles.form}>
          <TextInput
            label="Name"
            value="Trạng thái"
            style={styles.input}
            underlineColor="rgba(255, 255, 255, 0.3)"
            editable={false}
          />
          <TextInput
            label="Date"
            value={taskData.task.status}
            style={styles.input}
            underlineColor="rgba(255, 255, 255, 0.3)"
            editable={false}
          />

          

          {/* Time Section */}
          <Card style={styles.timeCard}>
            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>Bắt đầu</Text>
                <Text style={styles.timeValue}>
                  {moment(taskData.task.createDate)
                    .tz('Asia/Ho_Chi_Minh')
                    .format('HH:mm DD-MM-YYYY')}
                </Text>
              </View>
              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>Hết hạn </Text>
                <Text style={styles.timeValue}>
                  {moment(taskData.task.dueDate)
                    .tz('Asia/Ho_Chi_Minh')
                    .format('HH:mm DD-MM-YYYY')}
                </Text>
              </View>
            </View>
          </Card>
          <TextInput
            label="Description"
            value={taskData.task.description}
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
            underlineColor="rgba(255, 255, 255, 0.3)"
            editable={false}
          />
          {taskHistory != null && (
            <View>
              <TextInput
                label="Type"
                value={`Loại "${taskHistory.status}" - (${moment(
                  taskHistory.changedAt,
                )
                  .tz('Asia/Ho_Chi_Minh')
                  .format('HH:mm DD-MM')})`}
                style={styles.input}
                underlineColor="rgba(255, 255, 255, 0.3)"
                editable={false}
              />
            </View>
          )}

          {taskComments != null && taskData.task.status == 'Rời lịch' && (
            <View style={styles.commentContainer}>
              <Text style={styles.commentTitle}>Rời lịch - Lý do</Text>
              <Text style={styles.commentReason}>{taskComments.comment}</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        {taskHistory != null && (
          <Button
            mode="contained"
            style={styles.submitButton}
            onPress={() => handleLink(taskHistory.linkHoanThanh)}>
            Mở xem sản phẩm
          </Button>
        )}

        <Toast />
      </View>
    )
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  timeValue: {
    fontSize: 16,
    color: '#007BFF',
    textAlign: 'center',
  },
  commentContainer: {
    backgroundColor: '#f0f4f8', // Màu nền nhạt
    borderRadius: 10,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Hiệu ứng nổi
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff5c5c', // Màu đỏ cho tiêu đề để làm nổi bật
    marginBottom: 8,
  },
  commentReason: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 8,
    fontWeight: 700,
    fontSize: 16,
    color: 'black',
  },
  timeCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeLabel: {
    color: '#A3A3A3',
    fontSize: 12,
    fontWeight: 700,
  },
  timeValue: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  descriptionInput: {
    backgroundColor: 'transparent',
    marginVertical: 12,
  },
  categoryLabel: {
    color: '#A3A3A3',
    fontSize: 14,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#6A00F4',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  categoryText: {
    color: '#6A00F4',
  },
  submitButton: {
    margin: 16,
    borderRadius: 20,
    paddingVertical: 8,
    backgroundColor: '#6A00F4',
  },
});

export default ChiTietTaskUser;
