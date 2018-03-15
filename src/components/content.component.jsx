import React from 'react';
import { Alerts } from './svgs/alerts.svg.jsx';
import { InteractiveAreaChart } from './svgs/area-chart.svg.jsx';

export class Content extends React.Component {
    constructor(props) {
        super(props);

        this.state = { }
    }

    componentDidMount() {
    }
  
    componentWillUnmount() {
    }

    render() {
        return (
            <div name="content">
                <Alerts size="150" color="#F27474" duration="2s"></Alerts>
                <InteractiveAreaChart width="600" />
            </div>
        );
    }
}