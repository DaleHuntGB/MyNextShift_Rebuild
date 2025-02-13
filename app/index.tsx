import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, Touchable } from "react-native";
import { Calendar } from 'react-native-calendars';

const App = () => {
  const GetCurrentDate = () => {
    const todayDate = new Date();
    return todayDate.toISOString().split('T')[0];
  };

  const FormatDate = () => {
    const date = new Date(selectedDate);
    let month = date.toLocaleString('default', { month: 'long' });
    let day = date.getDate();
    let year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const OpenAddShiftModal = (selectedDate: string) => {
    setIsShiftModalVisible(true);
    console.log('Add Shift for ' + FormatDate(selectedDate));
  }

  const [selectedDate, setSelectedDate] = useState(GetCurrentDate());
  const [isShiftModalVisible, setIsShiftModalVisible] = useState(false);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.calendarWrapper}>
        <Calendar
          style={styles.calendarContainer}
          enableSwipeMonths={true}
          monthFormat={'MMMM yyyy'}
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markingType={'custom'}
          markedDates={{
            [selectedDate]: {
              selected: true,
              customStyles: {
                container: {
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#8080FF'
                },
                text: {
                  textAlign: 'center',
                  fontWeight: 'bold',
                }
              }
            }
          }}
          theme={{
            calendarBackground: '#1A1A1A',
            monthTextColor: '#8080FF',
            textSectionTitleColor: '#9090FF',
            todayTextColor: '#40FFFF',
            dayTextColor: '#F3F3F3',
            textDisabledColor: '#9D9D9D',
            selectedDayBackgroundColor: '#5F5F5F',
            selectedDayTextColor: '#FFFFFF',
          }}
        />
      </View>
      <View style={styles.shiftContainer}>
        <Text style={styles.shiftText}>{FormatDate()}</Text>
      </View>
      <Modal
        animationType='fade'
        transparent={true}
        visible={isShiftModalVisible}
        onRequestClose={() => setIsShiftModalVisible(false)}
      >
        <View style={styles.shiftModalContainer} >
          <View style={styles.shiftModalContentContainer} >
            <Text style={styles.shiftModalContentContainerText}> {FormatDate()} </Text>
            <View style={styles.shiftModalButtonContainer}>
                <TouchableOpacity style={styles.saveShiftButton}
                  onPress={() => {
                    console.log('Save Shift for ' + FormatDate(selectedDate));
                    setIsShiftModalVisible(false)
                  }}
                  >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shiftModalButton} onPress={() => setIsShiftModalVisible(false)} >
                <Text style={styles.shiftModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.defaultButton}
        onPress={() => 
          OpenAddShiftModal(selectedDate)
        }>
        <Text style={styles.defaultButtonText}>Add Shift</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  calendarWrapper: {
    flex: 0.5,
    backgroundColor: '#1A1A1A',
    width: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  calendarContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingTop: 24,
    paddingRight: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    width: '100%',
  },
  shiftContainer: {
    flex: 0.6,
    backgroundColor: '#CCCCCC',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  shiftText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  shiftModalContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftModalContentContainer: {
    backgroundColor: '#CCCCCC',
    borderRadius: 10,
    padding: 24,
    width: '80%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: '50%',
    borderWidth: 1
  },
  shiftModalContentContainerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  shiftModalButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 10
  },
  saveShiftButton: {
    backgroundColor: '#40FF40',
    borderRadius: 10,
    padding: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1
  },
  saveButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shiftModalButton: {
    backgroundColor: '#4080FF',
    borderRadius: 10,
    padding: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1
  },
  shiftModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  defaultButton: {
    flex: 0.1,
    backgroundColor: '#4080FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;