
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Lỗi khi lưu dữ liệu:', e);
    }
  };

const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            return value;
        } else {
            return null;
        }

    } catch (e) {
        console.error(e);
    }
};
const clearData = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('role');
      await AsyncStorage.removeItem('avatar');
      await AsyncStorage.removeItem('fullName');
      await AsyncStorage.removeItem('fcm');
      
      console.log('Data cleared successfully.');
    } catch (e) {
      console.error('Error clearing data: ', e);
    }
  };

export { storeData, getData,clearData };
