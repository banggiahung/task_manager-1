import React from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Card, Button } from 'react-native-paper'; 


function ChiTietTaskUser () {
  return (
    <View style={styles.container}>
      {/* Header with Gradient Background */}
      <LinearGradient
        colors={['#6A00F4', '#AE47F1']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Create a Task</Text>
        </View>
      </LinearGradient>

      {/* Form Section */}
      <View style={styles.form}>
        <TextInput
          label="Name"
          value="Design Changes"
          style={styles.input}
          underlineColor="rgba(255, 255, 255, 0.3)"
          editable={false}
        />
        <TextInput
          label="Date"
          value="Oct 24, 2020"
          style={styles.input}
          underlineColor="rgba(255, 255, 255, 0.3)"
          editable={false}
        />

        {/* Time Section */}
        <Card style={styles.timeCard}>
          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <Text style={styles.timeValue}>01:22 pm</Text>
            </View>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>End Time</Text>
              <Text style={styles.timeValue}>03:20 pm</Text>
            </View>
          </View>
        </Card>

        {/* Description Field */}
        <TextInput
          label="Description"
          value="Lorem ipsum dolor sit amet, er adipiscing elit, sed dianummy nibh euismod dolor sit amet, er adipiscing elit, sed dianummy nibh euismod."
          multiline
          numberOfLines={4}
          style={styles.descriptionInput}
          underlineColor="rgba(255, 255, 255, 0.3)"
        />

        {/* Category Section */}
        <Text style={styles.categoryLabel}>Category</Text>
        <View style={styles.categoryRow}>
          {['Design', 'Meeting', 'Coding', 'BDE', 'Testing', 'Quick call'].map((category, index) => (
            <Button
              key={index}
              mode={category === 'Design' ? 'contained' : 'outlined'}
              style={[
                styles.categoryButton,
                category === 'Design' && styles.selectedCategoryButton,
              ]}
              labelStyle={category === 'Design' ? styles.selectedCategoryText : styles.categoryText}
            >
              {category}
            </Button>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <Button mode="contained" style={styles.submitButton}>
        Create Task
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  timeCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeLabel: {
    color: '#A3A3A3',
    fontSize: 12,
  },
  timeValue: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  descriptionInput: {
    backgroundColor: 'transparent',
    marginVertical: 12,
  },
  categoryLabel: {
    color: '#A3A3A3',
    fontSize: 14,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#6A00F4',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  categoryText: {
    color: '#6A00F4',
  },
  submitButton: {
    margin: 16,
    borderRadius: 20,
    paddingVertical: 8,
    backgroundColor: '#6A00F4',
  },
});

export default ChiTietTaskUser;