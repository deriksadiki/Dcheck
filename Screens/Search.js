
import React from 'react'
import {Text, View, TouchableOpacity, Alert, TextInput,StatusBar, ActivityIndicator, Modal} from 'react-native'
import Styles from '../Styles/Styles'
import database from '@react-native-firebase/database';
import Geolocation from '@react-native-community/geolocation';

export default class Search extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            showLoading : false,
            location : '',
            plate : '',
            searchRes: [],
            filePath: {},
        }
    }

    UNSAFE_componentWillMount(){
        this.getLocation();
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
            console.log('no location')
        }, {enableHighAccuracy: true, timeout: 1500})
    }

    report(){
        this.props.navigation.navigate('Report', {location : this.state.location})
        
    }

    search(){
        var numberPlate = this.state.plate;
        console.warn(numberPlate.length);
        if (numberPlate != '' && numberPlate.length > 5){
            this.setState({
                showLoading: true
            }, () =>{
            let key = this.state.plate.replace(/\s/g,'');
            key = key.toUpperCase();
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
                    <TextInput style={Styles.mainInput} maxLength={9} value={this.state.plate} onChangeText={(txt)=>{this.setState({plate:txt.replace(' ', '')})}} autoCapitalize={'characters'} placeholderTextColor='#2F2F2F' placeholder="Number Plate" />
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