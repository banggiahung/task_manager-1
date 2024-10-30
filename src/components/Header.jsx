import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

function Header({title}) {

    const navigation = useNavigation()
    const handleNavigate = ()=>{
        navigation.navigate("Profile")
    }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <TouchableOpacity onPress={handleNavigate}>
        <Image
          source={{uri: 'https://i.pravatar.cc/300'}}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    margin:"auto",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 48,
  },
});

export default Header;
