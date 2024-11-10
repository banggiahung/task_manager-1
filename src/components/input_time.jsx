import React, { useState } from 'react';
import { View, Button, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TimePickerExample = () => {
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(true);

  // Hàm xử lý khi người dùng chọn giờ và phút
  const onChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowPicker(Platform.OS === 'ios'); // Đóng picker nếu là Android
    setTime(currentTime); // Cập nhật thời gian
  };

  // Hiển thị trình chọn thời gian
  const showTimepicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button onPress={showTimepicker} title="Chọn giờ" />

      {showPicker && (
        <DateTimePicker
          value={time} 
          mode="time" 
          display="default" 
          onChange={onChange} 
          textColor={'#000000'}
          
        />
      )}

      <Text style={{ marginTop: 20 }}>
        Giờ đã chọn: {time.getHours()}:{time.getMinutes()}
      </Text>
    </View>
  );
};

export default TimePickerExample;