import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

const styles = StyleSheet.create({

    replyContainer: {
        flex: 1,
        flexDirection: "row",
        width: "80%",
        gap: 10,
        marginTop: 10,
    },
    profileContainer: {
    },
    replyBody: {
        flexDirection: "column",
        width: "80%"
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    userName: {
        color: Colors.whiteFont,
        fontWeight: "500"
    },
    time: {
        color: Colors.grayFont,
        fontSize: 10
    },
    replyContent: {
        marginBottom: 10
    },
    content: {
        color: Colors.whiteFont
    },
    thoughtTags: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",

    },
    addButton: {
        backgroundColor: "#202124",
        width: 18,
        height: 18,
        borderRadius: 55,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#2C2C2C"
    },
    addText: {
        color: Colors.whiteFont,
        fontSize: 10
    },
    tags: {
        color: Colors.grayFont,
        fontSize: 12
    },
    threeDots: {
        color: Colors.grayFont,
        fontSize: 20
    },
    thoughtInteractions: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    icon: {
        width: 22,
        height: 22
    },
    threeDotsIcon: {
        width: 17,
        height: 4
    },
    interactionNumber: {
        flexDirection: "row",
        alignItems: "center",
    },
    number: {
        color: Colors.grayFont,
    },
    parkedDistanceContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
        paddingBottom: 5,
        alignItems: "center",
    },
    parkedDistance: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center"
    },
    parkedIcon: {
        width: 10,
        height: 18
    },
    parkedText: {
        color: "yellow"
    }
})

export default styles;