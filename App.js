import React from 'react'
import {Alert, PermissionsAndroid} from 'react-native'
import {NavigationContainer} from '@react-navigation/native'
import Stack from './Stack/Stack'
import SplashScreen from 'react-native-splash-screen';


export default class App extends React.Component{
  componentDidMount(){
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    this.getLocationPermission();
    this.requestPhonePermission();
    setTimeout(() => {
      SplashScreen.hide()
    }, 3900);
  }
    
  getLocationPermission(){
    var that =this;
    if(Platform.OS === 'ios'){
    try{
    this.callLocation(that);
    }catch(error){
        console.warn(error, typeof error, error.stringify);
        this.setState({location: "Location error"});
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
            //do nothing
          } else {
            Alert.alert('',"Please not that by denying DCHECK to access your location, you may not be able to submit driver reports");
          }
      } catch (err) {
          console.warn(err)
      }
    }
    requestLocationPermission();
    }
  }

  
  async requestPhonePermission(){
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,{
        'title': 'Phone State Permission Required',
        'message': 'DCHECK needs to access your phone state'
    });

  if(granted == PermissionsAndroid.RESULTS.GRANTED){
      //do nothing
  }
  }

    render(){
        return(
          <NavigationContainer>
            <Stack />
          </NavigationContainer>
        )
    }

}