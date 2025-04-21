import React from 'react';
import { Provider } from 'react-redux';
import store from './store/store';

function App() {
  return (
    <Provider store={store}>
      {/* Your app components */}
    </Provider>
  );
}

export default App; 