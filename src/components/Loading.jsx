import React from "react";
import { View, ActivityIndicator, StyleSheet,Text} from "react-native";

export default function Loading(size="large", color = "#0000fff"){
   return(
    <View style={styles.container}>
        <ActivityIndicator size={size} color={color}/>
    </View>
   )
}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: 'rgba(255,255,255,0.5)'
    }
})