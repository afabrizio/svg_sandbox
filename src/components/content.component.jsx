import React from 'react';
import { Sandbox } from './svgs/line.svg.jsx';

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
                <Sandbox size="150" color="#F27474" duration="2s"></Sandbox>
            </div>
        );
    }
}