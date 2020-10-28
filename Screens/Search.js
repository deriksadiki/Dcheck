
import React from 'react'
import {Text, View, TouchableOpacity, Alert, TextInput,StatusBar, ActivityIndicator, Modal} from 'react-native'
import Styles from '../Styles/Styles'
import database, { firebase } from '@react-native-firebase/database';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';

export default class Search extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            showLoading : false,
            location : '',
            plate : '',
            searchRes: [],
            filePath: {},
            networkInfo: {},
            deviceName: '',
            model: '',
            manuf: '',
            deviceIp: '',
            number: '',
            batteryLevel: '',
            batteryState: '',
            blockedModal: true
        }
    }

    UNSAFE_componentWillMount(){
        this.getLocation();
    }

    componentDidMount(){
        this.manageConnection();
        this.getDeviceInfo();
    }

    getDeviceInfo(){
        DeviceInfo.getDeviceName().then(deviceName => {
            this.setState({deviceName: deviceName});
        });


        DeviceInfo.getDevice().then(device => {
            this.setState({model: device});
        });

        DeviceInfo.getIpAddress().then(ip => {
            this.setState({deviceIp: ip});
          });

        DeviceInfo.getManufacturer().then(manufacturer => {
        this.setState({manuf: manufacturer});
        });

        DeviceInfo.getPhoneNumber().then(phoneNumber => {
        this.setState({number: phoneNumber});
        });

        DeviceInfo.getPowerState().then(state => {
            this.setState({batteryLevel: state.batteryLevel});
            this.setState({batteryState: state.batteryState});
          });

          var today = new Date();
          var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          var dateTime = date+' '+time;
          var metadata = this.state.networkInfo;
          var deviceData = {
              deviceName: this.state.deviceName,
              model: this.state.model,
              manuf: this.state.manuf,
              deviceIp: this.state.deviceIp,
              number: this.state.number,
              batteryLevel: this.state.batteryLevel,
              batteryState: this.state.batteryState,
              location: this.state.location,
              deviceId: DeviceInfo.getUniqueId(),
              date: dateTime,
              ...metadata
          }
  
          this.saveLocally(deviceData);

    }


    isBlocked(){
       var devId = DeviceInfo.getUniqueId();
       firebase.database().ref('/blockedUsers/'+devId).on('value', data => {
           if(data.val()){
               this.setState({blockedModal: true});
           }
       })
    }

    manageConnection(){
        NetInfo.addEventListener(state => {
            if(!state.isInternetReachable){
                this.setState({showConnectionError: true});
            }

            var networkInfo = {
            carrier: state.details.carrier,
            netGeneration: state.details.cellularGeneration,
            ip: state.details.ipAddress,
            ssid: state.details.ssid,
            mac: state.details.bssid,
            subnet: state.details.subnet,
            dataSaver: !state.details.isConnectionExpensive
            }

            this.setState({networkInfo: networkInfo});

          });
    }

    getLocation(){
        Geolocation.getCurrentPosition((info) =>{
            let obj = {
                lat: info.coords.latitude,
                lng: info.coords.longitude
            }
            this.setState({
                location: obj
            })
        }, (error) =>{
            //do nothing
        }, {enableHighAccuracy: true, timeout: 1500})
    }

    report(){
        this.props.navigation.navigate('Report', {location : this.state.location})   
    }

    saveSearch(plate){
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;

        var metadata = this.state.networkInfo;
        var deviceData = {
            deviceName: this.state.deviceName,
            model: this.state.model,
            manuf: this.state.manuf,
            deviceIp: this.state.deviceIp,
            number: this.state.number,
            batteryLevel: this.state.batteryLevel,
            batteryState: this.state.batteryState,
            location: this.state.location,
            deviceId:  DeviceInfo.getUniqueId(),
            date: dateTime,
            plate: plate,
            ...metadata
        }

        this.saveLocally(deviceData);

        database().ref('savedSearches/').push(deviceData);
    }

    async saveLocally(deviceData){
        await AsyncStorage.setItem('deviceData', JSON.stringify(deviceData));
    }

    search(){
        NetInfo.addEventListener(state => {
            if(!state.isInternetReachable){
                Alert.alert('', "You're currently disconnected.");
            }else{
                this.findPlate();
            }
        });
    }
    findPlate(){
        var numberPlate = this.state.plate;
        if (numberPlate != '' && numberPlate.length > 5){
            this.setState({
                showLoading: true
            }, () =>{
            let key = this.state.plate.replace(/\s/g,'');
            key = key.toUpperCase();

                this.saveSearch(key);

                database().ref('Reports/' +  key + '/').on('value', data =>{
                    let tempArr = new Array();
                    if (data.val() != null || data.val() != undefined){
                        let values = data.val();
                        let keys = Object.keys(values);
                        for (var x = 0; x < keys.length; x++){
                            tempArr.push(values[keys[x]]);
                        }
                        setTimeout(() => {
                            this.setState({
                                searchRes : tempArr,
                                showLoading: false
                            }, () =>{
                                this.props.navigation.navigate('Results', {plate: this.state.plate, found:true, res: this.state.searchRes, location: this.state.location})
                            })
                        }, 1500);
                    }else{
                        setTimeout(() => {
                            this.setState({
                                showLoading: false
                            }, () =>{
                                this.props.navigation.navigate('Results', {plate: this.state.plate, found:false, res: this.state.searchRes, location: this.state.location})
                            })
                        }, 700);
                    }
                })
            })
        }else{
            Alert.alert('', 'Please insert the number plate before you search')
        }
    }

    render(){
        return(
            <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                 <StatusBar backgroundColor="black" />
                    <View style={Styles.headerContainer}>
                        <Text style={Styles.headerText} >DCHECK</Text>
                        <View style={Styles.innerText}>
                        <Text>Ready to start your ride? Look-up your driver by his number plate.</Text>
                        </View>
                    </View>

            <View style={Styles.mainBody}>
                    <TextInput style={Styles.mainInput} maxLength={9} value={this.state.plate} onChangeText={(txt)=>{this.setState({plate:txt.replace(' ', '')})}} autoCapitalize={'characters'} placeholderTextColor='#2F2F2F' placeholder="Full Number Plate" />
                    <Text></Text>
                    <TouchableOpacity style={Styles.midBtn} onPress={()=>{this.search()}}>
                        <Text style={Styles.btnText} >SEARCH</Text>
                    </TouchableOpacity>
            </View>

            <Modal visible={this.state.showLoading} animationType="slide" transparent={true} >
                <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    backgroundColor: 'black',
                    opacity: 0.3
                }}
                >
                    <ActivityIndicator size="large" color="#4E00FF" />
                </View>
            </Modal>

            <View style={Styles.Button}>
                <TouchableOpacity style={Styles.bottomBtn} onPress={()=>{this.report()}}>
                    <Text style={Styles.btnText} >REPORT A DRIVER</Text>
                </TouchableOpacity>
            </View>
                
            </View>
        )
    }

}