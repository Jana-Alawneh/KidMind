import {
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

import logo from "../../../assets/images/logo.png";


interface LogoProps {
  small?: boolean;
}


const Logo = ({
  small = false,
}: LogoProps) => {

  return (

    <View style={styles.container}>


      <Image
        source={logo}
        resizeMode="contain"
        style={
          small
            ? styles.smallLogo
            : styles.largeLogo
        }
      />



      <View>

        <Text style={styles.title}>
          KidMind
        </Text>


        <Text style={styles.subtitle}>
          Cognitive Assessment
        </Text>


      </View>


    </View>

  );
};



const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },


  smallLogo: {
    width: 48,
    height: 48,
  },


  largeLogo: {
    width: 64,
    height: 64,
  },


  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },


  subtitle: {
    fontSize: 12,
    color: "#94A3B8",
  },

});


export default Logo;