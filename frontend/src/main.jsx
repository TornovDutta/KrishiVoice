import { AppRegistry } from 'react-native';
import App from './App';

// Standard React Native Web application registration
AppRegistry.registerComponent('KrishiVoiceApp', () => App);
AppRegistry.runApplication('KrishiVoiceApp', {
  initialProps: {},
  rootTag: document.getElementById('root')
});
