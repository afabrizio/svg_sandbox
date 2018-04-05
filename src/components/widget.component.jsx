import React from 'react';
import './stylesheets/widget.scss';
import alerts from '../components/data/alerts/alerts.json';

export class HorizontalWidget extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            animation: undefined,
            dataset: undefined,
            selectedAlert: -1
        }
    }

    componentDidMount() {
        this.state.dataset = this.prepareAlerts(alerts);
        this.setState({});
        this.startAnimation();
        console.log(this.state)
    }
  
    componentWillUnmount() {
        this.stopAnimation();
    }

    render() {
        return (
        this.state.dataset ?
            <div name="horizontal-widget" onMouseEnter={() => this.stopAnimation()} onMouseLeave={() => this.startAnimation()}>
                <button className="bumper x" onClick={() => this.scrollTo(this.state.selectedAlert - 1)} disabled={this.state.selectedAlert <= 0 ? true : false}>
                    <span className="y">
                        <i className="fa fa-chevron-left"></i>
                    </span>
                </button>
                <ul className="alerts">{this.state.dataset.map( (alert, i) => (
                    <li alert={i} key={i} className="alert" onClick={() => this.scrollTo(i)}>
                        <span className="priority" style={{color: alert.priority.color}}>{alert.priority.label}</span>
                        <span className="time">{alert.date.toLocaleTimeString()}</span>
                        <span className="date">{alert.date.toDateString()}</span>
                        <div className="type">{alert.type}</div>
                    </li>
                ))}</ul>
                <button className="bumper x" onClick={() => this.scrollTo(this.state.selectedAlert + 1)} disabled={(this.state.selectedAlert >= (alerts.length-1)) ? true : false}>
                    <span className="y">
                        <i className="fa fa-chevron-right"></i>
                    </span>
                </button>
            </div>
        : null);
    }

    prepareAlerts(alerts) {
        return alerts
            .map( (alert) => {
                alert.date = new Date(alert.timestamp);
                switch (alert.priority.severity) {
                    case 1:
                        alert.priority.color = 'rgb(255, 51, 51)';
                        break;
                    case 2:
                        alert.priority.color = 'rgb(255, 255, 153)';
                        break;
                    default:
                        alert.priority.color = 'rgb(153, 204, 255)';
                }
                return alert;
            })
            .sort( (a, b) => a.date - b.date );
    }

    scrollTo(index) {   
        let requestedAlert = document.querySelector('[alert="' + index + '"]');

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
        }, 5000);
    }

    stopAnimation() {
        window.clearInterval(this.state.animation);
    }
}

export class VerticalWidget extends React.Component {
    constructor(props) {
        super(props);

        this.state = { };
    }

    componentDidMount() {
        this.state.dataset = this.prepareAlerts(alerts);
        this.setState({});
        console.log(this.state)
    }
  
    componentWillUnmount() {
    }

    prepareAlerts(alerts) {
        return alerts
            .map( (alert) => {
                alert.date = new Date(alert.timestamp);
                switch (alert.priority.severity) {
                    case 1:
                        alert.priority.color = 'rgb(255, 51, 51)';
                        break;
                    case 2:
                        alert.priority.color = 'rgb(255, 255, 153)';
                        break;
                    default:
                        alert.priority.color = 'rgb(153, 204, 255)';
                }
                return alert;
            })
            .sort( (a, b) => a.date - b.date );
    }

    render() {
        return (
        this.state.dataset ?
            <div name="vertical-widget">
                <ul>{this.state.dataset.map( (alert, i) => (
                    <li alert={i} key={i}>
                        <span className="priority" style={{color: alert.priority.color}}>{alert.priority.label}</span>
                        <span className="time">{alert.date.toLocaleTimeString()}</span>
                        <span className="date">{alert.date.toDateString()}</span>
                        <div className="alert">{alert.type}</div>
                    </li>
                ))}</ul>
            </div>
        : null)
    }
}