import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";

interface InputProps extends TextInputProps {
  label: string;
}

const Input = ({
  label,
  ...props
}: InputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        style={styles.input}
        placeholderTextColor="#8E91A8"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E91A8",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    height: 56,

    paddingHorizontal: 20,

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#ECECF5",

    fontSize: 16,
    color: "#1E1E2D",
  },
});

export default Input;