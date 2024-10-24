import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Theme from '../configs/color';

function TaskItem({ task,  isSelected = false}) {
  const navigation = useNavigation();

  return (
    <View style={isSelected ? [styles.container, styles.active] : [styles.container, styles.empty]}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.description}>{task.description}</Text>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    width:"100%",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom:12
  },
  description: {
    fontSize: 14,
    color: '#666', 
    maxWidth:"80%"
  },
  active: {
    backgroundColor: Theme.accent,
  },
  empty: {
    backgroundColor: 'white', },
});

export default TaskItem;
