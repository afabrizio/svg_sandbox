import React from 'react';
import { Header } from './header.component.jsx';
import { Content } from './content.component.jsx';

export class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            navIndex: 2,
            navChange: (index) => {
                this.setState({navIndex: index})
            }
        }
    }

    render() {
        return (
            <div name="App">
                <Header navChange={this.state.navChange} navIndex={this.state.navIndex} />
                <Content navIndex={this.state.navIndex} />
            </div>
        );
    }
}