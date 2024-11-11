import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <Image 
        source={require('../../public/images/logo_orange.jpg')} 
        style={styles.logo}
      />
      <Text style={styles.headerText}>My App</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#E16104',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row', 
  },
  logo: {
    width: 50, 
    height: 50, 
    marginRight: 10, 
  },
  headerText: {
    color: 'white',
    fontSize: 20,
  },
});

export default Header;
