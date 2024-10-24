
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import Theme from "../configs/color";

function DayItem({ date, active }) {
    const day_split = date.split(',');
    const dayName = day_split[0];
    let day = "";

    // Chuyển đổi tên ngày tiếng Anh sang tiếng Việt
    switch (dayName.trim()) {
        case 'Monday':
            day = "Thứ 2";
            break;
        case 'Tuesday':
            day = "Thứ 3";
            break;
        case 'Wednesday':
            day = "Thứ 4";
            break;
        case 'Thursday':
            day = "Thứ 5";
            break;
        case 'Friday':
            day = "Thứ 6";
            break;
        case 'Saturday':
            day = "Thứ 7";
            break;
        case 'Sunday':
            day = "Chủ nhật";
            break;
        default:
            day = ""; // Nếu không phải ngày hợp lệ
            break;
    }

    return (
        <View style={[styles.container, active && styles.active]}>
            <Text style={{ color: 'black', fontSize:26, fontWeight:"bold" }}>{day_split[1].trim()}</Text>
            <Text style={{ color: 'black', fontSize:10, fontWeight:"thin" }}>{day}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        width: 70,
        height: 120,
        backgroundColor: Theme.white,
        borderRadius: 40,
        padding: 10,
        margin: 5,
    },
    active: {
        backgroundColor: Theme.primary, // Màu nền khi active
    },
});

export default DayItem;
