import 'react-native-gesture-handler';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import IntroScreen from './src/components/IntroScreen.jsx';
import Dashboard from './src/screens/Admin/Dashboard.jsx';
import ChiTietTaskUser from './src/screens/Admin/ChiTietTaskUser.jsx';

import AddUsers from './src/screens/Admin/AddUsers.jsx';
import ListTask from './src/screens/Admin/ListTask.jsx';
import FormTask from './src/screens/Admin/FormTask.jsx';
import ImportTask from './src/screens/Admin/ImportTask.jsx';
import EditTaskTongQuan from './src/screens/Admin/EditTaskTongQuan.jsx';
import TaskUserList from './src/screens/Admin/TaskUserList.jsx';
import TaskDetail from './src/screens/Admin/TaskDetail.jsx';
import TaskListHandle from './src/screens/Admin/TaskListHandle.jsx';
import AppConfig from './src/screens/Admin/AppConfig.jsx';
import AddLichZalo from './src/screens/Admin/AddLichZalo.jsx';
import EditLichZalo from './src/screens/Admin/EditLichZalo.jsx';


import ListTaskByUser from './src/screens/Member/ListTaskByUser.jsx';
import ConfirmTask from './src/screens/Member/ConfirmTask.jsx';
import DetailsZalo from './src/screens/Member/DetailsZalo.jsx';
import Notification from './src/screens/Public/Notification.jsx';


import Login from './src/screens/Auth/Login.jsx';
import Registration from './src/screens/Auth/Registration.jsx';

import Profile from './src/screens/Auth/Profile.jsx';
import ProductListScreen from './src/screens/Product/ProductListScreen.jsx';
import ProductDetailScreen from './src/screens/Product/ProductDetailScreen.jsx';
import MainNavigator from './src/components/MainNavigator';
import ClientNavigator from './src/components/ClientNavigator';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import {Alert} from 'react-native';
import firebase from '@react-native-firebase/app';
import axiosInstance from './src/configs/axios';
import {storeData, getData} from './src/configs/asyncStorage.js';
import PushNotification from 'react-native-push-notification';
const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      } else {
        console.log('User denied messaging permission');
      }
    };

    requestUserPermission();

    const getToken = async () => {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      storeData('fcm', token);

      const userId = await getData('userId');
      const data = new FormData();
      data.append('UserID', userId.replace(/"/g, ''));
      data.append('fcm', token);
      
  
      try {
        const response = await axiosInstance.post('/set-fcm-user', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.data.code == 200) {
          storeData('fcm', token);
          console.log(response.data.code)
        }
  
      } catch (error) {
        console.error('Error during registration:', error);
       
      }
      
    };

    getToken();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      PushNotification.localNotification({
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        playSound: true,
        soundName: 'default',
      });
    });

    return unsubscribe;
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="IntroScreen">
        <Stack.Screen
          name="IntroScreen"
          component={IntroScreen}
          options={{headerShown: false}}
        />
{/* <Stack.Screen
  name="ProductList"
  component={ProductListScreen}
  options={{ title: 'Sản phẩm', headerShown: true }}
/>
<Stack.Screen
  name="ProductDetail"
  component={ProductDetailScreen}
  options={{ title: 'Chi tiết sản phẩm', headerShown: true }}
/> */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
          }}
        />
       <Stack.Screen
          name="Notification"
          component={Notification}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AddUsers"
          component={AddUsers}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Client"
          component={ClientNavigator}
          options={{
            headerShown: false,
            title: 'Trang Chủ',
          }}
        />
        <Stack.Screen
          name="Main"
          component={MainNavigator}
          options={{
            headerShown: false,
            title: 'Trang Chủ',
          }}
        />
       

        <Stack.Screen
          name="FormTask"
          component={FormTask}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="EditTaskTongQuan"
          component={EditTaskTongQuan}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="TaskUserList"
          component={TaskUserList}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AddLichZalo"
          component={AddLichZalo}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ListTask"
          component={ListTask}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ImportTask"
          component={ImportTask}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetail}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ChiTietTaskUser"
          component={ChiTietTaskUser}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        {/* <Stack.Screen
          name="ListTaskByUser"
          component={ListTaskByUser}
          options={{
            title: '',
            headerShown: true,
          }}
        /> */}
        <Stack.Screen
          name="ConfirmTask"
          component={ConfirmTask}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="TaskListHandle"
          component={TaskListHandle}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Registration"
          component={Registration}
          options={{
            title: '',
            headerShown: true,
          }}
        />
         <Stack.Screen
          name="EditLichZalo"
          component={EditLichZalo}
          options={{
            title: '',
            headerShown: true,
          }}
        />
         <Stack.Screen
          name="DetailsZalo"
          component={DetailsZalo}
          options={{
            title: '',
            headerShown: true,
          }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
