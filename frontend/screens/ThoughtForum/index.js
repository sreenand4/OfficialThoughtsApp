import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView } from "react-native"
import heartIcon from "../../assets/heart.png";
import commentIcon from "../../assets/message.png";
import shareIcon from "../../assets/shareIcon.png";
import threeDots from "../../assets/threeDots.png"
import parkedIcon from "../../assets/mappinParked.png"
import heartFillIcon from "../../assets/heart.fill.png";
import styles from "./styles";
import BackArrow from "../../components/BackArrow";
import { useRoute } from "@react-navigation/native";
import formatDate from "../../data/formatDate";
import { likeThought, checkLiked } from "../../data/likeThought";

const ThoughtForum = () => {
    const route = useRoute()
    const { thought } = route.params;
    const [likeCount, setLikeCount] = useState(0);
    const [liked, setLiked] = useState(false);

    const init = async () => {
        setLikeCount(thought.likes);
        const isLiked = await checkLiked(thought);
        if (isLiked) {
            setLiked(true)
        }
    }

    useEffect(() => {
        init()
    }, []);

    const handleLike = (thought) => {
        setLiked(true)
        setLikeCount(likeCount + 1)
        likeThought(thought, true)
    }

    const handleDislike = (thought) => {
        setLiked(false)
        setLikeCount(likeCount - 1)
        likeThought(thought, false)
    }

    return (
        <View style={styles.container}>
            <BackArrow />
            <ScrollView>
                <View style={styles.ThoughtContainer}>
                    <View>
                        <View style={styles.profileContainer}></View>
                        <View style={styles.thoughtBody}>
                            <View style={styles.userInfo}>
                                {thought.anonymous ? (
                                    <Text style={styles.userName}>Anonymous</Text>
                                ) : (
                                    <Text style={styles.userName}>{thought?.author?.displayName}</Text>
                                )}
                                <Text style={styles.time}>{formatDate(thought.createdAt)}</Text>
                            </View>
                            <View style={styles.thoughtContent}>
                                <Text style={styles.content}>{thought.content}</Text>
                            </View>
                            {/* <View style={styles.thoughtTags}>
                                <Text style={styles.tags}>Be the first to leave a label</Text>
                                <TouchableOpacity style={styles.addButton}>
                                    <Text style={styles.addText}>+</Text>
                                </TouchableOpacity>
                            </View> */}
                        </View>
                        <View style={styles.thoughtInteractions}>
                            <TouchableOpacity
                                style={styles.interactionNumber}
                                onPress={liked ? () => handleDislike(thought) : () => handleLike(thought)}
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
                            <TouchableOpacity style={styles.interactionNumber}>
                                <Image source={commentIcon} style={styles.icon} />
                                <Text style={styles.number}>2</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image source={shareIcon} style={styles.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image source={threeDots} style={styles.threeDotsIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.parkedDistanceContainer}>
                        {thought.parked && (
                            <View style={styles.parkedDistance}>
                                <Image style={styles.parkedIcon} source={parkedIcon} />
                                <Text style={styles.parkedText}>15</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default ThoughtForum

