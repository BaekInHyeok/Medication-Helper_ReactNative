//MedicRegister.tsx

import React, { useState, useEffect, useRef } from "react";
import { NativeBaseProvider, Box, Input, Text } from "native-base";
import { TextInput, StyleSheet, Image, View } from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import Button from "./Buttons";
import { useIsFocused } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

/*
  스택 네이게이션으로 지정된 컴포넌트는, 여러가지 요소(props)가 주어지는데,
  navigation을 사용하면, 네비게이션으로 지정된 여러가지 화면으로 이동 할 수 있다.
*/

export default function MedicRegister({ navigation }: any) {
  // navigation.navigate("스택 네이게이션 컴포넌트 name")을 사용해, 화면 이동

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState();
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");
    })();
  }, []);

  //사진 촬영
  const takePicture = async () => {
    if (cameraRef) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        console.log(data);

        const newFileName = "temp.jpg";
        const newPath = FileSystem.documentDirectory + newFileName;
        await FileSystem.moveAsync({
          from: data.uri,
          to: newPath,
        });
        console.log("Image saved as JPEG at " + newPath);

        setImage(newPath);
      } catch (e) {
        console.log(e);
      }
    }
  };

  //사진을 임시로 저장하는 코드
  const saveImageAsJpg = async (imageUri) => {
    const manipResult = await ImageManipulator.manipulateAsync(imageUri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
    });

    const tempPath = FileSystem.cacheDirectory + "temp.jpg";
    await FileSystem.moveAsync({
      from: manipResult.uri,
      to: tempPath,
    });
    console.log("Image saved as JPEG at " + tempPath);
    return tempPath;
  };

  //사진 OCR
  const uploadMedic = async () => {
    if (image) {
      try {
        //const convertedUri=await convertUriToPng(image);//png로 변환한 이미지
        const jpgPath = await saveImageAsJpg(image);

        //여기부터 아래로 이미지에 대한 OCR을 진행 코드 작성
      } catch (e) {
        console.log(e);
      }
    }
  };

  const saveImage = async () => {
    if (image) {
      try {
        await MediaLibrary.createAssetAsync(image);
        alert("Picture Saved!");
        setImage(null);
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        <Box height="10"></Box>
        <Box width="100%" alignSelf="center">
          <Text alignSelf="center" fontSize="4xl" color="white">
            복약 등록
          </Text>
        </Box>
        <Box height="5"></Box>
        {!image ? (
          <Camera style={styles.camera} type={type} ref={cameraRef}></Camera>
        ) : (
          <Image source={{ uri: image }} style={styles.camera} />
        )}

        <View>
          {image ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 50,
              }}
            >
              <Button
                title={"Re-Take"}
                icon="retweet"
                onPress={() => setImage(null)}
              />
              <Button title={"Save"} icon="check" onPress={uploadMedic} />
            </View>
          ) : (
            <Button
              title={"Take a Picture"}
              icon="camera"
              onPress={takePicture}
            />
          )}
        </View>
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    paddingBottom: 15,
  },
  camera: {
    flex: 1,
    borderRadius: 20,
  },
});
