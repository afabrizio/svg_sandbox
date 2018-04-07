import React from 'react';
import { InteractiveAreaChart } from './svgs/area-chart.svg.jsx';
import { HorizontalWidget, VerticalWidget } from './widget.component.jsx';
import { StackedBar } from './svgs/stacked-bar.svg.jsx';

export class Content extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }
  
    componentWillUnmount() {
    }

    render() {
        return (
            <div name="content">
                {this.renderContent()}
            </div>
        );
    }

    renderContent() {
        switch (this.props.navIndex) {
            case 0:
                return <InteractiveAreaChart width="800" height="250" />;
            case 1:
                return <VerticalWidget />
            case 2:
                return <HorizontalWidget />
            case 3:
                return <StackedBar width="1000" height="400" />
        }
    }
}