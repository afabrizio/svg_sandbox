// libraries:
import $ from 'jquery';
import path from 'path'
import React from 'react';
import ReactDOM from 'react-dom';

// assets:
import favicon from './assets/images/favicon.png';

// stylesheets:
import './default.scss';
    
// React Components:
import { App } from './components/app.component.jsx';

// Add favicon
$('head').append(
    $('<link></link>')
        .attr('rel', 'shortcut icon')
        .attr('type', 'image/png')
        .attr('href', favicon)
);

$('head').append(
    $('<script defer src="https://use.fontawesome.com/releases/v5.0.6/js/all.js"></script>')
)

$('body').append(
    $(`<div></div>`)
        .attr('id', 'container')
);

ReactDOM.render(
    <App/>,
    document.getElementById('container')
);