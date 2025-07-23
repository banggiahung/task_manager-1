import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
import { AppRegistry, Platform } from 'react-native';
import App from './App.jsx';
import { name as appName } from './app.json';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification'
AppRegistry.registerComponent(appName, () => App);

PushNotification.configure({
    onRegister: function (token) {
        console.log("token", token)
    },
    onNotification: function (notification) {
        console.log("notification", notification)
        notification.finish(PushNotificationIOS.FetchResult.NoData)
    },
    channelId: '1',

    permissions: {
        alert: true,
        badge: true,
        sound: true,
    },

    popInitialNotification: true,

    requestPermissions: Platform.OS === 'ios',
})