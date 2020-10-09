import React from 'react'
import {Text, View,Alert, PermissionsAndroid} from 'react-native'
import {NavigationContainer} from '@react-navigation/native'
import Stack from './Stack/Stack'
import SplashScreen from 'react-native-splash-screen'


export default class App extends React.Component{

  componentDidMount(){
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
    this.getLocationPermission()
    setTimeout(() => {
      SplashScreen.hide()
    }, 4000);
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
            console.log('')
          } else {
            Alert.alert('',"Please not that by denying DCHECK to access your location, you may not be able to report a driver");
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
          <NavigationContainer>
            <Stack />
          </NavigationContainer>
        )
    }

}