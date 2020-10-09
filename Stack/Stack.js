import React from 'react'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';

//screens
import Report from '../Screens/Report';
import Search from '../Screens/Search';
import Results from '../Screens/Results';

const mainStack = createStackNavigator();

export default class Stack extends React.Component{
    render(){
        return(
            <mainStack.Navigator mode='card' headerMode="modal" initialRouteName="Search"
             screenOptions={{
                 ...TransitionPresets.SlideFromRightIOS}}>
                <mainStack.Screen name="Search" component={Search} />
                <mainStack.Screen name="Report" component={Report} />
                <mainStack.Screen name="Results" component={Results} />
            </mainStack.Navigator> 
        )
    }
} 