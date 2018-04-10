import React from 'react';

export class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            navIndex: this.props.navIndex,
            navs: [
                {
                    name: "Chart",
                    href: "#"
                },
                {
                    name: "V-Widget",
                    href: "#"
                },
                {
                    name: "H-Widget",
                    href: "#"
                },
                {
                    name: "Nessus",
                    href: "#"
                },
            ]
        }
    }

    componentDidMount() {
    }
  
    componentWillUnmount() {
    }

    navChange(index) {
        this.setState({
            navIndex: index
        });
        this.props.navChange(index);        
    }

    render() {
        return (
            <div name="Header">
                <div className="inner">
                    <b className="app-name">SVG Sandbox</b>
                    <nav className="clickable">
                        { this.state.navs.map( (nav, i) => <a className={i == this.state.navIndex ? "active" : ""} href={nav.href} onClick={() => this.navChange(i)} key={i}>{nav.name}</a> ) }
                    </nav>
                </div>
            </div>
        );
    }
}