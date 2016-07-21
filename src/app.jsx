import 'babel-polyfill'; // For less spec compliant browsers
import React from 'react';
import ReactDOM from 'react-dom';
import Info from './Info.jsx';

// ---------------------
// Init App
// ---------------------
let Init = () =>{

  //ReactDOM.render(<Simple data={faculties}/>, document.getElementById('visualization'));
  ReactDOM.render(<Info/>, document.getElementById('app'));

};
window.addEventListener('load', Init(), false);