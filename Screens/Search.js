
import React from 'react'
import {PermissionsAndroid,Text, View, TouchableOpacity, Alert, TextInput,StatusBar, ActivityIndicator, Modal} from 'react-native'
import Styles from '../Styles/Styles';
import database, { firebase } from '@react-native-firebase/database';
import Geolocation from 'react-native-geolocation-service';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';


var myLocation = {};
var canNav;

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
            blockedModal: false,
            myname: '',
            mycell: '',
            c1cell: '',
            c2cell: ''
        }
    }

    UNSAFE_componentWillMount(){
        this.getLocation();
    }

    async componentDidMount(){
        this.manageConnection();
        this.getDeviceInfo();
        this.intervalID = setInterval(()=>{this.listenForNav()}, 300);

        this.removePlate();

        await AsyncStorage.getItem('panicConfig').then(res => {
            if(!res || res == null){
                Alert.alert('Setup Your Panic Button', 'Tap on the PANIC button to get started and save emergency contacts.');
            }else{
                //do nothing...
            }
        });
    }

    async removePlate(){
        //This is to prevent the app sending a previously searched plate via sms
        await AsyncStorage.setItem('currentPlate', '');
    }

    async listenForNav(){
        if(canNav){
            clearInterval(this.intervalID);
            var navObject = {
                location: myLocation,
                name: this.state.myname,
                mycell: this.state.mycell,
                c1cell: this.state.c1cell,
                c2cell: this.state.c2cell,
                deviceId: DeviceInfo.getUniqueId(),
                plate: this.state.plate
            }
            await AsyncStorage.setItem('panicData', JSON.stringify(navObject)).then(()=>{
            this.props.navigation.navigate('PanicMode');
            canNav = true;
            });
        }
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

    async savePlate(plate){
        await AsyncStorage.setItem('currentPlate', plate).then( async ()=>{
           var thisPlate =  await AsyncStorage.getItem('currentPlate');
           console.warn(thisPlate);
        });
    }

    saveSearch(plate){
        this.savePlate(plate);
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

    async panicMode(){
        try{
        var isConfigured = await AsyncStorage.getItem('panicConfig');
        if(isConfigured){
            this.enterPanicMode(isConfigured);
        }else{
            this.props.navigation.navigate('PanicConfig');
        }
    }catch(e){
        console.warn(e);
    }
    }

    enterPanicMode(user_data){
        var json_data = JSON.parse(user_data);
        console.warn(json_data)
        var myname = json_data.user_name;
        var mycell = json_data.user_cell;
        var c1cell = json_data.cont1_cell;
        var c2cell = json_data.cont2_cell;

        this.setState({mycell: json_data.user_cell});
        this.setState({c1cell: json_data.cont1_cell});
        this.setState({c2cell: json_data.cont2_cell});
        this.setState({myname: myname});

        console.warn(mycell, c1cell, c2cell);

        if(mycell == c1cell){
            Alert.alert('Error', 'Something did not work... Try again later.');
        }else{
            this.getLocationPermission();
        }
    }

    getLocationPermission(){
        var that =this;
        if(Platform.OS === 'ios'){
        try{
        this.callLocation(that);
        }catch(error){
            console.warn(error, typeof error, error.stringify);
            Alert.alert("Sorry, we need access to your location.");
            this.getLocationPermission();
        }
        }else{
        async function requestLocationPermission() {
          try {
              const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
                      'title': 'Location Access Required',
                      'message': 'DCHECK needs to access your location'
                  }
              )
              if (granted === PermissionsAndroid.RESULTS.GRANTED){      
                try{
                    Geolocation.getCurrentPosition((info) =>{
                        //console.warn(info);
                        let obj = {
                            lat: info.coords.latitude,
                            lng: info.coords.longitude
                        }
                        //this.setState({location: obj});
                        myLocation = obj;

                        canNav = true;
                        
                        //this.props.navigation.navigate('Report', {location : this.state.location});
                    }, (error) =>{
                        console.log(error, 'no location')
                    }, {enableHighAccuracy: true, timeout: 1500});
                }catch(e){
                    throw e;
                }

              } else {
                Alert.alert('',"Please note that by denying DCHECK to access your location, you may not be able to use the panic feature");
              }
          } catch (err) {
              console.warn(err)
          }
        }
        requestLocationPermission();
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
                        <TouchableOpacity style={Styles.panic} onPress={()=>{this.panicMode()}}><Text style={Styles.panicText}>PANIC</Text></TouchableOpacity>
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
                }}>
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