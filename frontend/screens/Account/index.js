import styles from "./styles";
import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native"
import background from "../../assets/profileBackground.png"
import { useSelector, useDispatch } from "react-redux";
import verifiedIcon from "../../assets/verifiedIcon.png"
import mappinGreen from "../../assets/mappinGreen.png"
import formatDate from "../../data/formatDate";
import defaultProfilePic from "../../assets/defaultprofilepic.png"
import { uploadData } from "aws-amplify/storage";
import { updateUser } from "../../src/graphql/mutations";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "@aws-amplify/auth";
import YourActiveThought from "../../components/YourActiveThought";
import { Colors } from "../../constants/colors";
import { uploadThoughtMedia } from "../../data/uploadThoughtMedia";
import useSignOut from "../../data/signout";
import NearbyThought from "../../components/NearbyThought";
import { getOneUser } from "../../slices/getOneUser";
import { getActiveThoughts } from "../../slices/getActiveThoughts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNearbyThoughts } from "../../slices/getNearbyThoughts";
import { useNavigation } from "@react-navigation/native";

const Account = () => {
    const [image, setImage] = useState("");
    const { signout } = useSignOut()
    const { user } = useSelector((state) => state.userSlice);
    const dispatch = useDispatch();
    const { activeThoughts } = useSelector((state) => state.getActiveThoughtsSlice);
    const [parkedThoughts, setParkedThoughts] = useState(0);
    const [pickedImage, setPickedImage] = useState("");
    const [imgData, setImgData] = useState("");
    const [key, setKey] = useState("");
    const [loadingUpload, setLoadingUpload] = useState(false);
    const navigation = useNavigation()

    const calcParkedThoughts = () => {
        let parkedThoughts = 0;
        for (thought of activeThoughts) {
            if (thought.parked) {
                parkedThoughts += 1;
            }
        }
        return parkedThoughts
    }

    useEffect(() => {
        const parkedNo = calcParkedThoughts()
        setParkedThoughts(parkedNo)
    }, [activeThoughts])

    const selectImage = async () => {
        const data = await uploadThoughtMedia("Profile picture");
        if (data) {
            setPickedImage(data.mediaPath);
            setImgData(data.mediaData);
            setKey(data.key);
        }
    }

    const uploadFileToS3 = async () => {
        const bucket = "thoughtsapp8fd738644ed04b61a716a9444c7fe4fb83473-staging";
        if (pickedImage) {
            setLoadingUpload(true)
            try {
                const result = await uploadData({
                    key: key,
                    data: imgData,
                    options: {
                        accessLevel: undefined
                    }
                }).result;
                let s3URL = `https://${bucket}.s3.us-east-2.amazonaws.com/public/${result.key}`;
                if (s3URL) {
                    const client = generateClient();
                    const { userId } = await getCurrentUser();
                    try {
                        const response = await client.graphql({
                            query: updateUser,
                            variables: {
                                input: {
                                    id: userId,
                                    photo: s3URL
                                }
                            }
                        })
                        setLoadingUpload(false)
                        console.log("new user:", response)
                    } catch (err) {
                        console.log(err);
                    }
                }
                setPickedImage("")
                console.log("pickedImage: ", pickedImage)
                dispatch(getActiveThoughts())
                const hash = await AsyncStorage.getItem("@hash")
                dispatch(getNearbyThoughts(hash))
                return result.key;
            } catch (error) {
                //console.log('Error : ', error);
            }
            return '';
        }
    };

    return (
        <ScrollView style={styles.backgroundContainer}>
            <Image source={background} style={styles.backgroundImage} />
            {user?.photo ? (
                <TouchableOpacity style={styles.profileImage} onPress={selectImage}>
                    {loadingUpload ? (
                        <Text style={{ color: "black", textAlign: "center" }}>uploading...</Text>
                    ) : (
                        pickedImage ? (
                            <Image source={{ uri: pickedImage }} style={{
                                objectFit: "cover", width: 169.346,
                                height: 169.346, borderRadius: 100
                            }} />) : (
                            <Image source={{ uri: user?.photo }} style={{
                                objectFit: "cover", width: 169.346,
                                height: 169.346, borderRadius: 100
                            }} />
                        )
                    )
                    }
                </TouchableOpacity>
            ) :
                (
                    <TouchableOpacity style={styles.profileImage} onPress={selectImage}>
                        {pickedImage ? (
                            <Image source={{ uri: pickedImage }} style={{
                                objectFit: "cover", width: 169.346,
                                height: 169.346, borderRadius: 100
                            }} />) : (
                            <Image source={defaultProfilePic} style={{
                                objectFit: "cover", width: 169.346,
                                height: 169.346, borderRadius: 100
                            }} />
                        )}
                    </TouchableOpacity>
                )
            }
            <View style={styles.container}>
                {pickedImage &&
                    <View style={{ flexDirection: "row", gap: 12, width: "100%", justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => setPickedImage("")}>
                            <Text style={{ color: "white", textAlign: "center" }}>clear</Text>
                        </TouchableOpacity>
                        <Text style={{ color: "white", textAlign: "center" }}>|</Text>
                        <TouchableOpacity onPress={uploadFileToS3}>
                            <Text style={{ color: "yellow", textAlign: "center" }}>upload</Text>
                        </TouchableOpacity>
                    </View>
                }
                <Text style={styles.name}>{user?.name}</Text>
                <View style={styles.verifiedContainer}>
                    <Image source={verifiedIcon} />
                    <Text style={styles.verified}>Verified User</Text>
                </View>
                <Text style={styles.description}>Just your average thought reader</Text>
                <View style={styles.profileData}>
                    <TouchableOpacity style={styles.data}>
                        <Text style={styles.number}>{user.totalThoughts}</Text>
                        <Text style={styles.title}>Total thoughts</Text>
                    </TouchableOpacity>
                    <View style={styles.data}>
                        <Text style={styles.number}>---</Text>
                        <Text style={styles.title}>Reactions</Text>
                    </View>
                    <TouchableOpacity style={styles.dataLast}>
                        <View style={styles.parkedContainer}>
                            <Image source={mappinGreen} style={{ width: 18, height: 18 }} />
                            <Text style={styles.number}>{parkedThoughts}</Text>
                        </View>
                        <Text style={styles.titleParked}>Parked</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 20 }}>
                    {activeThoughts.map((activeThought, index) => (
                        !activeThought.anonymous &&
                        <View style={{ borderBottomWidth: 1, borderBottomColor: Colors.lightGray, marginBottom: 15 }} key={index}>
                            <NearbyThought key={index} thought={activeThought} />
                        </View>
                    ))}
                </View>
                <View style={styles.optionsContainer}>
                    <TouchableOpacity style={styles.signoutContainer} onPress={signout}>
                        <Text style={styles.signoutText}>Sign out</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signoutContainer} onPress={() => navigation.navigate("ConnectSpotify")}>
                        <Text style={styles.signoutText}>Connect Spotify</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </ScrollView >

    )
}

export default Account