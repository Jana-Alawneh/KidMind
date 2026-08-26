import {
  SafeAreaView,
} from "react-native-safe-area-context";

import MobileChat from "@/components/chat/MobileChat";


export default function ChatScreen() {

  return (

    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          "#F7F8FC",
      }}
      edges={[
        "top",
        "bottom",
      ]}
    >

      <MobileChat />

    </SafeAreaView>

  );

}
