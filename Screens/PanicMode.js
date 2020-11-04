import React from 'react';

import {Modal, Text, View, TouchableOpacity, Alert,Platform, TextInput,StatusBar, BackHandler} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import database, { firebase } from '@react-native-firebase/database';
import Geolocation from 'react-native-geolocation-service';
import BackgroundTimer from 'react-native-background-timer';
import { getDevice } from 'react-native-device-info';
import VIForegroundService from '@voximplant/react-native-foreground-service';


var u_device_id;
var plate;
var PIN = 0;
export default class PanicMode extends React.Component{

    constructor(props){
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state ={
            lastPlate: '',
            showPIN: 'false',
            sentPin : '',
            location : '',
            currentLat: '',
            currentLng : ''
        }
    }

    UNSAFE_componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentDidMount(){
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.loadData();
        this.getPlate();
        this.getLocation();
        
    }

    getUserLocation(){
        var start = 0;
        var intervalId = BackgroundTimer.setTimeout(() => {
            console.log('get location')
            this.getLocation()
        }, 3500);
    }

    async getPlate(){
        plate = await AsyncStorage.getItem('currentPlate');
        this.setState({lastPlate: plate});
    }

    handleBackButtonClick() {
        console.log('pressed')
     }

    getLocation(){
        Geolocation.getCurrentPosition((info) =>{
            let obj = {
                lat: info.coords.latitude,
                lng: info.coords.longitude
            }
            if (this.state.location == ''){
                this.setState({
                    location : obj
                }, () =>{
                    this.setLocation(obj);
                })
            }else{
                this.setState({
                    currentLat: obj.lat,
                    currentLng : obj.lng
                }, () =>{
                    this.setLocation(obj);
                })
                
            }
        }, (error) =>{
            console.warn(error);
        }, {enableHighAccuracy: true, timeout: 1500, forceRequestLocation: true, maximumAge: 2000})
    }

 

    setLocation(location){
        database().ref('tracking/'+u_device_id).set({
            lat: location.lat,
            lng: location.lng,
            startLat: this.state.location.lat,
            startlLng: this.state.location.lng,
        }).then(()=>{
            this.getUserLocation();
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
        let pincode = parseInt(Math.random()*100000);
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        this.sendSMS(c1, myname, mycell, location, url, pincode, dateTime);
        this.sendSMS(c2, myname, mycell, location, url, pincode, dateTime);
        this.sendSMS(mycell, myname, mycell, location, url, pincode, dateTime);
        this.startForegroundService()
    }

    async startForegroundService() {
        if (Platform.OS !== 'android') {
            console.log('Only Android platform is supported');
            return;
        }
        if (Platform.Version >= 26) {
            const channelConfig = {
                id: 'ForegroundServiceChannel',
                name: 'Notification Channel',
                description: 'Notification Channel for Foreground Service',
                enableVibration: true,
                importance: 2
            };
            await VIForegroundService.createNotificationChannel(channelConfig);
        }
        const notificationConfig = {
            id: 3456,
            title: 'Sharing location',
            text: 'With your contacts',
            icon: 'ic_stat_ic_stat_local_car_wash',
            priority: 0
        };
        if (Platform.Version >= 26) {
            notificationConfig.channelId = 'ForegroundServiceChannel';
        }
        await VIForegroundService.startService(notificationConfig);
    }

    async stopService() {
        await VIForegroundService.stopService();
        this.setState({
            showPIN : false
        }, () =>{
            this.props.navigation.goBack()
        })
    }

    saveHistory(startDateTime, startLat, startlLng){
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        firebase.database().ref('pastTracking/'+u_device_id).push({
            startLat: startLat,
            startlLng: startlLng,
            startDateTime: startDateTime,
            endDateTime : dateTime,
            endLat : this.state.currentLat,
            endLng : this.state.currentLng
        }).then(()=>{
            firebase.database().ref('userPIN/'+u_device_id).remove();
            database().ref('tracking/'+u_device_id).remove();
            this.stopService()
        });
    }

    initLocation (){
        firebase.database().ref('userPIN/'+u_device_id).update({
            startLat: this.state.location.lat,
            startlLng: this.state.location.lng,
        })
        
    }

    completeSetup (){
        firebase.database().ref('userPIN/'+u_device_id).once('value', data =>{
            let pin = data.val().trackingPIN
            if (this.state.sentPin == pin){
               this.saveHistory(data.val().date, data.val().startLat, data.val().startlLng);
            }else{
                Alert.alert('','The pin you have entered is incorrect.')
            }
        });
    }


    sendSMS(cell, name, mycell, location, url, pincode, dateTime){
            var plateDetail;
            PIN = pincode;
            firebase.database().ref('userPIN/'+u_device_id).set({
                trackingPIN: PIN,
                date : dateTime
            }).then(async ()=>{
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
              setTimeout(()=>{this.setState({showPIN: true}, ()=>{ this.initLocation();})}, 3000);
              }
              }
              }
            xhr.send();
            //setTimeout(()=>{this.setState({showPIN: true}, ()=>{ this.initLocation();})}, 3000);

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
                <TextInput style={Styles.inputs} placeholder="TRACKING PIN" onChangeText={(text)=>{this.setState({sentPin: text})}}/>
                
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