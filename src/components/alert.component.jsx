import React from 'react';
import { HighPriority } from './svgs/priority-icons.svg.jsx';

export class Alert extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }
  
    componentWillUnmount() {
    }

    render() {
        return (
            <div name="alert">
                <div className="header">
                    <HighPriority size="50" color={this.props.color} duration="4s" />
                    <div className="title">
                        <div className="type">{this.props.alert.type}</div>
                        <div className="source">{this.props.alert.source}</div>
                    </div>
                </div>
                <div className="content">
                    <div className="timestamp">
                        &nbsp;
                        <span className="date">{(new Date(this.props.alert.timestamp)).toLocaleDateString()}</span>
                        <span className="time">{(new Date(this.props.alert.timestamp)).toLocaleTimeString()}</span>                        
                    </div>
                    <table className="metadata">
                        <tbody>
                        {this.prepareMetadata(this.props.alert.metadata).map( (meta, i) => (
                            <tr className="pair" key={i}>
                                <td className="key">{meta.key}</td>
                                <td className="value">{meta.value}</td> 
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    prepareMetadata(metadata) {
        let prepared = []
        for (let key in metadata) {
            prepared.push({
                key: key,
                value: metadata[key]
            });
        }
        return prepared;
    }
}