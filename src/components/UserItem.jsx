import { View, Text, Image, StyleSheet } from "react-native";

function UserItem({ user }) {
    return (
        <View style={styles.container}>
            <View style={styles.userCard}>
                <Image source={{ uri: "https://i.pravatar.cc/300" }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.fullName}</Text>
                    <Text style={styles.userUsername}>{user.userName}</Text>
                    <Text style={styles.userKpi}>KPI: {user.kpiUser}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 4, // Tương đương với `p-1`
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 8, // Tương đương với `p-2`
        borderRadius: 8, // Tương đương với `rounded-lg`
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 28,
    },
    userInfo: {
        marginLeft: 12, // Tương đương với `ml-3`
    },
    userName: {
        color: 'black',
        fontWeight: 'bold',
    },
    userUsername: {
        color: 'black',
    },
    userKpi: {
        color: 'black',
        fontWeight: '300', // Tương đương với `font-thin`
    },
});

export default UserItem;
