import React, { PropTypes } from 'react'

class Info extends React.Component {
  constructor(props, context) {
    super(props, context);

    // construct the position vector here, because if we use 'new' within render,
    // React will think that things have changed when they have not.

    this.state = {
      ... this.state
    };

  }

  componentDidMount() {
    document.addEventListener('keydown', this._onKeyDown, false);

    // controls.addEventListener('change', () => {
    //   this.setState({
    //
    //   });
    // });
    //this.controls = controls;
  }
  componentWillUnmount() {
    //document.removeEventListener('keydown', this._onKeyDown, false);
    //this.controls.dispose();
    //delete this.controls;
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      default:
        break;
      case 79: // O
        // this.setState({
        //
        // });
        break;
      case 80: // P
        //this._pause();
        break;
    }
  }
}

export default Info