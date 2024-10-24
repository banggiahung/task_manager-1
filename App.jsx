import 'react-native-gesture-handler';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Dashboard from './src/screens/Admin/Dashboard.jsx';
import ListTask from './src/screens/Admin/ListTask.jsx';
import FormTask from './src/screens/Admin/FormTask.jsx';
import ImportTask from './src/screens/Admin/ImportTask.jsx';

import Home from './src/screens/Member/Home.jsx';

import Login from './src/screens/Auth/Login.jsx';
import Profile from './src/screens/Auth/Profile.jsx';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="FormTask"
          component={FormTask}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            title:"",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ListTask"
          component={ListTask}
          options={{
            title:"",
            headerShown: false,  
          }}
        />
        <Stack.Screen
          name="ImportTask"
          component={ImportTask}
          options={{
            title:"",
            headerShown: true,  
            headerBackTitleVisible:false
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
