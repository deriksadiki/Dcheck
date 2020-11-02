import React from 'react';

import {Modal, Text, View, TouchableOpacity, Alert, TextInput,StatusBar} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import database, { firebase } from '@react-native-firebase/database';
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';
import { getDevice } from 'react-native-device-info';


var u_device_id;
var plate;
var PIN;
export default class PanicMode extends React.Component{

    constructor(props){
        super(props);

        this.state ={
            lastPlate: '',
            showPIN: 'false'
        }
    }

    componentDidMount(){
        this.loadData();
        this.getPlate();
        var start = 0;
        this.intervalID = setInterval(()=>{this.getLocation()}, 1000);
        var intervalId = BackgroundTimer.setInterval(() => {
            console.log(start++/10);
        }, 100);
        
    }

    async getPlate(){
        plate = await AsyncStorage.getItem('currentPlate');
        this.setState({lastPlate: plate});
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
        plate = panicData.plate;
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
            var plateDetail;
            PIN = parseInt(Math.random()*100000);
            firebase.database().ref('userPIN/'+u_device_id).set({trackingPIN: PIN}).then(async ()=>{
                await AsyncStorage.setItem('trackingPIN', PIN);
            });
            if(plate === '' || plate === undefined){
                plateDetail = '';
            }else{
                plateDetail = `%0a Plate ${plate}`;
            }
            var body = `DCheck Panic Alert %0a Name ${name} %0a Location ${url} %0a Cell ${mycell} ${plateDetail} %0a PIN ${PIN}`;
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
              if(cell !== '' || cell !== undefined){
              Alert.alert(`Sent to ${cell}`);
              setTimeout(()=>{this.setState({showPIN: true})}, 3000);
              }
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
                <Text style={Styles.miniHeader}>DCheck has sent SMSs to your saved contacts, with your live location.</Text>
                <Text style={Styles.smallText}></Text>
                <Text style={Styles.miniHeader}>We will continue sharing your location until your phone or signal dies.</Text>
                </View>


                <Modal visible={this.state.showPIN} animationType="slide" transparent={true} >
                <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    backgroundColor: 'rgba(0,0,0,.4)',
                    opacity: 1
                }}>


                <View style={{backgroundColor: '#fff', paddingBottom: 20, height: 250}}>
                <Text style={Styles.miniHeader}>Stop Live Tracking</Text>
                <Text style={Styles.smallText}>We've sent a PIN to quickly stop live tracking to your saved contacts.</Text>
                <TextInput style={Styles.inputs} placeholder="TRACKING PIN" onChangeText={(text)=>{this.setState({c1_name: text})}}/>
                
                <View style={Styles.Button}>
                <TouchableOpacity style={Styles.bottomBtn} onPress={()=>{this.completeSetup()}}>
                    <Text style={Styles.btnText}>STOP TRACKING</Text>
                </TouchableOpacity>
            </View>
                
                </View>
                </View>
            </Modal>

                </View>

    );
}
}