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
import axios from "axios";
import FormData from "form-data";

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
  //const FormData = require("form-data");
  //const axios = require("axios");

  async function readImageFile(uri) {
    try {
      const data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return data;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

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

        //temp.jpg로 촬영한 사진 파일명을 교체
        const newFileName = "temp.jpg";
        const newPath = FileSystem.documentDirectory + newFileName;
        await FileSystem.moveAsync({
          from: data.uri,
          to: newPath,
        });
        console.log("Image saved as JPG at " + newPath);

        //촬영한 이미지를 화면에 표시
        setImage(newPath);
      } catch (e) {
        console.log(e);
      }
    }
  };

  //Base64를 이용하는 OCR(실패하여 중단)
  async function uploadMedic() {
    //여기서 CLOVA OCR을 진행한다.
    //형식은 jpg, 파일 이름은 temp.jpg
    //경로는 file:///data/user/0/host.exp.exponent/files/ExperienceData/%2540anonymous%252FMedicationHelper-457dad48-dab3-4df1-936e-159aed198ca0/temp.jpg
    const base64Data = readImageFile(
      "file:///data/user/0/host.exp.exponent/files/ExperienceData/%2540anonymous%252FMedicationHelper-457dad48-dab3-4df1-936e-159aed198ca0/temp.jpg"
    );

    function requestWithBase64() {
      axios
        .post(
          "https://czt9qlltax.apigw.ntruss.com/custom/v1/16147/e9a1814442c9633751f8b26ebeba60b6f23d612647bbee28a6022693b2c1416b/general", //APIGW Invoke URL
          {
            images: [
              {
                format: "jpg",
                name: "temp.jpg",
                data: base64Data,
              },
            ],
            requestId: "ocrResult1234", // unique string
            timestamp: 0,
            version: "V2",
          },
          {
            headers: {
              "X-OCR-SECRET": "UVlhcmRxTUNIbHBiTWh3SnVQdGlFZ3FQYUhGZmJkbGs=", //secret key
            },
          }
        )
        .then((res) => {
          if (res.status === 200) {
            console.log("requestWithBase64 response:", res.data);
          }
        })
        .catch((e) => {
          console.warn("requestWithBase64 error", e.response);
        });
    }

    requestWithBase64();
  }

  //File을 이용하는 OCR(현재 시도중인 방법)
  async function requestWithFile() {
    const file =
      "file:///data/user/0/host.exp.exponent/files/ExperienceData/%2540anonymous%252FMedicationHelper-457dad48-dab3-4df1-936e-159aed198ca0/temp.jpg";
    const message = {
      images: [
        {
          format: "jpg",
          name: "temp",
        },
      ],
      requestId: "pictureResult", // unique string
      timestamp: 0,
      version: "V2",
    };
    const formData = new FormData();

    formData.append("file", file);
    formData.append("message", JSON.stringify(message));

    axios
      .post(
        "https://czt9qlltax.apigw.ntruss.com/custom/v1/16147/e9a1814442c9633751f8b26ebeba60b6f23d612647bbee28a6022693b2c1416b/general", // APIGW Invoke URL
        formData,
        {
          headers: {
            "X-OCR-SECRET": "UVlhcmRxTUNIbHBiTWh3SnVQdGlFZ3FQYUhGZmJkbGs=", // Secret Key
            ...formData.getHeaders(),
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          console.log("requestWithFile response:", res.data);
        }
      })
      .catch((e) => {
        console.warn("requestWithFile error", e.response);
      });
  }

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
          {/*이미지를 가지고 있는 경우와 없는 경우를 구분하여 표시 */}
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
              <Button title={"Save"} icon="check" onPress={requestWithFile} />
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
