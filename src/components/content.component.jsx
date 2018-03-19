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
                <InteractiveAreaChart width="800" height="250" />
            </div>
        );
    }
}