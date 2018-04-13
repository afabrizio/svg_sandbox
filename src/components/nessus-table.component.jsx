import React from 'react';

export class NessusTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hosts: {
                dropdown: false,
                toggleDropdown: function(self) {
                    self.setState({
                        hosts: Object.assign({}, self.state.hosts, {dropdown: !self.state.hosts.dropdown})
                    });
                }
            }
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
                        <div className="breadcrumbs">
                            <span className="crumb" style={{'backgroundColor': '#fff'}}>{this.props.dataset.xKey}</span>
                            <span className="delimiter">></span>
                            <span className="crumb" style={{'backgroundColor': this.props.dataset.yKey.color + 'bf'}} data-tootip={this.props.dataset.value.count + 'of'+ this.props.dataset.yKey.count}>{this.props.dataset.yKey.key} Risk</span>
                            <span className="delimiter">></span>
                            <span className="crumb" style={{'backgroundColor': this.props.dataset.color + 'bf'}}>{this.props.dataset.key}</span>
                            <span className="delimiter">></span>
                            <span className="crumb dropdown" onClick={() => this.state.hosts.toggleDropdown(this)}>
                                <span>{0} of {this.props.dataset.value.hosts.length} hosts selected</span>
                                <svg width="10" height="10">
                                    <path d="M 2 2 L 5 8 L 8 2 Z"></path>
                                </svg>
                                <div className="list" style={{'display': this.state.hosts.dropdown ? 'block' : 'none'}}>{this.props.dataset.value.hosts.map( (host, i) => (
                                    <label htmlFor={host.key} key={i}>
                                        <input type="checkbox" name={host.key} />
                                        {host.key}
                                    </label>
                                ))}</div>
                            </span>
                        </div>
                    </div>
                    <div className="detail">
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
                                                    <td>{ (meta.toLowerCase() === 'see also') ? 
                                                        vulnerability[meta].toString().split(/(\r\n|\n|\r)/gm).map( (href, i) => (<div key={i}><a target="_blank" href={href}>{href}</a></div>) )
                                                        :
                                                        vulnerability[meta]
                                                    }</td>
                                                </tr>
                                            ))}</tbody>
                                        </table>
                                    </td>
                                </tr>
                                ))
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            : null}</div>
        );
    }
}
