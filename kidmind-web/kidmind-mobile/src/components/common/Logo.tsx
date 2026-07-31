import {
    Image,
    StyleSheet,
    View,
} from "react-native";

import logo from "../../../assets/images/logo.png";


const Logo = () => {
  return (
    <View style={styles.container}>

      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
      />

    </View>
  );
};


const styles = StyleSheet.create({

  container: {
    alignItems: "center",
    marginBottom: 32,
  },

  logo: {
    width: 160,
    height: 160,
  },

});


export default Logo;