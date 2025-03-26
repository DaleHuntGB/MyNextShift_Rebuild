import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from "react-native";
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const GetCurrentDate = () => new Date().toISOString().split('T')[0];
  const GetCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const [selectedDate, setSelectedDate] = useState(GetCurrentDate());
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [markedShifts, setMarkedShifts] = useState({});
  const [isShiftModalVisible, setIsShiftModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("00:00");
  const [income, setIncome] = useState<number>(0);
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(12.60);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [tempRate, setTempRate] = useState(hourlyRate.toString());
  const [shouldUpdateShifts, setShouldUpdateShifts] = useState(false);

  useEffect(() => {
    loadAllShifts();
    loadShifts(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setIncome(calculateIncome());
  }, [startTime, endTime]);

  useEffect(() => {
    (async () => {
      const savedRate = await AsyncStorage.getItem('hourlyRate');
      if (savedRate) {
        setHourlyRate(parseFloat(savedRate));
        setTempRate(parseFloat(savedRate).toString());
      }
    })();
  }, []);


  useEffect(() => {
    if (shouldUpdateShifts) {
      updateExistingShiftIncome();
      setShouldUpdateShifts(false);
    }
  }, [hourlyRate]);

  const FormatDate = () => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDateChange = (day: any) => {
    setSelectedDate(day.dateString);
    setSelectedShift(null);
    loadShifts(day.dateString);
  };

  const calculateIncome = () => {
    const start = new Date(`${selectedDate} ${startTime}`);
    const end = new Date(`${selectedDate} ${endTime}`);
    const hours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    setHoursWorked(hours);
    return parseFloat((hours * hourlyRate).toFixed(2));
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
      const calculatedIncome = calculateIncome();
      let existingShifts = await AsyncStorage.getItem(`shifts-${selectedDate}`);
      existingShifts = existingShifts ? JSON.parse(existingShifts) : [];

      if (selectedShift) {
        existingShifts = existingShifts.map(shift => shift.id === selectedShift.id ? { ...shift, startTime, endTime, income: calculatedIncome, hoursWorked } : shift );
      } else {
        const newShift = { id: Date.now(), startTime, endTime, income: calculatedIncome, hoursWorked};
        existingShifts.push(newShift);
      }

      await AsyncStorage.setItem(`shifts-${selectedDate}`, JSON.stringify(existingShifts));

      setSelectedShift(null);
      setIsShiftModalVisible(false);
      loadAllShifts();
      loadShifts(selectedDate);
    } catch (error) {
      console.error("Cannot Save Shift:", error);
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
                borderRadius: 3,
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
      setIsShiftModalVisible(false);
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  const updateExistingShiftIncome = async () => {
    try {
      const savedShifts = await AsyncStorage.getItem(`shifts-${selectedDate}`);
      const parsedShifts = savedShifts ? JSON.parse(savedShifts) : [];
  
      const updatedShifts = parsedShifts.map(shift => {
        const start = new Date(`${selectedDate} ${shift.startTime}`);
        const end = new Date(`${selectedDate} ${shift.endTime}`);
        const hours = (end - start) / 3600000;
        return {
          ...shift,
          hoursWorked: hours,
          income: parseFloat((hours * hourlyRate).toFixed(2)),
        };
      });
  
      await AsyncStorage.setItem(`shifts-${selectedDate}`, JSON.stringify(updatedShifts));
      loadAllShifts();
      loadShifts(selectedDate);
    } catch (error) {
      console.error("Error updating all shift incomes:", error);
    }
  };
  

  return (
    <View style={styles.mainContainer}>
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
      <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
        <Text style={{ color: '#8080FF', fontWeight: 'bold', fontSize: 16 }}>Settings</Text>
      </TouchableOpacity>
    </View>

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
                  borderRadius: 3,
                  borderWidth: 1,
                  borderColor: '#8080FF'
                },
                text: { textAlign: 'center', fontWeight: 'bold' }
              }
            },
          }}
          theme={{
            calendarBackground: '#121212',
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
                  setIsShiftModalVisible(true);
                }}
              >
                <Text style={styles.shiftText}>
                  {`${shift.startTime} - ${shift.endTime} | £${shift.income.toFixed(2)} | ${shift.hoursWorked}hrs`}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noShiftsText}>No Shifts Yet</Text>
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
                <Text style={styles.saveButtonText}>{selectedShift ? "Save Shift" : "Add Shift"}</Text>
              </TouchableOpacity>

              {selectedShift ? (
                <TouchableOpacity style={styles.deleteShiftButton} onPress={() => deleteShift(selectedShift.id)}>
                  <Text style={styles.deleteButtonText}>Delete Shift</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.shiftModalButton} onPress={() => setIsShiftModalVisible(false)}>
                  <Text style={styles.shiftModalButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>
      </Modal>

      <Modal
          animationType="fade"
          transparent={true}
          visible={isSettingsVisible}
          onRequestClose={() => setIsSettingsVisible(false)}
        >
          <View style={styles.shiftModalContainer}>
            <View style={styles.shiftModalContentContainer}>
              <Text style={styles.shiftModalContentContainerText}>Settings</Text>

              <View style={{ width: '100%', marginBottom: 20 }}>
              <Text style={{ marginBottom: 8, fontWeight: '600' }}>Hourly Rate (£):</Text>
              <TextInput
                style={{
                  backgroundColor: '#E0E0E0',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#333',
                  textAlign: 'center',
                  justifyContent: 'center',
                  alignContent: 'center',
                }}
                keyboardType="decimal-pad"
                value={tempRate}
                onChangeText={setTempRate}
              />
            </View>
            <TouchableOpacity
              style={styles.saveShiftButton}
              onPress={async () => {
                const rate = parseFloat(tempRate);
                if (!isNaN(rate)) {
                  await AsyncStorage.setItem('hourlyRate', rate.toString());
                  setHourlyRate(rate);
                  setShouldUpdateShifts(true);
                  setIsSettingsVisible(false);
                } else {
                  alert("Please enter a valid number.");
                }
              }}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            </View>
          </View>
        </Modal>


      <TouchableOpacity
        style={styles.defaultButton}
        onPress={() => {
          setStartTime(GetCurrentTime());
          setEndTime("00:00");
          setSelectedShift(null);
          setIsShiftModalVisible(true);
        }}
      >
        <Text style={styles.defaultButtonText}>Add Shift</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  calendarWrapper: {
    flex: 0.75,
    backgroundColor: '#121212',
    width: '100%',
  },
  calendarContainer: {
    backgroundColor: '#121212',
    padding: 10,
    borderRadius: 10,
    width: '100%',
  },
  shiftContainer: {
    flex: 0.5,
    backgroundColor: '#F5F5F5',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    elevation: 10,
  },
  shiftText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  shiftModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftModalContentContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#CCC',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 10,
  },
  shiftModalContentContainerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  timeContentContainer: {
    width: '100%',
    gap: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  timePicker: {
    backgroundColor: '#80C0FF',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  incomeText: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  saveShiftButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#388E3C',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shiftModalButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  shiftModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteShiftButton: {
    backgroundColor: '#FF5252',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  defaultButton: {
    flex: 0.1,
    backgroundColor: '#6A5ACD',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: '#333',
  },
  defaultButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  shiftItem: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 3,
  },
  selectedShift: {
    backgroundColor: '#AED6F1',
    borderColor: '#5DADE2',
  },
  noShiftsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  shiftList: {
    flex: 1,
    width: '100%',
    backgroundColor: '#EEEEEE',
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
  },
});


export default App;
