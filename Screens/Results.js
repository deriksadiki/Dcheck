import React from 'react'
import {Text, View, TouchableOpacity, StatusBar, ScrollView, Image} from 'react-native'
import Styles from '../Styles/Styles'
import d_images from './Images.js';

export default class Results extends React.Component{
    
    constructor(props){
        super(props)
        this.state = {
            showLoading : false,
            location : '',
            plate : '',
            searchRes: [],
            found: false
        }
    }

    UNSAFE_componentWillMount(){
        this.setState({
            location: this.props.route.params.location,
            found : this.props.route.params.found,
            searchRes : this.props.route.params.res,
            plate : this.props.route.params.plate
        })
    }

    report(){
        this.props.navigation.navigate('Report', {location : this.state.location})
    }

    render(){
        let showRes = this.state.searchRes.map((val, index) =>{
            return(
            <View  key={index}>
                <View style={Styles.resBody}>
                    <Text></Text>
                    <Text style={{fontSize: 21, fontWeight:'bold'}}>{val.name}</Text>
                    <Text style={{fontSize: 15, fontWeight:'bold'}}>{val.numberPlate}  {val.color} {val.make}</Text>
                    <Text></Text>
                    <Text style={{fontSize: 15, fontWeight:'bold', marginBottom: 8}}>Accusation against driver</Text>
                     <Text>{val.description}</Text>

                     <View style={{flexDirection:'row', marginLeft: '-5%', paddingBottom: 15}} > 
                   <TouchableOpacity style={Styles.boxes} >
                   <Image source={{ uri: val.img1}}
                        style={Styles.img} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={Styles.boxes} >
                    <Image source={{ uri: val.img2 }}
                        style={Styles.img} />
                    </TouchableOpacity>

                    <TouchableOpacity style={Styles.boxes} >
                    <Image source={{ uri: val.img3 }}
                        style={Styles.img} />
                    </TouchableOpacity>
                   </View>
                </View>

            </View>
            )
        })
        return(
            <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                <StatusBar backgroundColor="black" />
                <View style={Styles.header}>
                    <Text style={Styles.headerText}>DCHECK</Text>
                    <Text style={Styles.miniText}>RESULTS</Text>
                </View>
                {this.state.found ? 
                <ScrollView style={Styles.scrollView}>
                {showRes}
                </ScrollView>
                :  
                <View style={Styles.resBody}>
                    <Text></Text>
                    <Text  style={{fontSize: 15, fontWeight:'bold'}}>{this.state.plate}</Text>
                    <Text></Text>
                    <Text></Text>
                    <Text style={{fontSize: 15, fontWeight:'bold'}}>This driver has never been reported on
DCHECK.</Text>
                </View>  
            }
                    
            <Text></Text>
            <View style={Styles.Button}>
                <TouchableOpacity style={Styles.bottomBtn} onPress={()=>{this.report()}}>
                    <Text style={Styles.btnText} >REPORT A DRIVER</Text>
                </TouchableOpacity>
            </View>
            <Text></Text>
            </View>
        )
    }

}