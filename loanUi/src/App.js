import React, { Component } from 'react'
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider'
import './App.css';

//style for slider
const sliderStyle = {
  position: 'relative',
  width: '60%',
  height: 80,
  touchAction: 'none',
}

//style for rail in slider
const railStyle = {
  position: 'absolute',
  width: '100%',
  height: 10,
  marginTop: 35,
  borderRadius: 5,
  backgroundColor: '#8B9CB6',
}

//const for amount slider
const domain = [500, 5000]
const defaultValues = [500]

//const for month slider
const month = [6, 24]
const monthValues = [6]

//common method for handle in  slider
export function Handle({
  handle: { id, value, percent },
  getHandleProps
}) {
  return (
    <div
    style={{
      left: `${percent}%`,
      position: 'absolute',
      marginLeft: -15,
      marginTop: 25,
      zIndex: 2,
      width: 30,
      height: 30,
      border: 0,
      textAlign: 'center',
      cursor: 'pointer',
      borderRadius: '50%',
      backgroundColor: '#2C4870',
      color: '#333',
    }}
    {...getHandleProps(id)}
    >
    <div style={{ fontFamily: 'Roboto', fontSize: 13, marginTop: -24, fontWeight: 'bold' }}>
    {value}
    </div>
    </div>
  )
}

//common method for Track in  slider
function Track({ source, target, getTrackProps }) {
  return (
    <div
    style={{
      position: 'absolute',
      height: 10,
      zIndex: 1,
      marginTop: 35,
      backgroundColor: '#546C91',
      borderRadius: 5,
      cursor: 'pointer',
      left: `${source.percent}%`,
      width: `${target.percent - source.percent}%`,
    }}
    {...getTrackProps()}
    />
  )
}

//update data common funtion from parent to child
function updateState(update){
  this.setState({update})
  this.setState({values:update})
}



//parent component
class App extends Component {

  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.setDataStorage = this.setDataStorage.bind(this);
    this.state = {
      values: defaultValues.slice(),
      update: defaultValues.slice(),
      month : monthValues.slice(),
      error: null,
      isLoaded: false,
      interest: [],
    }
    this.valueUpdate = [];
    this.monthUpdate = [];
  }

  //sidebar update
  renderSidebar = () => {
    var recentObj = localStorage.getItem('Recent')
    var dataObj = localStorage.getItem('Data')
    var flag = (recentObj===dataObj);
    if(localStorage.getItem('Data')===undefined || localStorage.getItem('Data')===null || localStorage.getItem('Recent')==='' || flag ){
      return <div className="sidebar">
      <div className="sidebar-link">No Recent Loan</div>
      </div>
    }else {
        return <div className="sidebar">
        <div className="sidebar-link" onClick={this.setDataStorage}>Recent Loan</div>
        </div>
    }
  }


  //data update when recent tab is clicked
  setDataStorage(e){
    e.preventDefault();
    var dataFromStorage = localStorage.getItem('Recent');
    var data = JSON.parse(dataFromStorage);
    this.monthUpdate = [data.numPayments];
    this.valueUpdate = [data.principal.amount];

    this.onChange(this.valueUpdate);
    this.onUpdate(this.valueUpdate)
    updateState(this.monthUpdate)
  }

  onUpdate = update => {
    this.setState({ update })
  }

  onChange = values => {
    this.setState({ values })
    this.componentDidMount();
  }

  handleMonthChange = (month) => {
    this.setState({month});
    this.componentDidMount();
  }

  //Api call
  componentDidMount() {
    var api="https://ftl-frontend-test.herokuapp.com/interest?amount="+this.state.values[0]+"&numMonths="+this.state.month[0];
    fetch(api)
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          isLoaded: true,
          interest: result
        });
        if(localStorage.getItem('Data')===undefined || localStorage.getItem('Data')===null){
          localStorage.setItem('Data', JSON.stringify(result));
          localStorage.setItem('Recent', '');
          this.renderSidebar();
        }else {
          localStorage.removeItem('Recent');
          localStorage.setItem('Recent',localStorage.getItem('Data'));
          localStorage.removeItem('Data');
          localStorage.setItem('Data',JSON.stringify(result))
          this.renderSidebar();
        }
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
  }


  render() {

    const {
      state: { values, update, month },
    } = this

    var details = {}= this;

    if(this.state.interest.length===0){
      details.amount = "";
      details.month = "";
      details.interest = "";
    }else {
      details.amount = this.state.interest.monthlyPayment.amount;
      details.month = this.state.interest.numPayments;
      details.interest = this.state.interest.interestRate;
    }

    return (
      <div className="app" >
      <div className="sidebar-container">
      <div className="sidebar">
      {this.renderSidebar()}
      </div>
      </div>
      <div style={{ height: 120, width: '100%' ,left: 307 , top: 20, position:'absolute'}}>
      <h2 style={{fontSize:46, left: -10,top:-10 ,position:'relative'}}>Apply Loan</h2>
      <div  style={{ left: -13 , position:'relative'}} >
      <h1>Select Loan Amount Between ($500 to $5000)</h1>
      </div>
      <Slider
      mode={1}
      step={1}
      domain={domain}
      rootStyle={sliderStyle}
      onUpdate={this.onUpdate}
      onChange={this.onChange}
      values={values}
      >
      <Rail>
      {({ getRailProps }) => (
        <div style={railStyle} {...getRailProps()} />
      )}
      </Rail>
      <Handles>
      {({ handles, getHandleProps }) => (
        <div className="slider-handles">
        {handles.map(handle => (
          <Handle
          key={handle.id}
          handle={handle}
          getHandleProps={getHandleProps}
          />
        ))}
        </div>
      )}
      </Handles>
      <Tracks right={false}>
      {({ tracks, getTrackProps }) => (
        <div className="slider-tracks">
        {tracks.map(({ id, source, target }) => (
          <Track
          key={id}
          source={source}
          target={target}
          getTrackProps={getTrackProps}
          />
        ))}
        </div>
      )}
      </Tracks>
      </Slider>
      <div  style={{ left: -13 , position:'relative'}} >
      <h1>Select Loan Month Duration Between (6 to 24 Months)</h1>
      </div>
      <MonthSlider data={this.valueUpdate} onSelectMonth={this.handleMonthChange}/>
      <Data int={details.interest} amount={details.amount} pay={details.month}/>
      </div>
      </div>
    )
  }
}


//Interest data display
class Data extends Component {
  render() {
    return (
      <div>
      <label><h2>Interest Rate:</h2></label><h4>{this.props.int}</h4><br/>
      <label><h2>Monthly Payment Amount:</h2></label><h4>$ {this.props.amount}</h4><br/>
      </div>
    );
  }
}

//month slider
class MonthSlider extends Component {
  state = {
    values: monthValues.slice(),
    update: monthValues.slice(),
  }

  constructor(props) {
    super(props)
    this.state = {
      values: monthValues.slice(),
      update: monthValues.slice(),
    }
    updateState = updateState.bind(this)
  }

  onUpdate = update => {
    this.setState({ update })
  }

  onChange = values => {
    this.setState({ values })
    this.props.onSelectMonth(values);
  }
  render() {
    const {
      state: { values, update },
    } = this
    return (
      <Slider
      mode={1}
      step={1}
      domain={month}
      rootStyle={sliderStyle}
      onUpdate={this.onUpdate}
      onChange={this.onChange}
      values={values}
      >
      <Rail>
      {({ getRailProps }) => (
        <div style={railStyle} {...getRailProps()} />
      )}
      </Rail>
      <Handles>
      {({ handles, getHandleProps }) => (
        <div className="slider-handles">
        {handles.map(handle => (
          <Handle
          key={handle.id}
          handle={handle}
          getHandleProps={getHandleProps}
          />
        ))}
        </div>
      )}
      </Handles>
      <Tracks right={false}>
      {({ tracks, getTrackProps }) => (
        <div className="slider-tracks">
        {tracks.map(({ id, source, target }) => (
          <Track
          key={id}
          source={source}
          target={target}
          getTrackProps={getTrackProps}
          />
        ))}
        </div>
      )}
      </Tracks>
      </Slider>
    )
  }
}

export default App
