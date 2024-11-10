import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ListTask from '../screens/Admin/ListTask';
import AddUsers from '../screens/Admin/AddUsers';
import Dashboard from '../screens/Admin/Dashboard';
import LichZalo from '../screens/Admin/LichZalo';

import * as FeatherIcons from 'react-native-feather';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AppConfig from '../screens/Admin/AppConfig';

const Tab = createBottomTabNavigator();

function CustomTabBarButton({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.centerButtonContainer}
      onPress={onPress}
    >
      <View style={styles.centerButton}>
        <FeatherIcons.Home width={30} height={30} color="#FFF" /> 
      </View>
    </TouchableOpacity>
  );
}
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          borderWidth: 0,
          margin: 10
        },
        tabBarActiveTintColor: '#e91e63', // Màu cho tab đang được chọn
        tabBarInactiveTintColor: 'gray', // Màu cho tab không được chọn
      }}>
       <Tab.Screen
        name="AppConfig"
        component={AppConfig}
        options={{
          title: '',
          tabBarIcon: ({color, size}) => (
            <FeatherIcons.Box width={size} height={size} color={color} />
          ),
        }}

      />
      <Tab.Screen
        name="ListTask"
        component={ListTask}
        options={{
          title: '',
          tabBarIcon: ({color, size}) => (
            <FeatherIcons.List width={size} height={size} color={color} />
          ),
        }}

      />
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title : '',
          
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
       <Tab.Screen
        name="AddUsers"
        component={AddUsers}
        options={{
          title: '',
          tabBarIcon: ({color, size}) => (
            <FeatherIcons.UserPlus width={size} height={size} color={color} />
          ),
        }}
        
      />
      <Tab.Screen
        name="LichZalo"
        component={LichZalo}
        options={{
          title: '',
          tabBarIcon: ({color, size}) => (
            <FeatherIcons.Calendar width={size} height={size} color={color} />
          ),
        }}
        
      />
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  tabBarStyle: {
   
  },
  centerButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    top: -20,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7B47F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default MainNavigator;
