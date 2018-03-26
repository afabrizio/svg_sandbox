import React from 'react';

export class BarChartIcon extends React.Component {
    constructor(props) {
        super(props);

        this.state = { }
    }

    componentDidMount() { }
  
    componentWillUnmount() { }

    render() {
        return (
        <svg width={this.props.size} height={this.props.size} xmlns="http://www.w3.org/2000/svg">
            <g group="bar-chart-icon">
                <path  d={
                    'M ' + (this.props.size*0.05) + ' ' + (this.props.size*0.1)
                    + ' L ' + (this.props.size*0.05) + ' ' + (this.props.size*0.95)
                    + ' L ' + (this.props.size) + ' ' + (this.props.size*0.95)}
                fill="none" stroke="black" strokeWidth={this.props.size * 0.05} />
                <rect x={this.props.size*0.2} y={this.props.size*0.6} width={this.props.size*0.1} height={this.props.size*0.2} rx="2" ry="2"/>
                <rect x={this.props.size*0.4} y={this.props.size*0.4} width={this.props.size*0.1} height={this.props.size*0.4} rx="2" ry="2"/>
                <rect x={this.props.size*0.6} y={this.props.size*0.5} width={this.props.size*0.1} height={this.props.size*0.3} rx="2" ry="2"/>
                <rect x={this.props.size*0.8} y={this.props.size*0.3} width={this.props.size*0.1} height={this.props.size*0.5} rx="2" ry="2"/>                
            </g>
        </svg>
        );
    }
}

export class AreaChartIcon extends React.Component {
    constructor(props) {
        super(props);

        this.state = { }
    }

    componentDidMount() { }
  
    componentWillUnmount() { }

    render() {
        return (
        <svg width={this.props.size} height={this.props.size} xmlns="http://www.w3.org/2000/svg">
            <g group="bar-chart-icon">
                <path  d={
                    'M ' + (this.props.size*0.05) + ' ' + (this.props.size*0.1)
                    + ' L ' + (this.props.size*0.05) + ' ' + (this.props.size*0.95)
                    + ' L ' + (this.props.size) + ' ' + (this.props.size*0.95)}
                fill="none" stroke="black" strokeWidth={this.props.size * 0.05} />
                <path d={
                    'M ' + (this.props.size*0.2) + ' ' + (this.props.size*0.8)
                    + ' L ' + (this.props.size*0.2) + ' ' + (this.props.size*0.6)
                    + ' L ' + (this.props.size*0.4) + ' ' + (this.props.size*0.4)
                    + ' L ' + (this.props.size*0.6) + ' ' + (this.props.size*0.5)
                    + ' L ' + (this.props.size*0.8) + ' ' + (this.props.size*0.2)
                    + ' L ' + (this.props.size*0.9) + ' ' + (this.props.size*0.3)
                    + ' L ' + (this.props.size*0.9) + ' ' + (this.props.size*0.8)
                    + ' Z'}
                fill="black" stroke="black" strokeWidth={this.props.size * 0.05} />                
            </g>
        </svg>
        );
    }
}