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
  FlatList,
  Dimensions,
  RefreshControl
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../configs/axios';
import moment from 'moment-timezone'; // Thay thế date-fns bằng moment
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {Swipeable, GestureHandlerRootView} from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import debounce from 'lodash.debounce'; // Thư viện debounce
import Loading from '../../components/Loading';

import 'moment/locale/vi';
const screenHeight = Dimensions.get('window').height;
const containerHeight = screenHeight * 0.6;
export default function LichZalo() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const swipeableRefs = useRef([]);
  const [openSwipeableIndex, setOpenSwipeableIndex] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [paramPage, setParamPage] = useState({});
  const [buttonText, setButtonText] = useState('Nhắc hẹn ⇅');
  const [sort, setSort] = useState('Nhắc hẹn');
  const handleTextChange = () => {
    setLoading(true);
    // Thay đổi văn bản khi nhấn nút
    if (buttonText === 'Hoàn thành ⇅') {
      setButtonText('Nhắc hẹn ⇅');
      setSort('Nhắc hẹn');
    } else {
      setButtonText('Hoàn thành ⇅');
      setSort('Hoàn thành');
    }
  };
  const fetchTasks = () => {
    setRefreshing(true);
    let url = '';

    if (type != '') {
      url = `/get-list-zalo-order?type=${encodeURIComponent(
        type,
      )}&sort=${encodeURIComponent(sort)}&search=${encodeURIComponent(
        search,
      )}&Page=${page}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}`;
    } else {
      url = `/get-list-zalo-order?sort=${encodeURIComponent(
        sort,
      )}&Page=${page}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}`;
    }
    console.log(url);

    axiosInstance
      .get(url)
      .then(response => {
        setLoading(false);
        setRefreshing(false); 
        setTasks(response.data.data);
        console.log(response.data.data);

        setParamPage(response.data.pagination);
      })
      .catch(error => {
        setLoading(false);
        setRefreshing(false); 
        console.error('Error fetching tasks:', error);
      });
  };
  const debouncedFetchData = debounce(() => {
    fetchTasks();
  }, 500);
  useEffect(() => {
    if (type !== '') {
      debouncedFetchData();
    } else {
      fetchTasks();
    }
  }, [page, search, sort]);
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, []), // Chạy chỉ một lần khi component mount
  );
  const handleNextPage = () => {
    if (paramPage && paramPage.hasNext) {
      setLoading(true);

      setPage(page + 1);
    }
  };

  // Hàm xử lý khi người dùng nhấn vào previous page
  const handlePreviousPage = () => {
    if (paramPage && paramPage.hasPrevious) {
      setLoading(true);

      setPage(page - 1);
    }
  };
  const handlePageChange = pages => {
    if (
      pages >= 1 &&
      paramPage &&
      paramPage.totalPages &&
      pages <= paramPage.totalPages
    ) {
      console.log(pages);
      setLoading(true);

      setPage(pages);
    }
  };

  const handleNavigateToAddLichZalo = () => {
    navigation.navigate('AddLichZalo');
  };
  const items = [
    {label: 'Tên khách', value: 'customer'},
    {label: 'Địa chỉ', value: 'address'},
    {label: 'Nội dung', value: 'content'},
    {label: 'Người make', value: 'nameMakeup'},
    {label: 'Phí thêm', value: 'feeMore'},
    {label: 'Số cọc', value: 'amount'},
  ];
  const renderPageNumbers = () => {
    const {currentPage, totalPages} = paramPage;
    const pageNumbers = [];

    pageNumbers.push(
      <Text
        key={1}
        style={[
          styles.pageButton,
          currentPage === 1 && styles.activePageButton,
        ]}
        onPress={() => handlePageChange(1)}>
        1
      </Text>,
    );

    if (currentPage > 3) {
      pageNumbers.push(<Text key="left-ellipsis">...</Text>);
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pageNumbers.push(
        <Text
          key={i}
          style={[
            styles.pageButton,
            currentPage === i && styles.activePageButton,
          ]}
          onPress={() => handlePageChange(i)}>
          {i}
        </Text>,
      );
    }

    if (currentPage < totalPages - 2) {
      pageNumbers.push(<Text key="right-ellipsis">...</Text>);
    }

    if (totalPages > 1) {
      pageNumbers.push(
        <Text
          key={totalPages}
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.activePageButton,
          ]}
          onPress={() => handlePageChange(totalPages)}>
          {totalPages}
        </Text>,
      );
    }

    return pageNumbers;
  };
  const handleSwipeOpen = index => {
    // Đóng item trước đó nếu có
    if (openSwipeableIndex !== null && openSwipeableIndex !== index) {
      swipeableRefs.current[openSwipeableIndex]?.close();
    }
    // Cập nhật index của item đang mở
    setOpenSwipeableIndex(index);
  };
  const handleDelete = async (taskId) => {
    const formData = new FormData();
    formData.append("id", taskId);
    try {
      const response = await axiosInstance.post('/delete-zalo-order', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data.data)
      if (response.data.code == 200) {
        Toast.show({
          type: 'success',
          text1: 'Đã xoá thành công',
          visibilityTime: 2000,
          onHide: () => {
            fetchTasks();
          },
        });
        // setTasks(prevTasks => {
        //   const updatedTasks = [...prevTasks]; 
        //   const index = updatedTasks.findIndex(
        //     task => task.idZaloOrder === taskId,
        //   );
        //   if (index !== -1) {
        //     updatedTasks.splice(index, 1); 
        //   }
        //   return updatedTasks;
        // });
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
        return
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
  const handleSuccess = async (taskId) => {
    const url = `/status-change-zalo?id=${taskId}`;
    try{
      const response = await axiosInstance.get(url);
      if(response.data.code == 200){
        setTasks(prevTasks => {
          const updatedTasks = [...prevTasks];
          const index = updatedTasks.findIndex(
            task => task.idZaloOrder === taskId
          );
          if (index !== -1) {
            updatedTasks[index].status = "Đã hoàn thành"; 
          }
          return updatedTasks;
        });
        Toast.show({
          type: 'success',
          text1: 'Cập nhật trạng thái thành công',
          visibilityTime: 2000,
        });
        console.log(response.data.message)
      }else{
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
  const numberFormat = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  });
  const handleNavigationEdit = (task)=>{
    navigation.navigate("EditLichZalo", {
      
      task: task,
    });
  }
  if (loading) {
    return <Loading />;
  }
  return (
    <GestureHandlerRootView style={{flex: 1, padding: 20}}>
      <View style={styles.buttonHeader}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleNavigateToAddLichZalo}>
          <Text style={styles.buttonText}>Tạo Lịch</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.changeButton}
          onPress={handleTextChange}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, {flex: 1, marginRight: 10}]}
          placeholder="Tìm kiếm"
          value={search}
          onChangeText={text => {
            setSearch(text);
            setPage(1);
          }}
        />
        <RNPickerSelect
          placeholder={{
            label: 'Chọn...',
            value: null,
          }}
          value={type}
          onValueChange={setType}
          items={items}
          style={pickerSelectStyles}
        />
      </View>
      <View style={styles.containerScroll}>
        {tasks && tasks.length > 0 ? (
          <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchTasks} 
            />
          }
            styles={styles.scrollContent}
            data={tasks}
            keyExtractor={task => task.id}
            renderItem={({item, index}) => {
              const renderRightActions = () => (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.idZaloOrder)}>
                  <View>
                    <Text style={styles.deleteButtonText}>Xóa</Text>
                  </View>
                </TouchableOpacity>
              );

              const renderLeftActions = () => (
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => handleSuccess(item.idZaloOrder)}>
                  <View>
                    <Text style={styles.detailButtonText}>Hoàn thành</Text>
                  </View>
                </TouchableOpacity>
              );

              return (
                <Swipeable
                  ref={ref => (swipeableRefs.current[index] = ref)} // Lưu tham chiếu Swipeable của mỗi item
                  renderLeftActions={item.status !== 'Đã hoàn thành' ? renderLeftActions : () => null}
                  renderRightActions={renderRightActions}
                  onSwipeableClose={() => setOpenSwipeableIndex(null)} // Đóng Swipeable khi không mở
                  onSwipeableOpen={() => handleSwipeOpen(index)} // Mở Swipeable khi item được mở
                >
                  <TouchableOpacity key={item.id} style={styles.itemTask} onPress={() => handleNavigationEdit(item)} >
                    <View style={styles.lich}>
                      <View style={styles.ContentLich}>
                        <View style={styles.HeaderLich}>
                          <Text style={styles.dayOfWeek}>
                            {moment(item.timeMake).locale('vi').format('dddd')}
                          </Text>
                        </View>
                        <View style={styles.footerLich}>
                          <Text style={styles.TextHight}>
                            {moment(item.timeMake).format('DD')}
                          </Text>
                          <Text style={styles.TextLow}>
                            {moment(item.timeMake).locale('vi').format('MMMM')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.item}>
                      <Text>Giờ: {moment(item.timeMake).format('HH:mm')}</Text>
                      <Text>Tên khách: {item.customerName} </Text>
                      <Text
                       numberOfLines={1}
                       ellipsizeMode="tail"
                       style={styles.chuyenVienText}
                       >
                        Chuyên viên: 

                      {item.chuyenVienName.map(chuyenVien => chuyenVien.nameUser).join(', ')}
                        </Text>

                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={styles.descriptionText}>
                        {
                          // Dùng if else để hiển thị thông tin tùy thuộc vào type
                          type
                            ? // Nếu type có giá trị, hiển thị trường tương ứng
                              (() => {
                                if (type === 'address') {
                                  return `Địa chỉ: ${item.address}`;
                                } else if (type === 'content') {
                                  return `Nội dung: ${item.description}`;
                                } else if (type === 'feeMore') {
                                  return `Phí thêm: ${item.moreFee}`;
                                } else if (type === 'amount') {
                                  return `Số cọc: ${numberFormat.format(
                                    item.depositAmount,
                                  )}`;
                                } else {
                                  return '';
                                }
                              })()
                            : // Nếu type không có giá trị (không chọn gì), hiển thị mặc định
                              `Nội dung: ${item.description}`
                        }
                      </Text>
                    </View>
                    <View style={styles.status}>
                      <Text>{item.status}</Text>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              );
            }}
          />
        ) : (
          <Text style={styles.noItemsText}>Không có dữ liệu nào</Text>
        )}
      </View>
      {tasks && tasks.length > 0 && (
        <View style={styles.containerItems}>
          <View style={styles.pagination}>{renderPageNumbers()}</View>
        </View>
      )}
        <Toast />

    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  noItemsText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
  buttonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  containerItems: {
    flex: 1,
  },
  itemTask: {
    width: '100',
    flex: 1,
    backgroundColor: '#add8e8',
    padding: 16,
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
    height: '100%',
  },
  lich: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#f4f4f4',
    shadowColor: '#000', // Màu bóng đổ
    shadowOffset: {width: 0, height: 4}, // Vị trí bóng đổ
    shadowOpacity: 0.3, // Độ mờ của bóng
    shadowRadius: 6, // Độ mờ của bóng
    elevation: 5, // Dùng cho Android để tạo bóng
  },
  ContentLich: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  HeaderLich: {
    backgroundColor: '#0068FF',
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 24,
    paddingLeft: 24,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  item: {
    flexDirection: 'column',
    gap: 8,
    width: '70%'
  },
  chuyenVienText:{
    maxWidth: '100%', // Giới hạn chiều rộng của văn bản
    fontSize: 14,
    color: '#333',
  },
  descriptionText: {
    maxWidth: '80%', // Giới hạn chiều rộng của văn bản
    fontSize: 14,
    color: '#333',
  },
  status: {
    backgroundColor: '#FFE4E1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 12,
  },
  footerLich: {
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  TextHight: {
    fontSize: 30,
    fontWeight: 900,
    color: '#000',
    marginBottom: 4,
  },
  TextLow: {
    textTransform: 'capitalize',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
    paddingRight: 10,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  containerScroll: {
    height: containerHeight,
    paddingBottom: 20,
  },
  scrollContent: {},

  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#7B47F1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  changeButton: {
    backgroundColor: '#4169E1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  pageButton: {
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ccc', // Light background for inactive buttons
    color: '#007bff',
    fontWeight: '500',
  },
  activePageButton: {
    backgroundColor: '#007bff', // Background for active button
    color: '#ffffff',
    fontWeight: 'bold',
    borderRadius: 8,
  },
  containerLich: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#d9d9d9',
  },
  dayOfWeek: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#007bff',
  },
  footer: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  month: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  year: {
    fontSize: 18,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    alignItems: 'center',
    height: '50%',
    borderBottomRightRadius: 12,
    borderTopRightRadius: 12,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: '50%',
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
const pickerSelectStyles = {
  inputIOS: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
  },
  inputAndroid: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
  },
};
