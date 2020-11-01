import React from 'react';

import {Text, View, TouchableOpacity, Alert, TextInput,StatusBar} from 'react-native';

export default class Disclaimer extends React.Component{
render(){
    return(

<View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                 <StatusBar backgroundColor="black" />
                <View style={Styles.header}>
                    <Text style={Styles.headerText}>DCHECK</Text>
                    <Text style={Styles.miniText}>JUST A QUICK ONE</Text>
                </View>

                <View>
                <Text style={Styles.miniHeader}>Please note</Text>
                <Text style={Styles.smallText}>Make sure you search the number plate of the vehicle you'll be getting into before pressing the Panic Button.
                This will allow us to provide your contacts with more information.
                </Text>

                <Text></Text>
                

                <Text style={Styles.miniHeader}>Also...</Text>
                <Text style={Styles.smallText}>DCheck operates on severely limited resources.
                </Text>

                <Text style={Styles.smallText}>
                While we understand that you may feel
                the need to ‘test’ the Panic Button or show it
                to friends and family, we urge you to refrain from
                using it unnecessarily as this negatively impacts
                our ability to provide reliable services for free.
                </Text>

                <Text style={Styles.smallText}>
                If you have any queries, you can reach us on Twitter, @oathe_software.
                </Text>
            </View>

            <View style={Styles.Button}>
                <TouchableOpacity style={Styles.bottomBtn} onPress={()=>{this.props.navigation.navigate('Search')}}>
                    <Text style={Styles.btnText} >GOT IT!</Text>
                </TouchableOpacity>
            </View>


</View>
        );
        }
    }