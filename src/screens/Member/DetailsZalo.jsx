import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../configs/axios';
import moment from 'moment-timezone'; // Thay thế date-fns bằng moment
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {Swipeable, GestureHandlerRootView} from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {storeData, getData} from '../../configs/asyncStorage.js';

const screenHeight = Dimensions.get('window').height;
const containerHeight = screenHeight * 0.6;
export default function DetailsZalo() {
  const navigation = useNavigation();
  const route = useRoute();
  const {task} = route.params;
  const [loading, setLoading] = useState(false);
  const [taskState, setTaskState] = useState(task);
  const [Address, setAddress] = useState(task.address);
  const [Description, setDescription] = useState('');
  const [UserForMakeupName, setUserForMakeupName] = useState('');
  const [CustomerName, setCustomerName] = useState('');
  const [TimeMake, setTimeMake] = useState(new Date());
  const [MoreFee, setMoreFee] = useState('');
  const [DepositAmount, setDepositAmount] = useState(0);
  const [DepositAmountValue, setDepositAmountValue] = useState('0');
  const [MoneyPaid, setMoneyPaid] = useState(0);
  const [MoneyPaidValue, setMoneyPaidValue] = useState('0');

  const [selectedTimeMake, setSelectedTimeMake] = useState(new Date());
  const [showMakePicker, setShowMakePicker] = useState(false);
  const [users, setUsers] = useState([]);
  const [UserForMakeup, setUserForMakeup] = useState({id: '', name: ''});
  const addressInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const depositAmountInputRef = useRef(null);
  const moneyPaidInputRef = useRef(null);
  const moreFeeInputRef = useRef(null);

  useEffect(() => {
    if (task) {
      if (task) {
        setTaskState(task);
      }
      setCustomerName(task.customerName);
      setDescription(task.description);
      setAddress(task.address);
      setUserForMakeupName(task.userForMakeupName);
      setMoreFee(task.moreFee);
      handleDepositAmountChange(task.depositAmount.toString());
      handleMoneyPaidChange(task.moneyPaid.toString());
      setSelectedTimeMake(new Date(task.timeMake));
      setTimeMake(new Date(task.timeMake));
    }
  }, [task]);
  const handleDepositAmountChange = value => {
    // Loại bỏ tất cả các ký tự không phải số
    console.log(value);

    const formattedValue = value.replace(/\D/g, '');
    const formattedWithCommas = formattedValue.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      '.',
    );

    // Cập nhật giá trị đã định dạng vào state
    setDepositAmountValue(formattedWithCommas);

    // Lưu trữ giá trị không định dạng để gửi lên server (đảm bảo là kiểu số)
    const numberValue = parseInt(formattedValue, 10);
    // Gửi giá trị numberValue khi gửi lên server
    setDepositAmount(numberValue);

    // Định dạng số, thêm dấu phân cách hàng nghìn

    console.log(numberValue);
  };
  const handleMoneyPaidChange = value => {
    // Loại bỏ tất cả các ký tự không phải số
    const formattedValue = value.replace(/\D/g, '');

    // Định dạng số, thêm dấu phân cách hàng nghìn
    const formattedWithCommas = formattedValue.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      '.',
    );

    // Cập nhật giá trị đã định dạng vào state
    setMoneyPaidValue(formattedWithCommas);

    // Lưu trữ giá trị không định dạng để gửi lên server (đảm bảo là kiểu số)
    const numberValue = parseInt(formattedValue, 10);
    // Gửi giá trị numberValue khi gửi lên server
    setMoneyPaid(numberValue);
    console.log(numberValue);
  };
  const numberFormat = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  });
  const handleConfirmHoanThanh = async taskId => {
    const userId = await getData('userId');

    if (taskState.status == 'Đã hoàn thành') {
      Toast.show({
        type: 'success',
        text1: 'Lịch đã hoàn thành',
        visibilityTime: 2000,
      });
      return;
    }
    const url = `/status-change-zalo?id=${taskId}&UserIDAdmin=${userId.replace(/"/g, '')}`;
    try {
      const response = await axiosInstance.get(url);
      if (response.data.code == 200) {
        setTaskState(prevTask => ({
          ...prevTask,
          status: 'Đã hoàn thành',
        }));

        Toast.show({
          type: 'success',
          text1: 'Cập nhật trạng thái thành công',
          visibilityTime: 2000,
        });
        console.log(response.data.message);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Có lỗi xảy ra',
          text2: 'Vui lòng thử lại sau',
          text2Style: {
            fontWeight: '700',
            color: 'black',
          },
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra',
        text2: 'Vui lòng thử lại sau',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      console.error('Error during registration:', error);
    }
  };
  return (
    task && (
      <View style={styles.containerMain}>
        <LinearGradient colors={['#C6E6F1', '#007BFF']} style={styles.header}>
          <View style={styles.statusContainer}>
            <Text style={styles.status}>{taskState.status}</Text>
          </View>
          <View style={styles.inputContainerHeader}>
            <Text style={styles.labelHeader}>Khách hàng</Text>
            <Text style={styles.inputHeader}>{task.customerName}</Text>
          </View>
        </LinearGradient>
        <View styles={styles.containerScoll}>
          <ScrollView 
          contentContainerStyle={{paddingBottom: 30}}
          style={styles.scrollMain}
          
          >
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mô tả</Text>
              <Text>{task.description}</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Chuyên viên makeup</Text>
              <View style={styles.row}>
                {task.chuyenVienName.map((chuyenVien, index) => (
                  <Text key={index} style={styles.boxCategory}>
                    {chuyenVien.nameUser}
                    {index < task.chuyenVienName.length - 1 && ', '}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Địa chỉ</Text>
              <Text>
                {task.address}
               
              </Text>

            </View>
            <View style={styles.rowContainer}>
              <View style={styles.inputContainer}>
                <Text style={[styles.labelMore]}>Ngày tạo</Text>
                <TextInput
                  style={[styles.inputMore]}
                  placeholder="ngày tạo"
                  value={moment(task.createDate)
                    .tz('Asia/Ho_Chi_Minh')
                    .format('HH:mm DD-MM-YYYY')}
                  editable={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.labelMore]}>Lịch Makeup</Text>
                <TextInput
                  style={[styles.inputMore]}
                  placeholder="Chọn ngày hết hạn"
                  value={moment(task.timeMake)
                    .tz('Asia/Ho_Chi_Minh')
                    .format('HH:mm DD-MM-YYYY')}
                  editable={false}
                />
              </View>
            </View>
            <View style={styles.rowContainer}>
              <View style={styles.inputContainer}>
                <Text style={[styles.labelMore]}>Số tiền cọc</Text>
                <TextInput
                  style={[styles.inputMore]}
                  placeholder="ngày tạo"
                  value={numberFormat.format(task.depositAmount)}
                  editable={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.labelMore]}>Số tiền còn lại</Text>
                <TextInput
                  style={[styles.inputMore]}
                  placeholder="Chọn ngày hết hạn"
                  value={numberFormat.format(task.moneyPaid)}
                  editable={false}
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Chi phí note thêm</Text>
              <Text>{task.moreFee}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleConfirmHoanThanh(task.idZaloOrder)}>
              <LinearGradient
                colors={['#C6E6F1', '#C6E6F1']}
                style={styles.saveButton}>
                <Text style={styles.buttonTextMainConfirm}>Hoàn thành</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Toast />
          </ScrollView>
        </View>
      </View>
    )
  );
}
const styles = StyleSheet.create({
  scrollMain:{
    height: containerHeight,
    padding: 20
  },
  containerScoll:{
    paddingBottom: 30
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  containerMain: {},
  boxCategory: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    fontWeight: 700,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
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
  container: {
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#BFC8E8',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Bóng đổ cho Android
    shadowColor: '#000', // Bóng đổ cho iOS
    shadowOffset: {width: 0, height: 2}, // Độ lệch của bóng
    shadowOpacity: 0.3, // Độ mờ của bóng
    shadowRadius: 4, // Bán kính mờ của bóng
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#aaa', // Màu khi nút bị vô hiệu hóa
    elevation: 0,
    shadowOpacity: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  multilineInput: {
    height: 100,
    borderColor: '#FF8C00',
  },
  saveButton: {
    backgroundColor: '#6A00F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 16,
  },
  buttonTextMain: {
    color: '#E8C4F2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextMainConfirm: {
    color: '#FF8C00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputContainerHeader: {
    marginTop: 16,
  },
  labelHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  inputHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#D7DDF0',
    color: '#fff',
    paddingHorizontal: 0,
    marginVertical: 4,
    fontSize: 30,
    fontWeight: '700',
    flexWrap: 'wrap',
  },
  inputMore: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelMore: {
    fontSize: 12,
    marginBottom: 5,
  },
  statusContainer: {
    position: 'absolute',
    right: 16,
    top: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  status: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});
