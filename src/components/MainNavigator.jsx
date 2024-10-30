import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ListTask from '../screens/Admin/ListTask';
import AddUsers from '../screens/Admin/AddUsers';
import Dashboard from '../screens/Admin/Dashboard';
import * as FeatherIcons from 'react-native-feather';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff', // Màu nền tab bar
          paddingBottom: 10,
          margin: 20, 
          borderRadius: 12
        },
        tabBarActiveTintColor: '#e91e63', // Màu cho tab đang được chọn
        tabBarInactiveTintColor: 'gray', // Màu cho tab không được chọn
      }}>
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({color, size}) => (
            <FeatherIcons.Home width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ListTask"
        component={ListTask}
        options={{
          title: 'Danh Sách',
          tabBarIcon: ({color, size}) => (
            <FeatherIcons.List width={size} height={size} color={color} />
          ),
        }}

      />
       <Tab.Screen
        name="AddUsers"
        component={AddUsers}
        options={{
          title: 'Nhân viên',
          tabBarIcon: ({color, size}) => (
            <FeatherIcons.UserPlus width={size} height={size} color={color} />
          ),
        }}
        
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
