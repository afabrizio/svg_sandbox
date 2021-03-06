import React from 'react';

export class HighPriority extends React.Component {
    constructor(props) {
        super(props);

        this.state = { }
    }

    componentDidMount() { }
  
    componentWillUnmount() { }

    render() {
        return (
            <div name="sandbox">
                <svg id="svg" height={this.props.size} width={this.props.size}>
                    <g transform={'translate(' + this.props.size / 2 + ' ' + this.props.size / 2 + ')'}>
                        <circle cx="0" cy="0" r={this.props.size * 0.25} fill={this.props.color}></circle>
                        <animate attributeName="opacity" values="0 ; 0.1 ; 0.2 ; 0" keyTimes="0 ; 0.25 ; 0.5 ; 1" dur={this.props.duration || 2} repeatCount="indefinite"></animate>
                        <animateTransform attributeName="transform" type="scale" additive="sum" values="1 ; 2" dur={this.props.duration || 2} repeatCount="indefinite"></animateTransform>
                    </g>
                    <g transform={'translate(' + this.props.size / 2 + ' ' + this.props.size / 2 + ')'}>
                        <circle cx="0" cy="0" r={this.props.size * 0.25} stroke={this.props.color} strokeWidth={this.props.size * 0.025} fill={'none'}></circle>
                        <animateTransform attributeName="transform" type="scale" additive="sum" values="1 ; 1.05 ; 1 ; 1.05 ; 1 ; 1" keyTimes="0 ; 0.08 ; 0.25 ; 0.32 ; .5 ; 1" dur={this.props.duration || 2} repeatCount="indefinite"></animateTransform>
                    </g>
                    <text x="50%" y="50%" fontSize={this.props.size * 0.35} fontWeight={'bold'} stroke={'none'} fill={this.props.color} textAnchor={'middle'} alignmentBaseline="central">!</text>
                    {/* <g name="crosshair">
                        <line x1="50%" y1="40%" x2="50%" y2="60%"strokeWidth="1" stroke="black" strokeOpacity="0.5"/>
                        <line x1="40%" y1="50%" x2="60%" y2="50%"strokeWidth="1" stroke="black" strokeOpacity="0.5"/>
                    </g> */}
                </svg>
            </div>
        );
    }
}