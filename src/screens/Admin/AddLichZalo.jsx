import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState, useEffect, useRef} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  Dimensions,
  Keyboard,
  FlatList,
} from 'react-native';
import axiosInstance from '../../configs/axios';
import Toast from 'react-native-toast-message';
import moment from 'moment-timezone';
import LinearGradient from 'react-native-linear-gradient';
import {storeData, getData} from '../../configs/asyncStorage.js';
import RNPickerSelect from 'react-native-picker-select';
import Loading from '../../components/Loading';
const screenHeight = Dimensions.get('window').height;
const containerHeight = screenHeight * 0.6;
export default function AddLichZalo() {
  const [loading, setLoading] = useState(false);

  const [Address, setAddress] = useState('');
  const [Description, setDescription] = useState('');
  const [UserForMakeupName, setUserForMakeupName] = useState('');
  const [CustomerName, setCustomerName] = useState('');
  const [TimeMake, setTimeMake] = useState(new Date());
  const [MoreFee, setMoreFee] = useState('');
  const [DepositAmount, setDepositAmount] = useState(0);
  const [DepositAmountValue, setDepositAmountValue] = useState('1');
  const [MoneyPaid, setMoneyPaid] = useState(0);
  const [MoneyPaidValue, setMoneyPaidValue] = useState('1');

  const [selectedTimeMake, setSelectedTimeMake] = useState(new Date());
  const [showMakePicker, setShowMakePicker] = useState(false);
  const [users, setUsers] = useState([]);
  const [UserForMakeup, setUserForMakeup] = useState({id: '', name: ''});
  const [userSelections, setUserSelections] = useState([
    {
      nameUser: '',
      userID: '',
    },
  ]);
  const handleNameChange = (text, index) => {
    setUserSelections(prevSelections =>
      prevSelections.map((selection, i) =>
        i === index ? {...selection, nameUser: text, userID: ''} : selection,
      ),
    );
  };

  const addressInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const depositAmountInputRef = useRef(null);
  const moneyPaidInputRef = useRef(null);
  const moreFeeInputRef = useRef(null);
  const handleDepositAmountChange = value => {
    // Loại bỏ tất cả các ký tự không phải số
    const formattedValue = value.replace(/\D/g, '');

    // Định dạng số, thêm dấu phân cách hàng nghìn
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
  const onCreateDateChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedTimeMake(selectedTime);
    }
  };
  const confirmCreateDate = () => {
    const formattedDate = moment(selectedTimeMake)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    setTimeMake(formattedDate);
    setShowMakePicker(false);
  };
  const AddZaloAdmin = async () => {
    setLoading(true);
    const userId = await getData('userId');
    const data = new FormData();
    const TimeMakeMain = moment(TimeMake)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DDTHH:mm:ss');

    if (CustomerName.trim() == '') {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra',
        text2: 'Chưa có tên khách hàng',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      return;
    }
    if (
      userSelections.length === 0 ||
      userSelections.some(item => !item.nameUser)
    ) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra',
        text2: 'Chưa có chuyên viên makeup hoặc tên đang bị trống',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      return;
    }
    userSelections.forEach((item, index) => {
      data.append(`ToUser[${index}][nameUser]`, item.nameUser);
      data.append(`ToUser[${index}][userID]`, item.userID);
    });
    data.append('UserCreateID', userId.replace(/"/g, ''));
    data.append('Address', Address);
    data.append('Description', Description);
    data.append('CustomerName', CustomerName);
    data.append('TimeMake', TimeMakeMain);
    data.append('MoreFee', MoreFee);
    data.append('DepositAmount', DepositAmount);
    data.append('MoneyPaid', MoneyPaid);

    try {
      const response = await axiosInstance.post('/add-items-zalo-order', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.code == 200) {
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: `Lên lịch thành công cho khách ${CustomerName}`,
          visibilityTime: 3000,
        });
      } else {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Có lỗi xảy ra',
          text2: response.data.message,
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
        text2: 'Vui lòng kiểm tra các trường',
        text2Style: {
          fontWeight: '700',
          color: 'black',
        },
        visibilityTime: 3000,
      });
      console.error('Error during registration:', error);
    }
  };
  useEffect(() => {
    axiosInstance
      .get('/get-list-user')
      .then(response => {
        if (response.data && response.data.data) {
          const userOptions = response.data.data.map(user => ({
            label: user.fullName,
            value: user.id,
          }));
          setUsers(userOptions);
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);
  const testvalue = () => {
    console.log();
  };
  const handleValueChange = (value, index) => {
    const selectedUser = users.find(user => user.value === value);

    if (!selectedUser) {
      console.log(`User with value ${value} not found`);
      return;
    }
    setUserForMakeup({
      id: selectedUser ? selectedUser.value : '',
      name: selectedUser ? selectedUser.label : '',
    });
    console.log(selectedUser.label);
    console.log(selectedUser.value);
    setUserSelections(prevSelections =>
      prevSelections.map((selection, i) =>
        i === index
          ? {
              ...selection,
              userID: selectedUser.value,
              nameUser: selectedUser.label,
            }
          : selection,
      ),
    );
  };
  const scrollToInput = ref => {
    ref.current?.scrollIntoView({behavior: 'smooth'});
  };

  const addUserSelection = () => {
    setUserSelections([
      ...userSelections,
      {
        nameUser: '',
        userID: '',
      },
    ]);
  };
  const removeUserSelection = index => {
    setUserSelections(prevSelections => {
      const updatedSelections = [...prevSelections];
      updatedSelections.splice(index, 1);
      return updatedSelections;
    });
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <View style={styles.containerMain}>
      <KeyboardAvoidingView
        style={styles.containerScoll}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 100}>
        <ScrollView
          contentContainerStyle={styles.containerMain}
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setShowMakePicker(true)}>
            <View style={styles.DateTimeMain}>
              <Text style={[styles.labelMore]}>Ngày make</Text>
              <TextInput
                style={[styles.inputMore]}
                placeholder="Chọn ngày make"
                value={moment(TimeMake)
                  .tz('Asia/Ho_Chi_Minh')
                  .format('HH:mm DD-MM-YYYY')}
                editable={false}
              />
            </View>
          </TouchableOpacity>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.inputContainer}>
              <Text style={styles.labelMore}>Tên khách hàng</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên khách hàng"
                value={CustomerName}
                onChangeText={setCustomerName}
                onFocus={() => scrollToInput(descriptionInputRef)}
              />
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.inputContainer}>
            <Text style={styles.labelMore}>Mô tả</Text>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Nhập mô tả"
                value={Description}
                multiline={true}
                onChangeText={setDescription}
                onFocus={() => scrollToInput(descriptionInputRef)}
              />
            </TouchableWithoutFeedback>
          </View>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.row}>
              <View style={styles.inputContainerRow}>
                <Text style={styles.labelMore}>Địa chỉ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập địa chỉ"
                  value={Address}
                  onChangeText={setAddress}
                  onFocus={() => scrollToInput(addressInputRef)}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>

          <View style={styles.inputContainerRow}>
            <Text style={styles.labelMore}>Người thực hiện makeup</Text>
            {userSelections.map((item, index) => (
              <View key={index} style={styles.row}>
                <TouchableOpacity
                  onPress={() => removeUserSelection(index)}
                  style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
                <View style={styles.inputContainerRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập tên người thực hiện"
                    value={item.nameUser}
                    onChangeText={text => handleNameChange(text, index)}
                  />

                  {users.length > 0 && (
                    <RNPickerSelect
                      placeholder={{
                        label: 'Chọn người thực hiện...',
                        value: null,
                      }}
                      value={item.userID}
                      onValueChange={value => handleValueChange(value, index)}
                      items={users}
                      style={pickerSelectStyles}
                    />
                  )}
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={addUserSelection}
              style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Thêm </Text>
            </TouchableOpacity>
          </View>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.inputContainer}>
              <Text style={styles.labelMore}>Phí thêm</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Nhập phí thêm"
                value={MoreFee}
                multiline={true}
                onChangeText={setMoreFee}
                onFocus={() => scrollToInput(moreFeeInputRef)}
              />
            </View>
          </TouchableWithoutFeedback>

          <View style={styles.row}>
            <View style={styles.inputContainerRow}>
              <Text style={styles.labelMore}>Số tiền cọc</Text>
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số tiền cọc"
                  keyboardType="numeric"
                  value={DepositAmountValue.toString()}
                  onChangeText={handleDepositAmountChange}
                  onFocus={() => scrollToInput(depositAmountInputRef)}
                />
              </TouchableWithoutFeedback>
            </View>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.inputContainerRow}>
                <Text style={styles.labelMore}>Số tiền còn lại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số tiền còn lại"
                  keyboardType="numeric"
                  value={MoneyPaidValue.toString()}
                  onChangeText={handleMoneyPaidChange}
                  onFocus={() => scrollToInput(depositAmountInputRef)}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>

          {showMakePicker && (
            <Modal
              transparent={true}
              visible={showMakePicker}
              animationType="slide">
              <View style={styles.modalContainer}>
                <DateTimePicker
                  value={selectedTimeMake}
                  mode="datetime"
                  display="spinner"
                  onChange={onCreateDateChange}
                  locale="vi"
                  textColor={'#000000'}
                />
                <Button title="Xác nhận" onPress={confirmCreateDate} />
              </View>
            </Modal>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.container}>
        <TouchableOpacity onPress={AddZaloAdmin}>
          <LinearGradient
            colors={['#6A00F4', '#AE47F1']}
            style={styles.saveButton}>
            <Text style={styles.buttonTextMain}>Xác nhận</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Toast />
    </View>
  );
}
const styles = StyleSheet.create({
  removeButton: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    marginRight: 12,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  DateTimeMain: {
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
  },
  addButton: {
    width: '30%',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row', // Các phần tử con sẽ được xếp theo chiều ngang
    justifyContent: 'space-between', // Khoảng cách đều giữa các phần tử
    marginBottom: 15, // Khoảng cách dưới mỗi hàng
  },
  inputContainerRow: {
    flex: 1, // Mỗi input chiếm cùng một tỉ lệ không gian
    marginRight: 10, // Khoảng cách giữa các input
    gap: 5,
  },
  containerMain: {
    paddingBottom: 20,
  },
  containerScoll: {
    height: containerHeight,
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
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 8,
    paddingRight: 4,
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
  },
  saveButton: {
    backgroundColor: '#6A00F4',
    paddingVertical: 19,
    paddingHorizontal: 0,
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
    color: 'white',
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
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#D7DDF0',
    color: '#FFFFFF',
    paddingHorizontal: 0,
    marginVertical: 4,
    fontSize: 30,
    fontWeight: '700',
  },
  inputMore: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelMore: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 700,
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    fontSize: 16,
  },
  inputAndroid: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    fontSize: 16,
  },
});
