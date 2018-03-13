import React from 'react';

export class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeNav: 0,
            navs: [
                {
                    name: "Line",
                    href: "#"
                },
                {
                    name: "Scatter",
                    href: "#"
                },
            ]
        }
    }

    componentDidMount() {
    }
  
    componentWillUnmount() {
    }

    navigate(index) {
        this.setState({
            activeNav: index
        });
    }

    render() {
        return (
            <div name="Header">
                <div className="inner">
                    <b className="app-name">SVG Sandbox</b>
                    <nav className="clickable">
                        { this.state.navs.map( (nav, i) => <a className={i == this.state.activeNav ? "active" : ""} href={nav.href} onClick={() => this.navigate(i)} key={i}>{nav.name}</a> ) }
                    </nav>
                </div>
            </div>
        );
    }
}