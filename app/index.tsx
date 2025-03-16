import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const App = () => {
  const GetCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const FormatDate = () => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const OpenAddShiftModal = () => {
    setIsShiftModalVisible(true);
  };

  const [selectedDate, setSelectedDate] = useState(GetCurrentDate());
  const [isShiftModalVisible, setIsShiftModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const showTimePicker = (type: "start" | "end") => {
    setActivePicker(type);
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
    setActivePicker(null);
  };

  const handleConfirm = (selectedTime: Date) => {
    const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (activePicker === "start") {
      setStartTime(formattedTime);
    } else if (activePicker === "end") {
      setEndTime(formattedTime);
    }

    hideTimePicker();
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.calendarWrapper}>
        <Calendar
          style={styles.calendarContainer}
          enableSwipeMonths={true}
          monthFormat={'MMMM yyyy'}
          onDayPress={(day) => setSelectedDate(day.dateString)}
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
        <View style={styles.shiftModalContainer}>
          <View style={styles.shiftModalContentContainer}>
            <Text style={styles.shiftModalContentContainerText}>{FormatDate()}</Text>

            <View style={styles.timeContentContainer}>
              <TouchableOpacity style={styles.timePicker} onPress={() => showTimePicker("start")}>
                <Text>{startTime ? `Start Time: ${startTime} ` : "Select Start Time "}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.timePicker} onPress={() => showTimePicker("end")}>
                <Text>{endTime ? `End Time: ${endTime} ` : "Select End Time "}</Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleConfirm}
                onCancel={hideTimePicker}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.saveShiftButton}
                onPress={() => {
                  console.log(`Shift on ${FormatDate()} from ${startTime} to ${endTime}`);
                  setIsShiftModalVisible(false);
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shiftModalButton} onPress={() => setIsShiftModalVisible(false)}>
                <Text style={styles.shiftModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.defaultButton}
        onPress={OpenAddShiftModal}
      >
        <Text style={styles.defaultButtonText}>Add Shift</Text>
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
  }
});

export default App;
