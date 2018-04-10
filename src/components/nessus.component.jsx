import React from 'react';
import * as d3 from 'd3';

import scan_1 from './data/nessus-1.csv';
import scan_2 from './data/nessus-2.csv';
import scan_3 from './data/nessus-3.csv';

import { StackedBar } from './svgs/stacked-bar.svg.jsx';
import { VarRadiusDonut } from './svgs/variable-radius-donut.svg.jsx';


export class Nessus extends React.Component {
    constructor(props) {
        super(props);

        let self = this;

        this.state = {
            bar: undefined,
            donut: undefined,
            commandCenter: function(state) {
                self.setState(state);
            }
        }
    }

    componentDidMount() {
        this.state.commandCenter({
            bar : [
                {
                    x: 'scan_1',
                    y: d3.csvParse(scan_1)
                },
                {
                    x: 'scan_2',
                    y: d3.csvParse(scan_2)
                },
                {
                    x: 'scan_3',
                    y: d3.csvParse(scan_3)
                }
            ]
        });
    }
  
    componentWillUnmount() {
    }

    render() {
        return (
            <div name="nessus">
                <StackedBar width="1000" height="400" dataset={this.state.bar} commandCenter={this.state.commandCenter} />
                <VarRadiusDonut width="400" height="400" dataset={this.state.donut} commandCenter={this.state.commandCenter} />
            </div>
        );
    }
}