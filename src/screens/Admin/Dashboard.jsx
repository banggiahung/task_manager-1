import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import axiosInstance from '../../configs/axios';
import DayItem from '../../components/DayItem';
import Header from '../../components/Header';
import UserItem from '../../components/UserItem';
import Theme from '../../configs/color';
import {getData} from '../../configs/asyncStorage';
import * as FeatherIcons from 'react-native-feather';
import Loading from '../../components/Loading';

function Dashboard() {
  const scrollViewRef = useRef(null);
  const [list_user, setListUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const today = moment().format('dddd, DD');
  const currentMon = moment().format('MM');
  const daysOfWeekWithDates = [];
  const startOfWeek = moment().startOf('isoWeek');
  for (let i = 0; i < 7; i++) {
    const day = startOfWeek.clone().add(i, 'days');
    daysOfWeekWithDates.push(day.format('dddd, DD'));
  }

  const MoveAddTask = () => {
    navigation.navigate('FormTask');
  };

  const ImportTaskUser = user => {
    // navigation.navigate('ImportTask', {user});
    navigation.navigate('TaskUserList', {user});
  };
  const handlePress = async () => {
    const role = await getData('role');
    if (role) {
      if (role.includes('Admin')) {
        navigation.navigate('Client', {screen: 'Home'});
        
      } else {
        return;
      }
    }
    return;
  };
  const fetchUsers = async () => {
    try {
      setRefreshing(true); // Bắt đầu refreshing
      const res = await axiosInstance.get('/get-list-user');
      const data = res.data;
      if (data.code !== 200) {
        return;
      }
      setListUser(data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, []), // Chạy chỉ một lần khi component mount
  );
  useEffect(() => {
    const activeIndex = daysOfWeekWithDates.findIndex(day => day === today);
    if (activeIndex !== -1 && scrollViewRef.current) {
      // Tính toán vị trí cần cuộn để item nằm giữa
      const itemWidth = 90; // Đặt chiều rộng tương ứng của mỗi item
      const scrollPosition = itemWidth * activeIndex - itemWidth * 2; // 3 ở đây là số item hiển thị ở mỗi bên

      scrollViewRef.current.scrollTo({
        x: scrollPosition,
        animated: true,
      });
    }
  }, [today, daysOfWeekWithDates]);
  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width;

    // Kiểm tra khi nào người dùng cuộn đến cuối trang
    if (contentOffsetX + layoutWidth >= contentWidth - 10) {
      if (page < totalPages) {
        setPage(page + 1); // Chuyển sang trang tiếp theo
      }
    }
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchUsers} 
          />
        }>
        <TouchableOpacity onPress={handlePress} style={styles.headerContainer}>
          <Header title={`Tháng ${currentMon}`} />
        </TouchableOpacity>

        <View>
          <View style={styles.monthContainer}>
            {/* <View style={styles.dateContainer}>
              <Text style={styles.monthText}>Tháng {currentMon}</Text>
            </View> */}
            <ScrollView
              ref={scrollViewRef}
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              {daysOfWeekWithDates.map((day, index) => (
                <DayItem key={index} date={day} active={day == today} />
              ))}
            </ScrollView>
          </View>
          <View style={styles.userListContainer}>
            <View style={styles.userListHeader}>
              <Text style={styles.userListTitle}>Danh sách nhân viên</Text>
              <TouchableOpacity style={styles.addButton} onPress={MoveAddTask}>
                <Text style={styles.addButtonText}>Tổng quan</Text>
                <FeatherIcons.Plus width={16} height={16} color="#1E90FF" />
              </TouchableOpacity>
            
            </View>
            <View style={styles.userList}>
              {list_user.map((user, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => ImportTaskUser(user)}
                  style={{width: '100%', height: 'auto'}}>
                  <UserItem user={user} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    width: '100%',
    paddingRight: 16,
    paddingLeft: 16,
  },
  monthContainer: {
    width: '100%',
  },
  dateContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  monthText: {
    fontSize: 24,
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
  },
  userListContainer: {
    marginTop: 16,
  },
  userListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userListTitle: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Theme.primary,
  },
  addButtonText: {
    color: '#1E90FF',
  },
  userList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
});

export default Dashboard;
