import { Dimensions, StyleSheet } from 'react-native';

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  counterText: {
    color: 'white',
    fontSize: height / 4,
    fontWeight: '900',
    marginBottom: 10,
  },
  touchContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 99,
    padding: 5,
    width: 60,
    aspectRatio: 1,
  },
  touchText: {
    color: 'white',
    fontSize: 32,
  },
});
