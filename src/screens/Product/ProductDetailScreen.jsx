import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const ProductDetailScreen = ({ route }) => {
  const { product } = route.params;

  const handleContact = () => {
    Linking.openURL(`mailto:contact@beautystore.vn?subject=Quan tâm: ${product.name}`);
  };

  return (
    <View style={styles.container}>
      <Image source={product.image} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.moreInfo}>
        ✨ Thành phần thiên nhiên an toàn cho mọi loại da.
        {'\n'}✨ Hiệu quả đã được kiểm chứng.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleContact}>
        <Text style={styles.buttonText}>📩 Liên hệ tư vấn</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff0f5' },
  image: { width: '100%', height: 250, borderRadius: 12, marginBottom: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#c2185b' },
  description: { fontSize: 16, color: '#555', marginVertical: 8 },
  moreInfo: { fontSize: 14, color: '#333', marginBottom: 20 },
  button: {
    backgroundColor: '#c2185b',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProductDetailScreen;
