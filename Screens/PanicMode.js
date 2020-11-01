import React from 'react';

import {Text, View, TouchableOpacity, Alert, TextInput,StatusBar} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import database, { firebase } from '@react-native-firebase/database';
import Geolocation from '@react-native-community/geolocation';


var u_device_id;
export default class PanicMode extends React.Component{

    constructor(props){
        super(props);
    }

    componentDidMount(){
        this.loadData();

        this.intervalID = setInterval(()=>{this.getLocation()}, 1000);
    }


    getLocation(){
        Geolocation.getCurrentPosition((info) =>{
            let obj = {
                lat: info.coords.latitude,
                lng: info.coords.longitude
            }
            
            this.setLocation(obj);

        }, (error) =>{
            console.warn(error);
        }, {enableHighAccuracy: true, timeout: 1500})
    }

    setLocation(location){
        database().ref('tracking/'+u_device_id).set({
            lat: location.lat,
            lng: location.lng
        })
    }

    async loadData(){
        var pd = await AsyncStorage.getItem('panicData');
        var panicData = JSON.parse(pd);
        var myname = panicData.name;
        var mycell = panicData.mycell;
        var c1 = panicData.c1cell;
        var c2 = panicData.c2cell;
        var deviceId = panicData.deviceId;
        u_device_id = deviceId;

        var location = panicData.location;

        this.setLocation(location);
        var url = `https://onecab.co.za/m/m.html?d=${u_device_id}`;

        this.sendSMS(c1, myname, mycell, location, url);
        this.sendSMS(c2, myname, mycell, location, url);
        this.sendSMS(mycell, myname, mycell, location, url);
    }

    sendSMS(cell, name, mycell, location, url){
            var body = `${name} has pressed the Panic Button on DCheck. %0a Location: ${url} %0a Cell: ${mycell}`;
            var cors = 'https://cors-anywhere.herokuapp.com';
            var sms = 'https://api.bulksms.com/v1/messages/send?to='+cell.replace('0', '27')+'&body='+body;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', cors+'/'+sms, true);
            xhr.setRequestHeader('path', 'api.bulksms.com/v1/messages/send?');
            xhr.setRequestHeader('Authority', 'api.bulksms.com');
            xhr.setRequestHeader('scheme','https');
            xhr.setRequestHeader('origin', 'https://onecab.co.za');
            xhr.setRequestHeader('Access-Control-Allow-Origin', 'https://onecab.co.za');
            xhr.setRequestHeader('Authorization', 'Basic emlwaTpaaXBpMTIzNDU2');
            xhr.onreadystatechange = () => {
            if(xhr.readyState == '4'){
              Alert.alert(`Sent to ${cell}`);
              }
              }
            xhr.send();
    }

render(){
    return(

<View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                 <StatusBar backgroundColor="black" />
                <View style={Styles.header}>
                    <Text style={Styles.headerText}>DCHECK</Text>
                    <Text style={Styles.miniText}>PANIC MODE</Text>
                </View>

                <View>
                <Text style={Styles.miniHeader}>DCheck has sent SMSs to your saved contacts, with your live location. To keep tracking live, please do not close the app.</Text>
                <Text style={Styles.smallText}>
                </Text>

                </View>
                </View>

    );
}
}