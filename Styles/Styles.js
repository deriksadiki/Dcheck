import React from 'react'
import  {StyleSheet, Dimensions} from 'react-native'
let width = Dimensions.get('window').width
let height =  Dimensions.get('window').height

export default Styles =  StyleSheet.create({

    header:{
        marginTop: height * 0.03,
        marginLeft : width * 0.05
    },

    miniText:{
        color: '#2F2F2F',
        fontSize: 24,
        marginBottom: 5
    },

    modalText:{
        color: '#4E00FF',
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 6
    },
    scrollView: {
        marginHorizontal: 0,
        marginBottom: height * 0.065
      },
    modalInnerText:{
        fontSize: 16,
        marginBottom: 5
    },
    modalCont:{
        width: width * 0.8,
        marginLeft : width * 0.05,
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
    },
    modal:{
        backgroundColor: 'white',
        height:  height * 0.4,
        width: width * 0.9,
        position: 'absolute',
        bottom: height * 0.3,
        marginLeft : width * 0.05,
        borderRadius: 13
    },

    modalBtn:{
        height: height * 0.07,
        width: width * 0.8,
        marginLeft : width * 0.05,
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#4E00FF',
        borderRadius: 8
    },
    Button:{
        position : 'absolute',
        bottom : height * 0.03,
       
    },

    alignThings:{
        marginTop: height * 0.02,
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
    },

    boxes:{
        marginTop: height * 0.022,
        backgroundColor: '#F0F0F0',
        height:  height * 0.14,
        width: width * 0.265,
        marginLeft : width * 0.05,
        borderRadius: 8
    },
    img :{
        height:  height * 0.14,
        width: width * 0.265,
    },
    resBody:{
        width: width * 0.9,
        marginLeft : width * 0.05,
        marginTop: 10,
        borderBottomColor: '#f2f2f2',
        borderBottomWidth: 1
    },
    bottomBtn:{
        height: height * 0.07,
        width: width * 0.9,
        marginLeft : width * 0.05,
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#4E00FF',
        borderRadius: 8
        
    },

    midBtn:{
        height: height * 0.065,
        width: width * 0.5,
        marginLeft : width * 0.25,
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#4E00FF',
        borderRadius: 8,
        textTransform: 'uppercase'
    },

    mainInput:{
        borderRadius: 8,
        backgroundColor: '#F2F2F2',
        borderBottomColor: '#707070',
        borderLeftColor: '#707070',
        borderRightColor: '#707070',
        borderTopColor: '#707070', 
        width: width * 0.9,
        textAlign: 'center',
        marginLeft : width * 0.05,
        textTransform: 'uppercase',
        fontSize: 20,
        fontWeight: '900'
    },

    inputs:{
        borderRadius: 8,
        backgroundColor: '#F2F2F2',
        borderBottomColor: '#707070',
        borderLeftColor: '#707070',
        borderRightColor: '#707070',
        borderTopColor: '#707070', 
        width: width * 0.9,
        textAlign: 'center',
        marginLeft : width * 0.05,
        height: height * 0.06,
        marginTop: height * 0.022
    },

    BigInput:{
        borderRadius: 8,
        backgroundColor: '#F2F2F2',
        borderBottomColor: '#707070',
        borderLeftColor: '#707070',
        borderRightColor: '#707070',
        borderTopColor: '#707070', 
        width: width * 0.9,
        textAlign: 'center',
        marginLeft : width * 0.05,
        height: height * 0.15,
        marginTop: height * 0.022
    },

    mainBody:{
        marginTop: height * 0.2
    },

    btnText:{
        color : '#FFFFFF', 
        fontSize: 22
    },

    headerContainer:{
        marginTop: height * 0.1,
        marginLeft : width * 0.05
    },

    headerText:{
        color: '#4E00FF',
        fontSize: 44,
        fontWeight: 'bold'
    
    },
    innerText:{
        width : width * 0.75
    },
})