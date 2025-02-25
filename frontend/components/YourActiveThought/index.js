import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Animated, Easing, FastImage, Alert, Dimensions } from 'react-native';
import styles from "./styles";
import formatDate from "../../data/formatDate";
import heartIcon from "../../assets/heart.png";
import heartFillIcon from "../../assets/heart.fill.png";
import commentIcon from "../../assets/message.png";
import pencilIcon from "../../assets/pencil-create.png";
import trasIcon from "../../assets/trash.png";
import lightBulbFillIcon from "../../assets/lightbulbFill.png";
import Video from "react-native-video";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import deleteOneThought from "../../data/deleteOneThought";
import editOneThought from "../../data/editOneThought";
import { checkLiked, likeThought } from "../../data/likeThought";
import defaultProfilePic from "../../assets/defaultprofilepic.png"
import Toast from 'react-native-toast-message';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNearbyThoughts } from "../../slices/getNearbyThoughts";
import parkedIcon from "../../assets/mappinParked.png";
import { getActiveThoughts } from "../../slices/getActiveThoughts";
import { getInactiveThoughts } from "../../slices/getInactiveThoughts";
import DancingBars from "../DancingBars";
import mute from "../../assets/speaker.slash.fill.png";
import unmute from "../../assets/speaker.wave.2.fill.png";
import spotifyLogo from "../../assets/spotifyLogo.png"
import { Audio } from 'expo-av';
import { Colors } from "../../constants/colors";
import { vote, checkAnswered } from "../../data/voteOnPoll";
import { refreshAccessToken } from "../../data/exchangeCodeForToken";
import { Swipeable } from 'react-native-gesture-handler';
import SwipeActions from "../SwipeActions";
import threeDots from "../../assets/threeDots.png"
import ngeohash from 'ngeohash';
import { reverseGeocode } from "../../data/reverseGeocode";
const geolib = require('geolib');
import { getDistance } from "../../data/getDistance";

const YourActiveThought = ({ activeThought, openOptionsModal }) => {
    const navigation = useNavigation();
    const user = useSelector((state) => state.userSlice.user);
    const [animatedValue] = useState(new Animated.Value(0));
    const [likeCount, setLikeCount] = useState(activeThought.likes || 0);
    const [liked, setLiked] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const dispatch = useDispatch();
    const [userHash, setUserHash] = useState("");
    const [answered, setAnswered] = useState(false);
    const [localVoteCount, setLocalVoteCount] = useState(0);
    const [answeredOption, setAnsweredOption] = useState("");
    const [track, setTrack] = useState(null);
    const [spotifyAuth, setSpotifyAuth] = useState(true);
    const [loadingSong, setLoadingSong] = useState(false);
    const [thoughtHash, setThoughtHash] = useState();
    const [pinnedLocation, setPinnedLocation] = useState("");
    const [pinnedDistance, setPinnedDistance] = useState(0);
    const [totalVotes, setTotalVotes] = useState(activeThought?.poll ? activeThought.options.items.reduce((sum, option) => sum + option.votes, 0) : 0)

    useEffect(() => {
        const init = async () => {
            setThoughtHash(activeThought?.geohash);
            setCommentCount(activeThought.totalReplies)
            setLikeCount(activeThought.likes);
            const isLiked = await checkLiked(activeThought);
            setLiked(isLiked);
            const answerId = await checkAnswered(activeThought);
            if (answerId) {
                setAnsweredOption(answerId)
                setAnswered(true)
                for (option of activeThought.options.items) {
                    if (option.id == answerId) {
                        setLocalVoteCount(option.votes)
                    }
                }
            }
            setUserHash(await AsyncStorage.getItem('@hash'));
            if (activeThought?.parked) {
                setPinnedDistance(await getDistance(activeThought?.geohash))
            }
        }
        init();
        getSong();
    }, [activeThought]);

    const getSong = async () => {
        const spotifyAuth = await AsyncStorage.getItem("spotifyAuth");
        if (spotifyAuth && spotifyAuth == "true") {
            setSpotifyAuth(true);
            setLoadingSong(true);
            const expiryString = await AsyncStorage.getItem('spotifyTokenExpiry');
            const expiryTime = new Date(expiryString);
            const currentTime = new Date();
            if (currentTime >= expiryTime) {
                await refreshAccessToken()
                console.log("NEW access token has been updated")
            }
            const accessToken = await AsyncStorage.getItem("spotifyAccessToken")
            if (activeThought.music) {
                try {
                    const response = await fetch(`https://api.spotify.com/v1/tracks/${activeThought.music}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (!response.ok) {
                        setSpotifyAuth(true)
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const trackData = await response.json();
                    setTrack(trackData)
                    setLoadingSong(false)
                } catch (error) {
                    console.log("Error: ", error)
                    setLoadingSong(false)
                }
            }
        } else {
            setSpotifyAuth(false)
        }
    }

    const handleLike = async (activeThought) => {
        setLiked(true);
        setLikeCount(prevLikeCount => prevLikeCount + 1);
        await likeThought(activeThought, true);
        dispatch(getNearbyThoughts(userHash))
    };

    const handleDislike = async (activeThought) => {
        // const { latitude, longitude } = ngeohash.decode(thoughtHash);
        // const locString = await reverseGeocode(latitude, longitude);
        setLiked(false);
        setLikeCount(prevLikeCount => prevLikeCount - 1);
        await likeThought(activeThought, false);
        dispatch(getNearbyThoughts(userHash))
    };

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 550,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start(() => {
            animatedValue.setValue(1);
        });
    }, [activeThought]);

    const edit = () => {
        navigation.navigate("EditThought", { activeThought, setAnswered });
    };

    const deleteFunc = () => {
        Alert.alert(
            "Delete Thought",
            "Are you sure you want to delete this thought?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const response = await deleteOneThought(activeThought.id);
                        if (response.status === "success") {
                            dispatch(getActiveThoughts());
                            Toast.show({
                                type: 'success',
                                text1: 'Thought deleted successfully!',
                            });
                        } else {
                            Toast.show({
                                type: 'error',
                                text1: 'Error deleting thought',
                            });
                        }
                    },
                },
            ]
        );
    };

    const toggleActiveStatus = async () => {
        const newActiveStatus = !activeThought.active;

        await editOneThought(
            activeThought.id,
            activeThought.content,
            newActiveStatus,
            activeThought.parked,
            activeThought.anonymous
        );
        dispatch(getNearbyThoughts(userHash))
        dispatch(getActiveThoughts())
        dispatch(getInactiveThoughts())
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 350,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start(() => {
            animatedValue.setValue(1);
        });
    };

    const animatedStyle = {
        opacity: animatedValue,
        transform: [
            {
                scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                }),
            },
        ],
    };

    const onVote = async (option, thought) => {
        await vote(thought, option);
        setAnsweredOption(option.id)
        setLocalVoteCount(option.votes + 1)
        setAnswered(true)
        dispatch(getNearbyThoughts(userHash))
    }

    const renderRightActions = (progress, dragX) => (
        <SwipeActions
            progress={progress}
            dragX={dragX}
            toggleActiveStatus={toggleActiveStatus}
            deleteFunc={deleteFunc}
        />
    );


    return (
        <Swipeable renderRightActions={renderRightActions}>
            <Animated.View style={animatedStyle}>
                <TouchableOpacity style={styles.container}
                    onPress={() => navigation.navigate("CommentForum", {
                        thought: activeThought,
                        likeCount,
                        liked,
                        handleLike,
                        handleDislike,
                        commentCount,
                        setCommentCount,
                        answered,
                        setAnswered,
                        localVoteCount,
                        setLocalVoteCount,
                        answeredOption,
                        setAnsweredOption,
                        track
                    })}>
                    <View style={styles.profileContainer}>
                        {activeThought?.anonymous ? (
                            <Image source={defaultProfilePic} style={{ width: 35, height: 35, borderRadius: 20 }} />
                        ) : (
                            <TouchableOpacity onPress={() => navigation.navigate("Profile", { userId: activeThought.author.id })}>
                                <Image source={{ uri: activeThought.author.photo }} style={{ width: 35, height: 35, borderRadius: 20 }} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.thoughtBody}>
                        <View style={styles.userInfo}>
                            {activeThought.anonymous ? (
                                <Text style={styles.userName}>Anonymous</Text>
                            ) : (
                                <Text style={styles.userName}>{user?.displayName}</Text>
                            )}
                            <Text style={styles.time}>{formatDate(activeThought.createdAt)}</Text>
                        </View>
                        <View style={styles.thoughtContent}>
                            {activeThought.content && <Text style={styles.content}>{activeThought.content}</Text>}
                            <TouchableOpacity>
                                {(activeThought.photo?.slice(-4) === ".jpg" || activeThought.photo?.slice(-4) === ".png") && <Image source={{ uri: activeThought.photo }} style={styles.photo} />}
                                {activeThought.photo?.slice(-4) === ".mp4" && <Video source={{ uri: activeThought.photo }} resizeMode="contain" controls={true} style={styles.video} />}
                            </TouchableOpacity>
                            {spotifyAuth ? (
                                <>
                                    {activeThought?.music && track &&
                                        <>
                                            {loadingSong ? (
                                                <View style={styles.trackContainerHighlighted}>
                                                    <View style={styles.albumImageContianer}>
                                                        <View style={{ width: 55, height: 55, borderRadius: 5, backgroundColor: Colors.lightGray }} />
                                                    </View>
                                                    <View style={styles.trackInfoContainer}>
                                                        <View style={{ width: 145, height: 15, borderRadius: 5, backgroundColor: Colors.lightGray }}></View>
                                                        <View style={{ width: 55, height: 15, borderRadius: 5, backgroundColor: Colors.lightGray }}></View>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View style={styles.trackContainerHighlighted}>
                                                    <View style={styles.albumImageContianer}>
                                                        <Image source={{ uri: track?.album?.images[0]?.url }} resizeMode="cover" style={{ width: 55, height: 55, borderRadius: 5 }} />
                                                    </View>
                                                    <View style={styles.trackInfoContainer}>
                                                        <Text style={styles.trackTitle}>{track.name}</Text>
                                                        <Text style={styles.artistTitle}>- {track.artists.map(artist => artist.name).join(', ')}</Text>
                                                    </View>
                                                    {track.preview_url ? (
                                                        <View style={styles.playButtonContainer}>
                                                            <DancingBars />
                                                        </View>
                                                    ) : (
                                                        <View style={styles.playButtonContainer}>
                                                            <TouchableOpacity style={{ justifyContent: "center", alignItems: "center", flex: 1, borderRadius: 50 }}>
                                                                <Image source={spotifyLogo} style={{ width: 25, height: 25, opacity: 0.5 }} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </>
                                    }
                                </>
                            ) : activeThought?.music ? (

                                <TouchableOpacity style={styles.trackContainerHighlighted} onPress={() => navigation.navigate("ConnectSpotify")}>
                                    <View style={styles.albumImageContianer}>
                                        <View style={{ width: 55, height: 55, borderRadius: 5, backgroundColor: Colors.lightGray, justifyContent: "center", alignItems: "center" }}>
                                            <Image source={spotifyLogo} style={{ width: 25, height: 25, opacity: 0.5 }} />
                                        </View>
                                    </View>
                                    <View style={styles.trackInfoContainer}>
                                        <Text style={{ color: "white" }}>To expienece music on our app, connect to spotify </Text>
                                    </View>
                                </TouchableOpacity>

                            ) : (
                                <></>
                            )}
                            {activeThought.poll && (
                                <View style={styles.optionsContainer}>
                                    {activeThought?.options?.items.map((option, index) => {
                                        const votePercentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.optionContainer,
                                                    answeredOption == option.id && styles.optionContainerHighlighted,
                                                ]}
                                                onPress={answered ? () => { } : () => onVote(option, thought)}
                                            >
                                                {/* Render the vote background only if answered */}
                                                {answered && (
                                                    <View style={[styles.voteBackground, { width: `${votePercentage}%` }]} />
                                                )}

                                                <Text style={styles.optionText}>{option.content}</Text>

                                                {/* Render the vote count only if answered */}
                                                {answered && (
                                                    <Text style={styles.optionText}>
                                                        {answeredOption == option.id ? localVoteCount : option.votes}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                        <View style={styles.thoughtInteractions}>
                            <TouchableOpacity
                                style={styles.interactionNumber}
                                onPress={liked ? () => handleDislike(activeThought) : () => handleLike(activeThought)}
                            >
                                {liked ? (
                                    <Image
                                        source={heartFillIcon}
                                        style={styles.icon}
                                    />
                                ) : (
                                    <Image
                                        source={heartIcon}
                                        style={styles.icon}
                                    />
                                )}
                                <Text style={styles.number}>
                                    {likeCount}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.interactionNumber}>
                                <Image source={commentIcon} style={styles.icon} />
                                <Text style={styles.number}>{commentCount}</Text>
                            </View>
                            {/* {activeThought.parked &&
                                <View style={styles.parkedDistance}>
                                    <Image style={styles.parkedIcon} source={parkedIcon} />
                                </View>}
                            <TouchableOpacity style={styles.interactionNumber} onPress={edit}>
                                <Image source={pencilIcon} style={styles.pencilIcon} />
                            </TouchableOpacity> */}
                            <TouchableOpacity onPress={() => openOptionsModal(activeThought)} style={styles.interactionNumber}>
                                <Image source={threeDots} style={styles.threeDotsIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.thoughtControllers}>
                        {activeThought.parked &&
                            <View>
                                <Image style={styles.parkedIcon} source={parkedIcon} />
                                <Text>{pinnedDistance} meters</Text>
                            </View>
                        }
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </Swipeable>
    );
};

export default YourActiveThought;
