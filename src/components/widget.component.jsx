import React from 'react';
import './stylesheets/widget.scss';
import alerts from './alerts.json';

export class HorizontalWidget extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            animation: undefined,
            selectedAlert: -1
        }
    }

    componentDidMount() {
        this.startAnimation();
    }
  
    componentWillUnmount() {
        this.stopAnimation();
    }

    render() {
        return (
            <div name="horizontal-widget" onMouseEnter={() => this.stopAnimation()} onMouseLeave={() => this.startAnimation()}>
                <button className="bumper x" onClick={() => this.scrollTo(this.state.selectedAlert - 1)} disabled={this.state.selectedAlert <= 0 ? true : false}>
                    <span className="y">
                        <i className="fa fa-chevron-left"></i>
                    </span>
                </button>
                <ul className="alerts">{alerts.map( (alert, i) => (
                    <li id={'alert' + i} key={i} className="alert" onClick={() => this.scrollTo(i)}>
                        <span className="priority" style={{color: this.translatePriority(alert.priority).color}}>{this.translatePriority(alert.priority).label}</span>
                        <span className="time">{(new Date(alert.timestamp)).toLocaleTimeString()}</span>
                        <span className="date">{(new Date(alert.timestamp)).toDateString()}</span>
                        <div className="type">{alert.type}</div>
                    </li>
                ))}</ul>
                <button className="bumper x" onClick={() => this.scrollTo(this.state.selectedAlert + 1)} disabled={(this.state.selectedAlert >= (alerts.length-1)) ? true : false}>
                    <span className="y">
                        <i className="fa fa-chevron-right"></i>
                    </span>
                </button>
            </div>
        );
    }

    scrollTo(index) {   
        let requestedAlert = document.getElementById('alert' + index);

        if (requestedAlert) {
            // updates class values:
            for (let alert of document.getElementsByClassName('alert')) {
                alert.classList.remove('selected')
            }
            requestedAlert.classList.add('selected');
            // determines scroll positioning:
            let positioning;
            switch (true) {
                case (index < 1):
                    positioning = 'start';
                    break;
                case (index >= (alerts.length-1)):
                    positioning = 'end';
                    break;
                default:
                    positioning = 'center';
            }
            // initiates scroll animation and updates state:         
            requestedAlert.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: positioning
            });
            this.setState({
                selectedAlert: index
            });
        }
    }

    startAnimation() {
        this.state.animation = window.setInterval( () => {
            let next = this.state.selectedAlert;
            switch (true) {
                case (this.state.selectedAlert < (alerts.length - 1)):
                    next++
                    break;
                default:
                    next = 0;
            }
            this.scrollTo(next);
        }, 1000);
    }

    stopAnimation() {
        window.clearInterval(this.state.animation);
    }

    translatePriority(priority) {
        switch (priority) {
            case 1:
                return {
                    label: 'high',
                    color: 'rgb(255, 51, 51)'
                };
            case 2:
                return {
                    label: 'warn',
                    color: 'rgb(255, 255, 153)'
                };
            case 3:
                return {
                    label: 'info',
                    color: 'rgb(153, 204, 255)'
                };
        }
    }
}

export class VerticalWidget extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }
  
    componentWillUnmount() {
    }

    render() {
        return (
            <div name="vertical-widget">
                <ul>{alerts.map( (alert, i) => (
                    <li key={i}>
                        <span className="priority" style={{color: this.translatePriority(alert.priority).color}}>{this.translatePriority(alert.priority).label}</span>
                        <span className="time">{(new Date(alert.timestamp)).toLocaleTimeString()}</span>
                        <span className="date">{(new Date(alert.timestamp)).toDateString()}</span>
                        <div className="alert">{alert.type}</div>
                    </li>
                ))}</ul>
            </div>
        );
    }

    translatePriority(priority) {
        switch (priority) {
            case 1:
                return {
                    label: 'high',
                    color: 'rgb(255, 51, 51)'
                };
            case 2:
                return {
                    label: 'warn',
                    color: 'rgb(255, 255, 153)'
                };
            case 3:
                return {
                    label: 'info',
                    color: 'rgb(153, 204, 255)'
                };
        }
    }
}