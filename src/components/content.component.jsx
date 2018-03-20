import React from 'react';
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
                <InteractiveAreaChart width="600" height="150" />
            </div>
        );
    }
}