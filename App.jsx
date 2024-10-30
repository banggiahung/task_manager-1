import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TailwindProvider } from 'tailwindcss-react-native';
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



import Home from './src/screens/Member/Home.jsx';
import ListTaskByUser from './src/screens/Member/ListTaskByUser.jsx';
import ConfirmTask from './src/screens/Member/ConfirmTask.jsx';



import Login from './src/screens/Auth/Login.jsx';
import Profile from './src/screens/Auth/Profile.jsx';
import MainNavigator from './src/components/MainNavigator';
const Stack = createNativeStackNavigator();

function App() {
  return (
    
    <NavigationContainer>
     <Stack.Navigator initialRouteName="IntroScreen">
     <Stack.Screen
          name="IntroScreen" 
          component={IntroScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
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
          name="Main"
          component={MainNavigator}
          options={{
            headerShown: false,
            title: 'Trang Chủ'
          }}
        />

      
        <Stack.Screen
          name="FormTask"
          component={FormTask}
          options={{
          title: "",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            title: "",
            headerShown: true,
          }}
        />
         <Stack.Screen
          name="EditTaskTongQuan"
          component={EditTaskTongQuan}
          options={{
            title: "",
            headerShown: true,
          }}
        />
         <Stack.Screen
          name="TaskUserList"
          component={TaskUserList}
          options={{
            title: "",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ListTask"
          component={ListTask}
          options={{
            title: "",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ImportTask"
          component={ImportTask}
          options={{
            title: "",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetail}
          options={{
            title: "",
            headerShown: true,
          }}
        />
         <Stack.Screen
          name="ChiTietTaskUser"
          component={ChiTietTaskUser}
          options={{
            title: "",
            headerShown: true,
          }}
        />
         <Stack.Screen
          name="ListTaskByUser"
          component={ListTaskByUser}
          options={{
            title: "",
            headerShown: true,
          }}
        />
         <Stack.Screen
          name="ConfirmTask"
          component={ConfirmTask}
          options={{
            title: "",
            headerShown: true,
          }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
