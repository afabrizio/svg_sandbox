import React from 'react';

export class NessusTable extends React.Component {
    constructor(props) {
        super(props);

        let self = this;

        this.state = {
        }
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataset) {
            console.log(nextProps.dataset);
        }
    }
  
    componentWillUnmount() {
    }

    render() {
        return (
            <div name="nessusTable" style={{height: this.props.height + 'px', width: this.props.width + 'px'}}>{this.props.dataset ? 
                <div className="container">
                    <div className="header">
                        <h5>Nessus Scan: <i>{this.props.dataset.xKey}</i></h5>
                        <h5>Risk: <i>{this.props.dataset.yKey.key} ({this.props.dataset.value.count} of {this.props.dataset.yKey.count})</i></h5>
                        <h3>{this.props.dataset.key}</h3>
                    </div>
                    <div className="filters">
                    </div>
                    <div className="details">
                    </div>
                    
                    <h4>Hosts ({this.props.dataset.value.hosts.length})</h4>
                    <ul className="hostFilters">{this.props.dataset.value.hosts.map( (host, i) => (
                        <li key={i}>
                            <input name="host" type="checkbox"></input>
                            <label htmlFor="host">{host.key}</label>
                        </li>
                    ))}</ul>
                    <table border="1" valign="top">
                        <thead>
                            <tr>
                                <th>Host</th>
                                <th>Scan Details</th> 
                            </tr>
                        </thead>
                        <tbody>{this.props.dataset.value.hosts.map( (host, i) => (
                            host.values.map( (vulnerability, j) => (
                            <tr key={j}>
                                {(j===0) ? <th rowSpan={host.values.length} valign="top" className="host">{host.key}</th> : null}
                                <td>
                                    <table border="0">
                                        <tbody>{Object.keys(vulnerability).map( (meta, k) => (
                                            <tr key={k}>
                                                <td valign="top">{meta}</td>
                                                <td>{vulnerability[meta]}</td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                </td>
                            </tr>
                            ))
                        ))}</tbody>
                    </table>
                </div>
            : null}</div>
        );
    }
}

// <table>{Object.keys(host.values[0]).map( (key) => (
// </table>))}