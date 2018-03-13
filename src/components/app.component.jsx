import React from 'react';
import { Header } from './header.component.jsx';
import { Content } from './content.component.jsx';

export class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div name="App">
                <Header />
                <Content />
            </div>
        );
    }
}