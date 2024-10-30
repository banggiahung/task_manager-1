import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation,useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import axiosInstance from '../../configs/axios';
import DayItem from '../../components/DayItem';
import Header from '../../components/Header';
import UserItem from '../../components/UserItem';
import Theme from '../../configs/color';
import {getData} from '../../configs/asyncStorage';

function Dashboard() {
  const [list_user, setListUser] = useState([]);
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
    if(role){
      if (role.includes('Admin')) {
        navigation.navigate('Home');

      } else {
        return;
      }

    }
    return;

  }
  useFocusEffect(
    React.useCallback(() => {
      try {
        axiosInstance.get('/get-list-user').then(res => {
          const data = res.data;
          if (data.code !== 200) {
            return;
          }
          setListUser(data.data);
        });
      } catch (error) {
        console.log(error);
      }
    }, []) // Chạy chỉ một lần khi component mount
  );
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
      <TouchableOpacity onPress={handlePress} style={styles.headerContainer}>
      <Header title={`Tháng ${currentMon}`} />

    </TouchableOpacity>

        <View>
          <View style={styles.monthContainer}>
            {/* <View style={styles.dateContainer}>
              <Text style={styles.monthText}>Tháng {currentMon}</Text>
            </View> */}
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              {daysOfWeekWithDates.map((day, index) => (
                <DayItem key={index} date={day} active={day == today} />
              ))}
            </ScrollView>
          </View>
          <View style={styles.userListContainer}>
            <View style={styles.userListHeader}>
              <Text style={styles.userListTitle}>Danh sách nhân viên
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={MoveAddTask}>
                <Text style={styles.addButtonText}>Task tổng quan</Text>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
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
