import React from 'react';
import {Text, View, TouchableOpacity, Alert, TextInput,StatusBar, ActivityIndicator, Modal} from 'react-native';
import Styles from '../Styles/Styles';
import database, { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';

export default class PanicConfig extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            myname: '',
            mycell: '',
            c1_name: '',
            c1_cell: '',
            c2_name: '',
            c2_cell: '',
            networkInfo: {},
            deviceName: '',
            model: '',
            manuf: '',
            deviceIp: '',
            number: '',
            batteryLevel: '',
            batteryState: '',
            showLoading : false,
        }
    }

    componentDidMount(){
        this.getDeviceInfo();
    }

    completeSetup(){
        this.getDeviceInfo();
        var deviceId = DeviceInfo.getUniqueId();

        var myname = this.state.myname;
        var mycell = this.state.mycell;

        var c1n = this.state.c1_name;
        var c1c = this.state.c1_cell;

        var c2n = this.state.c2_name;
        var c2c = this.state.c2_cell;


        if(myname !== '' & mycell !== '' & c1n !== '' & c1c !== ''){
            if(mycell.length == 10 & c1c.length == 10){
            this.setState({showLoading: true});
            var user_data = {
                user_name: myname,
                user_cell: mycell,
                cont1_name: c1n,
                cont1_cell: c1c,
                cont2_name: c2n,
                cont2_cell: c2c,
                model: this.state.model,
                make: this.state.manuf,
                batteryLevel: this.state.batteryLevel,
                batteryState: this.state.batteryState,
                deviceName: this.state.deviceName,
                deviceId: deviceId
            }

            database().ref('/panicButton/'+deviceId).set(user_data).then(()=>{
                this.saveLocally(user_data);
                this.setState({showLoading: false});
                Alert.alert('Successfully Saved!', 'For now, you will not be able to change these details.');
                this.props.navigation.navigate('Disclaimer');
            });

        }else{
            Alert.alert('', 'Avoid using the country code (27), use zero (0) instead.');
        }
        }else{
            Alert.alert('','Please fill in at least one contact in addition to your details.')
        }        
    }

    async saveLocally(user_data){
        await AsyncStorage.setItem('panicConfig',JSON.stringify(user_data)).then( async ()=>{
            var savedData = await AsyncStorage.getItem('panicConfig');
            console.warn('From Local', savedData);
        });
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

          console.warn(deviceData)
  

    }


    render(){
        return(
            <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                 <StatusBar backgroundColor="black" />
                <View style={Styles.header}>
                    <Text style={Styles.headerText}>DCHECK</Text>
                    <Text style={Styles.miniText}>PANIC BUTTON SETUP</Text>
                </View>


                <View>
                <Text style={Styles.miniHeader}>Your Details</Text>
                <TextInput style={Styles.inputs} placeholder="Your Name" onChangeText={(text)=>{this.setState({myname: text})}}/>

                <TextInput style={Styles.inputs} keyboardType='numeric' placeholder="Your Cellphone Number" onChangeText={(text)=>{this.setState({mycell: text})}}/>
                </View>


                <View>
                <Text style={Styles.miniHeader}>Save Contacts</Text>
                <Text style={Styles.smallText}>We’ll send SMSs to the contacts you save here
with tracking links when you press the
Panic Button.</Text>
                <TextInput style={Styles.inputs} placeholder="Contact Name" onChangeText={(text)=>{this.setState({c1_name: text})}}/>

                <TextInput style={Styles.inputs} keyboardType='numeric' placeholder="Contact Cellphone Number" onChangeText={(text)=>{this.setState({c1_cell: text})}}/>

                <Text></Text>

                <TextInput style={Styles.inputs} placeholder="Contact Name" onChangeText={(text)=>{this.setState({c2_name: text})}}/>

                <TextInput style={Styles.inputs} keyboardType='numeric' placeholder="Contact Cellphone Number" onChangeText={(text)=>{this.setState({c2_cell: text})}}/>
                </View>





            <View style={Styles.Button}>
                <TouchableOpacity style={Styles.bottomBtn} onPress={()=>{this.completeSetup()}}>
                    <Text style={Styles.btnText}>COMPLETE SETUP</Text>
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


            </View>
        );
    }
}