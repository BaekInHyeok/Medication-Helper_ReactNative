import { Medicine } from "./Medicine";
import { Box, Text } from "native-base";
import { View, StyleSheet } from "react-native";

export default function MedicineCell({ item }: { item: Medicine }) {
  return (
    <View style={styles.container}>
      <Text color="white">{item.ITEM_NAME}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderColor: "white",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    color: "white",
    backgroundColor: "rgba(50,50,50,1)",
  },
  name: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },
  gender: {
    color: "white",
    fontSize: 15,
  },
  age: {
    color: "white",
    fontSize: 15,
  },
});
