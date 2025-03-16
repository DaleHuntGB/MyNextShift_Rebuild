import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, FlatList, ScrollView } from "react-native";
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const GetCurrentDate = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(GetCurrentDate());
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [markedShifts, setMarkedShifts] = useState({});
  const [isShiftModalVisible, setIsShiftModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("00:00");

  useEffect(() => {
    loadAllShifts();
    loadShifts(selectedDate);
  }, [selectedDate]);

  const FormatDate = () => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDateChange = (day: any) => {
    setSelectedDate(day.dateString);
    setSelectedShift(null);
    loadShifts(day.dateString);
  };

  const showTimePicker = (type: "start" | "end") => {
    setActivePicker(type);
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
    setActivePicker(null);
  };

  const handleConfirm = (selectedTime: Date) => {
    const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    activePicker === "start" ? setStartTime(formattedTime) : setEndTime(formattedTime);
    hideTimePicker();
  };

  const saveShift = async () => {
    try {
      const newShift = { id: Date.now(), startTime, endTime };
      let existingShifts = await AsyncStorage.getItem(`shifts-${selectedDate}`);
      existingShifts = existingShifts ? JSON.parse(existingShifts) : [];

      if (selectedShift) {
        // Edit existing shift
        const updatedShifts = existingShifts.map(shift =>
          shift.id === selectedShift.id ? { ...shift, startTime, endTime } : shift
        );
        await AsyncStorage.setItem(`shifts-${selectedDate}`, JSON.stringify(updatedShifts));
      } else {
        // Add new shift
        existingShifts.push(newShift);
        await AsyncStorage.setItem(`shifts-${selectedDate}`, JSON.stringify(existingShifts));
      }

      setSelectedShift(null);
      setIsShiftModalVisible(false);
      loadAllShifts();
      loadShifts(selectedDate);
    } catch (error) {
      console.error("Error saving shift:", error);
    }
  };

  const loadAllShifts = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const shiftKeys = keys.filter(key => key.startsWith("shifts-"));

      let markedDates = {};
      for (const key of shiftKeys) {
        const date = key.replace("shifts-", "");
        const shifts = await AsyncStorage.getItem(key);
        if (shifts && JSON.parse(shifts).length > 0) {
          markedDates[date] = {
            customStyles: {
              container: {
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#FFFFFF'
              },
              text: {
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'white'
              }
            }
          };
        }
      }
      setMarkedShifts(markedDates);
    } catch (error) {
      console.error("Error loading all shifts:", error);
    }
  };

  const loadShifts = async (date) => {
    try {
      const savedShifts = await AsyncStorage.getItem(`shifts-${date}`);
      setShifts(savedShifts ? JSON.parse(savedShifts) : []);
    } catch (error) {
      console.error("Error loading shifts:", error);
    }
  };

  const deleteShift = async (id) => {
    try {
      const updatedShifts = shifts.filter(shift => shift.id !== id);
      await AsyncStorage.setItem(`shifts-${selectedDate}`, JSON.stringify(updatedShifts));
      setSelectedShift(null);
      loadAllShifts();
      loadShifts(selectedDate);
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.calendarWrapper}>
        <Calendar
          style={styles.calendarContainer}
          enableSwipeMonths={true}
          monthFormat={'MMMM yyyy'}
          onDayPress={(day) => handleDateChange(day)}
          markingType={'custom'}
          markedDates={{
            ...markedShifts,
            [selectedDate]: {
              selected: true,
              customStyles: {
                container: {
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#8080FF'
                },
                text: { textAlign: 'center', fontWeight: 'bold' }
              }
            },
          }}
          theme={{
            calendarBackground: '#1A1A1A',
            monthTextColor: '#8080FF',
            todayTextColor: '#40FFFF',
            dayTextColor: '#F3F3F3',
            textDisabledColor: '#9D9D9D'
          }}
        />
      </View>

      <View style={styles.shiftContainer}>
        <Text style={styles.shiftText}>{FormatDate()}</Text>
        <ScrollView style={styles.shiftList}>
          {shifts.length > 0 ? (
            shifts.map(shift => (
              <TouchableOpacity
                key={shift.id}
                style={[
                  styles.shiftItem,
                  selectedShift?.id === shift.id && styles.selectedShift
                ]}
                onPress={() => {
                  setSelectedShift(shift);
                  setStartTime(shift.startTime);
                  setEndTime(shift.endTime);
                }}
              >
                <Text style={styles.shiftText}>{`${shift.startTime} - ${shift.endTime}`}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noShiftsText}>No Shifts Added</Text>
          )}
        </ScrollView>
      </View>

      <Modal
        animationType='fade'
        transparent={true}
        visible={isShiftModalVisible}
        onRequestClose={() => setIsShiftModalVisible(false)}
      >
        <View style={styles.shiftModalContainer}>
          <View style={styles.shiftModalContentContainer}>
            <Text style={styles.shiftModalContentContainerText}>{FormatDate()}</Text>

            <View style={styles.timeContentContainer}>
              <TouchableOpacity style={styles.timePicker} onPress={() => showTimePicker("start")}>
                <Text>{startTime} </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timePicker} onPress={() => showTimePicker("end")}>
                <Text>{endTime} </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleConfirm}
                onCancel={hideTimePicker}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveShiftButton} onPress={saveShift}>
                <Text style={styles.saveButtonText}>{selectedShift ? "Edit Shift" : "Add Shift"}</Text>
              </TouchableOpacity>
              {selectedShift && (
                <TouchableOpacity style={styles.deleteShiftButton} onPress={() => deleteShift(selectedShift.id)}>
                  <Text style={styles.deleteButtonText}>Delete Shift</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.shiftModalButton} onPress={() => setIsShiftModalVisible(false)}>
                <Text style={styles.shiftModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.defaultButton}
        onPress={() => setIsShiftModalVisible(true)}
      >
        <Text style={styles.defaultButtonText}>{selectedShift ? "Edit Shift" : "Add Shift"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  calendarWrapper: {
    flex: 0.6,
    backgroundColor: '#1A1A1A',
    width: '100%',
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
  timeContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 15
  },
  timePicker: {
    backgroundColor: '#4080FF',
    borderRadius: 10,
    padding: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveShiftButton: {
    backgroundColor: '#40FF40',
    borderRadius: 10,
    padding: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 15
  },
  shiftItem: {
    backgroundColor: '#BBBBBB',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
    borderWidth: 1
  },
  selectedShift: {
    backgroundColor: '#4080FF',
  },
  deleteShiftButton: {
    backgroundColor: '#FF4040',
    borderRadius: 10,
    padding: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  deleteButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noShiftsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftList: {
    flex: 1,
    width: '100%',
    backgroundColor: '#404040',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
});

export default App;
