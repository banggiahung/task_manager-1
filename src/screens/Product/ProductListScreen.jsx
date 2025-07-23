import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const products = [
  {
    id: '1',
    name: 'Serum Vitamin C',
    image: require('../../assets/background.png'),
    description: 'Dưỡng sáng da, giảm thâm nám, chống lão hóa.',
  },
  {
    id: '2',
    name: 'Kem Dưỡng Ẩm',
     image: require('../../assets/background.png'),
    description: 'Giữ ẩm sâu, da mềm mại cả ngày.',
  },
];

const ProductListScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌸 Sản phẩm Beauty 🌸</Text>
        <View style={styles.buttonWrapper}>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={styles.buttonText}>✨ Trở thành thành viên ✨</Text>
    </TouchableOpacity>
  </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff0f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#d63384', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: '100%', height: 160, borderRadius: 10, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: '600', color: '#c2185b' },
  desc: { fontSize: 14, color: '#555' },
  buttonWrapper: {
  alignItems: 'center', // Căn giữa nút theo chiều ngang
  marginVertical: 10,
},

});

export default ProductListScreen;
