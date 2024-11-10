import React,{useRef} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Theme from '../configs/color';
import moment from 'moment'; // Import moment
import * as FeatherIcons from 'react-native-feather';

function TaskItem({ task, isSelected = false }) {
  const navigation = useNavigation();

  const descriptionWithoutPreTags = task.description.replace(/<pre[^>]*>|<\/pre>/g, '');
  const isToday = moment().isSame(moment(task.datetimeTask), 'day');
  return (
    <View style={isSelected ? [styles.container, styles.active] : [styles.container, styles.empty]}>
    <Text style={styles.title}>{task.title}</Text>
    <Text style={styles.description}>{descriptionWithoutPreTags}</Text>
    {isToday && (
        <View style={styles.todayContainer}>
          <FeatherIcons.AlertOctagon width={16} height={16} color={'#FF8C00'} />
          <Text style={styles.todayText}> Hôm nay</Text>
        </View>
      )}
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
    width: "100%",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    maxWidth: "80%",
  },
  todayContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    right: 10,  
    top: 10, 
    padding: 12,
    fontWeight: 700,
    backgroundColor: '#C6E6F1',
    borderRadius: 12
  },
  todayText:{
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: 700,

  },
  active: {
    backgroundColor: Theme.accent,
  },
  empty: {
    backgroundColor: 'white',
  },
});

export default TaskItem;
