import React, {useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ListTaskByUser from '../screens/Member/ListTaskByUser';
import ZaloClient from '../screens/Member/ZaloClient';

import Home from '../screens/Member/Home';

import * as FeatherIcons from 'react-native-feather';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {storeData, getData} from '../configs/asyncStorage.js';

const Tab = createBottomTabNavigator();

function CustomTabBarButton({onPress}) {
  return (
    <TouchableOpacity style={styles.centerButtonContainer} onPress={onPress}>
      <View style={styles.centerButton}>
        <FeatherIcons.Home width={30} height={30} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
}
const ClientNavigator = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getData('userId');
      if (id) {
        setUserId(id);
      }
    };
    fetchUserId();
  }, []);
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
          margin: 10,
        },
        tabBarActiveTintColor: '#e91e63', // Màu cho tab đang được chọn
        tabBarInactiveTintColor: 'gray', // Màu cho tab không được chọn
      }}>
      {userId && (
        <Tab.Screen
          name="ListTaskByUser"
          component={ListTaskByUser}
          initialParams={{userId: userId}}
          options={{
            title: '',
            tabBarIcon: ({color, size}) => (
              <FeatherIcons.Archive width={size} height={size} color={color} />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: '',

          tabBarButton: props => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="ZaloClient"
        component={ZaloClient}
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
  tabBarStyle: {},
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
export default ClientNavigator;
