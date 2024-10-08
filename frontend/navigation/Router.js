import React, { useEffect } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeTabNavigator from "./HomeTabNavigator";
import Signin from "../screens/Signin";
import CommentForum from "../modals/CommentForum";
import ThoughtForum from "../modals/ThoughtForum";
import Signup from "../screens/Signup";
import EmailScreen from "../screens/EmailScreen";
import PasswordScreen from "../screens/PasswordScreen";
import Verify from "../screens/Verify";
import Profile from "../screens/Profile";
import AllowLocation from "../screens/AllowLocation";
import ForgotPassword from "../screens/ForgotPassword";
import ResetPassword from "../screens/ResetPassword";
import { useDispatch } from "react-redux";
import { getOneUser } from "../slices/getOneUser";
import onThought from "../subscriptions/subscribeToNewThought";
import onEditThought from "../subscriptions/subscribeToEditThought";
import EditThought from "../modals/EditThought";
import onRemoveThought from "../subscriptions/subscribeToDeleteThought";
import onUpdateUser from "../subscriptions/subscribeToUser";
import Search from "../screens/Search";
import NewThoughtModal from "../modals/NewThoughtModal";
import ConnectSpotify from "../modals/ConnectSpotify";
import Activity from "../screens/Activity";
import onCreateThoughtLike from "../subscriptions/subscribeToNewLike";
import { getNotifications } from "../slices/getNotifications";
import { getActiveThoughts } from "../slices/getActiveThoughts";
import { getInactiveThoughts } from "../slices/getInactiveThoughts";
import NameScreen from "../screens/NameScreen";
import PreVerify from "../screens/PreVerify";
import UsernameScreen from "../screens/UsernameScreen";


const Stack = createNativeStackNavigator();

const linking = {
    prefixes: ['thoughtsapp://'],
    config: {
        screens: {
            Main: 'callback',
        },
    },
};

const Router = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        onThought(dispatch)
        // onEditThought(dispatch)
        onRemoveThought(dispatch)
        onUpdateUser(dispatch)
        dispatch(getOneUser())
        // dispatch(getNotifications())
    }, [dispatch])

    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator>
                <Stack.Screen name={"Signin"} component={Signin} options={{ headerShown: false }} />
                {/* <Stack.Screen name={"Signup"} component={Signup} options={{ headerShown: false }} /> */}
                <Stack.Screen name={"EmailScreen"} component={EmailScreen} options={{ headerShown: false }} />
                <Stack.Screen name={"PasswordScreen"} component={PasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name={"NameScreen"} component={NameScreen} options={{ headerShown: false }} />
                <Stack.Screen name={"PreVerify"} component={PreVerify} options={{ headerShown: false }} />
                <Stack.Screen name={"Verify"} component={Verify} options={{ headerShown: false }} />
                <Stack.Screen name={"UsernameScreen"} component={UsernameScreen} options={{ headerShown: false }} />
                <Stack.Screen name={"AllowLocation"} component={AllowLocation} options={{ headerShown: false }} />
                <Stack.Screen name={"ForgotPassword"} component={ForgotPassword} options={{ headerShown: false }} />
                <Stack.Screen name={"ResetPassword"} component={ResetPassword} options={{ headerShown: false }} />
                <Stack.Screen name={"Main"} component={HomeTabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name={"EditThought"} component={EditThought} options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name={"CommentForum"} component={CommentForum} options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name={"ConnectSpotify"} component={ConnectSpotify} options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name={"NewThoughtModal"} component={NewThoughtModal} options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name={"ThoughtForum"} component={ThoughtForum} options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name={"Profile"} component={Profile} options={{ headerShown: false }} />
                <Stack.Screen name={"Search"} component={Search} options={{ headerShown: false }} />
                <Stack.Screen name={"Activity"} component={Activity} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Router;
