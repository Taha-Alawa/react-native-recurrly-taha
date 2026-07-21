import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="bg-blue-500 text-white p-4 rounded">Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
