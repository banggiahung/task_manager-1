import React, { useEffect, useRef, useState } from 'react';
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
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../configs/axios';
import { storeData, getData } from '../../configs/asyncStorage';
import Header from '../../components/Header';
import TaskItem from '../../components/TaskItem.jsx';
import Theme from '../../configs/color';
import moment from 'moment';
import * as FeatherIcons from 'react-native-feather';

const screenHeight = Dimensions.get('window').height;
const containerHeight = screenHeight * 0.8;
const paddingBottom = screenHeight * 0.1;

export default function Notification() {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshingOld, setRefreshingOld] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paramPage, setParamPage] = useState({});
  const fetchData = async pageNew => {
    try {
      const url = `/get-list-thong-bao?Page=${pageNew}&ItemsPerPage=${itemsPerPage}&_maxItemsPerPage=${itemsPerPage}&itemsPerPage=${itemsPerPage}`;

      const response = await axiosInstance.get(url);
      if (response.data.data.length > 0) {
        setHistory(prevHistory => {
          // Lọc bỏ các phần tử có idHistoryChange trùng với phần tử đã có trong prevHistory
          const uniqueData = response.data.data.filter(
            newItem =>
              !prevHistory.some(
                existingItem =>
                  existingItem.idHistoryChange === newItem.idHistoryChange,
              ),
          );

          // Thêm các phần tử không trùng lặp vào mảng history
          return [...prevHistory, ...uniqueData];
        });

        setTotalPage(response.data.pagination.totalPages);
      }
      setLoading(false);
    } catch {
      console.error('Đã xảy ra lỗi');
    }
  };
  const handleLoadMore = async () => {
    console.log('đã gọi load more');
    setLoading(true);
    console.log(page);
    console.log(totalPage);
    if (page <= totalPage) {
      setPage(prevPage => prevPage + 1);
      await fetchData(page);
    } else {
      setLoading(false);
    }
  };
  const handleRefresh = async () => {
    console.log('đã gọi refesh');
  };
  useEffect(() => {
    fetchData(1);
  }, []);
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View>
          <Text style={styles.centerText}>Thông báo GIGI</Text>
        </View>
        {history == null || history.length === 0 ? (
          <View>
            <Text style={styles.noTasksText}>Không có tin nào</Text>
          </View>
        ) : (
          <View style={styles.containerScroll}>
            <FlatList
              contentContainerStyle={{ paddingBottom: paddingBottom }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={history}
              keyExtractor={item => item.idHistoryChange.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={async () => {
                    console.log('Refreshing data');

                    await fetchData(1);
                  }}
                />
              }
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : null
              }
              onEndReached={() => handleLoadMore()}
              onEndReachedThreshold={0.1}
              refreshing={refreshing}
              renderItem={({ item }) => {
                return (
                  <View style={styles.containerItem}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={require('../../assets/gigi-logo.png')}
                        style={styles.image}
                      />
                    </View>
                    <View>
                      <View style={styles.headerItem}>
                        <View style={styles.nameUserHeader}>
                          <Text style={styles.textHeader}>{item.nameUser}</Text>
                        </View>
                        <View style={styles.dateHeader}>
                          <Text style={styles.textHeader}>
                            {moment(item.createDate).format('DD/MM/YYYY * HH:mm')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.itemContainer}>
                        <Text style={[styles.textContent]}>{item.noiDung}</Text>
                      </View>
                    </View>

                  </View>
                );
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  imageContainer: {

    overflow: 'hidden',
    borderRadius: 25,
    marginRight: 10,
  },
  image: {
    maxWidth: 50,
    height: 50,
    resizeMode: 'contain',
  },
  container: {
    padding: 12,
  },
  centerText: {
    textAlign: 'center',
    marginTop: 12,
    fontWeight: 700,
    fontSize: 20,
    marginBottom: 12,
  },
  noTasksText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
    marginTop: 20,
  },
  containerScroll: {
    height: containerHeight,
  },
  containerItem: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",


  },
  headerItem: {
    flexDirection: 'row',
    gap: 4,
  },
  nameUserHeader: {},
  dateHeader: {},
  textHeader: {
    fontWeight: 900,
    fontSize: 12,
  },
  itemContainer: {
    padding: 12,
    paddingTop: 4,
    paddingBottom: 0,
    marginRight: 120
  },
  textContent: {
    fontWeight: 700,
    marginBottom: 4,
  },
  textContentHeader: {
    fontStyle: 'italic',
    marginBottom: 4,

  },
});
