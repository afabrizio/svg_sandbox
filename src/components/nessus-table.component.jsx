import React from 'react';

export class NessusTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            export: {
                dropdown: false,
                toFile: function(type) {
                    switch(type) {
                        case 'csv':
                            break;
                        case 'json':
                            break;
                        default:
                    }
                },
                toggleDropdown: function(self) {
                    self.state.export.dropdown = !self.state.export.dropdown;
                    self.setState({
                        export: self.state.export
                    });
                }
            },
            hosts: {
                dropdown: false,
                filterHost: function(e, self, hostIndex) {
                    let indexOf = self.state.hosts.selectedHosts.indexOf(hostIndex);
                    if (indexOf >= 0) {
                        self.state.hosts.selectedHosts.splice(indexOf, 1,);
                    } else {
                        self.state.hosts.selectedHosts.push(hostIndex);                       
                    }
                    self.setState({hosts: self.state.hosts});
                },
                selectAll: function(self, deselect) {
                    if (!deselect) {
                        self.state.hosts.selectedHosts = self.props.dataset.value.hosts.map( (host, i) => i );
                    } else {
                        self.state.hosts.selectedHosts = [];
                    }
                    self.setState({
                        hosts: self.state.hosts
                    });
                },
                selectedHosts: [0],
                toggleDropdown: function(self) {
                    self.state.hosts.dropdown = !self.state.hosts.dropdown;
                    self.setState({
                        hosts: self.state.hosts
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
                            <span className="crumb dropdown" onClick={(e) => this.state.hosts.toggleDropdown(this)}>
                                <span>{this.state.hosts.selectedHosts.length} of {this.props.dataset.value.hosts.length} hosts selected</span>
                                <svg width="10" height="10">
                                    <path d="M 2 2 L 5 8 L 8 2 Z"></path>
                                </svg>
                                <div className="list" style={{'display': this.state.hosts.dropdown ? 'block' : 'none'}} onClick={(e) => e.stopPropagation()}>
                                    <button type="button" name="selectAll" onClick={() => this.state.hosts.selectAll(this, false)}>Select All</button>
                                    <button type="button" name="deselectAll" onClick={() => this.state.hosts.selectAll(this, true)}>Deselect All</button>                                    
                                    {this.props.dataset.value.hosts.map( (host, i) => (
                                    <label htmlFor={host.key} key={i} onClick={(e) => this.state.hosts.filterHost(e, this, i)}>
                                        <input type="checkbox" name={host.key} checked={this.state.hosts.selectedHosts.includes(i)} onChange={(e) => e.stopPropagation()}/>
                                        {host.key}
                                    </label>))}
                                </div>
                            </span>
                            <span className="delimiter">></span>
                            <span className="crumb dropdown" onClick={(e) => this.state.export.toggleDropdown(this)}>
                                <span>Export</span>
                                <svg width="10" height="10">
                                    <path d="M 2 2 L 5 8 L 8 2 Z"></path>
                                </svg>
                                <div className="list" style={{'display': this.state.export.dropdown ? 'block' : 'none'}} onClick={(e) => e.stopPropagation()}>
                                    <button type="button" name="json" onClick={() => this.state.export.toFile(this, 'csv')}>CSV</button>
                                    <button type="button" name="csv" onClick={() => this.state.export.toFile(this, 'json')}>JSON</button>                                    
                                </div>
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
                            <tbody>{this.state.hosts.selectedHosts.map( (hostIndex) => (
                                this.props.dataset.value.hosts[hostIndex].values.map( (vulnerability, j) => (
                                <tr key={j}>
                                    {(j===0) ? <th rowSpan={this.props.dataset.value.hosts[hostIndex].values.length} valign="top" className="host">{this.props.dataset.value.hosts[hostIndex].key}</th> : null}
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
