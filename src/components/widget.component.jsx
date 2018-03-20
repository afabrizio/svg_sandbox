import React from 'react';
import './stylesheets/widget.scss';
import alerts from './alerts.json';

export class HorizontalWidget extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }
  
    componentWillUnmount() {
    }

    render() {
        return (
            <div name="horizontal-widget">
                <span className="bumper x">
                    <span className="y">
                        <i className="fa fa-chevron-left"></i>
                    </span>
                </span>
                <ul>{alerts.map( (alert, i) => (
                    <li key={i}>
                        <span className="priority" style={{color: this.translatePriority(alert.priority).color}}>{this.translatePriority(alert.priority).label}</span>
                        <span className="time">{(new Date(alert.timestamp)).toLocaleTimeString()}</span>
                        <span className="date">{(new Date(alert.timestamp)).toDateString()}</span>
                        <div className="alert">{alert.type}</div>
                    </li>
                ))}</ul>
                 <span className="bumper x">
                    <span className="y">
                        <i className="fa fa-chevron-right"></i>
                    </span>
                </span>
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