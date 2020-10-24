import React from 'react'
import {Text, View, Alert, TouchableOpacity, TextInput, Modal, Image, ActivityIndicator,StatusBar} from 'react-native'
import Styles from '../Styles/Styles'
import Geolocation from '@react-native-community/geolocation';
import database from '@react-native-firebase/database';
import ImagePicker from 'react-native-image-picker';

export default class Report extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            showModal: false, 
            showLoading: false,
            location : '',
            name: '',
            make: '',
            plate: '',
            desc: '',
            color: '',
            img1: 'gfdg',
            img2: 'gdfg',
            img3: 'fgdgfd'
        }
    }

    componentDidMount(){
        this.setState({
            location : this.props.route.params.location
        })
    }

    getLocation(){
        Geolocation.getCurrentPosition((info) =>{
            let obj = {
                lat: info.coords.latitude,
                lng: info.coords.longitude
            }
            this.setState({location: obj});
            this.props.navigation.navigate('Report', {location : this.state.location});

        }, (error) =>{
            console.log('no location')
        }, {enableHighAccuracy: true, timeout: 1500})
    }

    report(){
        if(this.state.location === ''){
            this.getLocation();
        }
        this.props.navigation.navigate('Report', {location : this.state.location})
    }

    chooseFile = (number) => {
        var options = {
          title: 'Select Image',
          storageOptions: {
            skipBackup: true,
            path: 'images',
          },
        };
        ImagePicker.showImagePicker(options, response => {
        //   console.log('Response = ', response);
    
          if (response.didCancel) {
            // console.log('User cancelled image picker');
          } else if (response.error) {
            // console.log('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
            // alert(response.customButton);
          } else {
            // let source = response;
            // You can also display the image using data:
             let source = 'data:image/jpeg;base64,' + response.data ;
            if (number == 1){
                this.setState({
                    img1: source,
                  });
            }else if (number == 2){
                this.setState({
                    img2: source,
                  });
            } else if (number == 3){
                this.setState({
                    img3: source,
                  });
            }
          }
        });
      };


    report(){
        if (this.state.name != '' && this.state.desc != '' && this.state.make != '' && this.state.color != '' && this.state.plate != ''){
            this.setState({
                showLoading: true
            }, () =>{
                var today = new Date();
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var dateTime = date+' '+time;
                let key = this.state.plate.replace(/\s/g,'')
                key = key.toUpperCase()
                database().ref('Reports/' +  key + '/').push({
                    name : this.state.name,
                    description : this.state.desc,
                    numberPlate : this.state.plate,
                    location : this.state.location,
                    color : this.state.color,
                    make : this.state.make,
                    date : dateTime,
                    img1 : this.state.img1,
                    img2 : this.state.img2,
                    img3 : this.state.img3
                }).then(() =>{
                    setTimeout(() => {
                        this.setState({
                            showLoading: false,
                            showModal: true
                        }) 
                    }, 2000);
                }, error =>{
                    this.setState({
                        showLoading: false,
                    }, () =>{
                        Alert.alert('', 'Something happened, Please check your internet connection and  try again!');
                    }) 
                })
            })

        }else{
            Alert.alert('', 'Please enter all the information before you can report a driver');
        }
   
    }
    
    render(){
        return(
            <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                 <StatusBar backgroundColor="black" />
                <View style={Styles.header}>
                    <Text style={Styles.headerText}>DCHECK</Text>
                    <Text style={Styles.miniText}>REPORT A DRIVER</Text>
                </View>
               
               <View>
                   <TextInput style={Styles.inputs} maxLength={9} value={this.state.plate} onChangeText={(txt)=>{this.setState({plate:txt.replace(' ', '')})}} autoCapitalize={'characters'} placeholder="Number Plate"  placeholderTextColor='#2F2F2F' />
                   <TextInput style={Styles.inputs} onChangeText={(txt)=>{this.setState({make: txt})}} placeholder="Car Make & Model"  placeholderTextColor='#2F2F2F' />
                   <TextInput style={Styles.inputs} onChangeText={(txt)=>{this.setState({color: txt})}} placeholder="Car Colour"  placeholderTextColor='#2F2F2F' />
                   <TextInput style={Styles.inputs} onChangeText={(txt)=>{this.setState({name: txt})}} placeholder="Driver Name"  placeholderTextColor='#2F2F2F' />
                   <TextInput style={Styles.BigInput} onChangeText={(txt)=>{this.setState({desc: txt})}} placeholder="What Happened?"  placeholderTextColor='#2F2F2F' />
               </View>

               <View>
                   <View style={Styles.alignThings}>
                    <Text style={{fontSize: 21, fontWeight: 'bold'}}>Upload Images</Text>
                   </View>

                   <View style={{flexDirection:'row'}} > 
                   <TouchableOpacity style={Styles.boxes} onPress={()=>{this.chooseFile(1)}} >
                   <Image source={{ uri: this.state.img1 }}
                        style={Styles.img} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={Styles.boxes} onPress={()=>{this.chooseFile(2)}}  >
                    <Image source={{ uri: this.state.img2 }}
                        style={Styles.img} />
                    </TouchableOpacity>

                    <TouchableOpacity style={Styles.boxes} onPress={()=>{this.chooseFile(3)}} >
                        <Image source={{ uri: this.state.img3 }}
                        style={Styles.img} />
                    </TouchableOpacity>
                   </View>
               
               </View>

            <View style={Styles.Button}>
                <TouchableOpacity style={Styles.bottomBtn} onPress={()=>{this.report()}}>
                    <Text style={Styles.btnText} >REPORT DRIVER</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={this.state.showModal} animationType="slide" transparent={true} >
                <View style={{
                    flex: 1,
                    backgroundColor: '#000000',
                    opacity: 0.8
                }}>     
                 </View>

                   <View style={Styles.modal}> 

                    <View style={Styles.alignThings}>
                        
                        <Text style={Styles.modalText}>THANK YOU!</Text>
                        <View style={Styles.modalCont}>
                            <Text style={Styles.modalInnerText} >Your report has been filed on our system.</Text>
                            <Text></Text>
                            <Text style={Styles.modalInnerText}>Please remember that DCHECK is not the police. <Text></Text> Report this driver at your nearest police station as well.</Text>
                        </View>
                    </View>

                <View style={Styles.Button}>
                    <TouchableOpacity style={Styles.modalBtn} onPress={()=>{this.setState({showModal:false},()=>{this.props.navigation.popToTop()})}}>
                        <Text style={Styles.btnText} >OKAY</Text>
                    </TouchableOpacity>
                 </View>
                
                 </View>

            </Modal>

            <Modal visible={this.state.showLoading} animationType="slide" transparent={true} >
                <View
                style={{
                    flex: 1,
                    justifyContent: "center"
                }}
                >
                    <ActivityIndicator size="large" color="#4E00FF" />
                </View>
            </Modal>

            </View>
        )
    }

}