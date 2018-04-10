import React from 'react';
import $ from 'jquery';
import * as d3 from 'd3';

import scan_1 from '../data/nessus-1.csv';
import scan_2 from '../data/nessus-2.csv';
import scan_3 from '../data/nessus-3.csv';

import '../stylesheets/stacked-bar.scss';



export class VarRadiusDonut extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            axis: undefined,
            color: d3.scaleOrdinal(d3.schemeCategory20c),
            data: undefined,
            dataset: undefined,
            height: undefined,
            margin: undefined,
            piedDataset: undefined,
            maxRadius: undefined,
            minRadius: undefined,
            svg: undefined,
            tooltip: undefined,
            width: undefined,
            x: undefined,
            xAxis: undefined,
            y: undefined,
            yAxis: undefined,
        };
    }

    componentDidMount() {
        this.initializeChart();        
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataset) {
            this.rerenderChart(nextProps.dataset);
        }
    }
  
    componentWillUnmount() { }

    initializeChart() {
        let self = this;

        if (this.state.svg) {
            this.state.svg.selectAll('*').remove();
        }

        /* ===< SIZING >=== */
        this.state.margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        }
        this.state.color = d3.scaleOrdinal(d3.schemeCategory20c);
        // defines width and height of chart relative to margins:
        this.state.width = this.props.width - (this.state.margin.left + this.state.margin.right);
        this.state.height = this.props.height - (this.state.margin.top + this.state.margin.bottom);
        this.state.radius = Math.min(self.state.height, self.state.width) / 4;        
        // sizes the SVG element:
        this.state.svg = d3.select('svg[svg="varRadiusDonut"]')
            .attr('width', this.props.width)
            .attr('height', this.props.height);

        /* ===< RADIAL AXIS >=== */
        this.state.axis = this.state.svg
            .append('g')
            .attr('group', 'radialAxis')
            .attr('transform', 'translate(' + ((this.state.width / 2) + this.state.margin.left) + ',' + ((this.state.height / 2) + this.state.margin.top) + ')');

        /* ===< TOOLTIP >=== */
        this.state.tooltip = this.state.svg
            .append('g')
            .attr('group', 'tooltip')
            .style('display', 'none');
        this.state.tooltip
            .append('circle')
            .attr('r', this.state.radius - 4)
            .attr('cx', (this.state.width / 2) + this.state.margin.left) 
            .attr('cy', (this.state.height / 2) + this.state.margin.top)
            .style('fill', '#fff')
            .style('opacity', 0.5);
        this.state.tooltip
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(' + ((this.state.width / 2) + this.state.margin.left) + ',' + ((this.state.height / 2) + this.state.margin.top) + ')');
        /* ===< DATA >=== */
        // generates the data group:
        this.state.data = this.state.svg
            .append('g')
            .attr('group', 'data')
            .attr('transform', 'translate(' + ((this.state.width / 2) + this.state.margin.left) + ',' + ((this.state.height / 2) + this.state.margin.top) + ')');        
        
        this.state.arc = d3.arc()
            .startAngle( (d) => d.startAngle )
            .endAngle( (d) => d.endAngle )
            .innerRadius(self.state.radius)
            .outerRadius((d) => {
                // console.log(d.data.value.hosts.length / d.data.value.count);
                return self.state.radius + (self.state.radius * (d.data.value.hosts.length / d.data.value.count));
            });

        this.state.pie = d3.pie()
            .sort( (a, b) => b.value.count - a.value.count)
            .value( (d) => d.value.count );

        this.state.grid = d3.areaRadial()
            .radius(Math.min(self.state.height, self.state.width));
    }

    rerenderChart(dataset) {
        let self = this;
        
        /* ===< DATASET MANIPULATION >=== */
        if (!dataset) {
            return;
        } else {
            this.state.dataset = dataset;
            this.state.tooltip
                .style('display', 'block');
            this.state.tooltip
                .select('text')
                .text(self.state.dataset.count + ' Vulnerabilities')
        }

        self.state.piedDataset = self.state.pie(dataset.description);
        
        let joined = self.state.data
            .selectAll('[group="arc"]')
            .data(self.state.piedDataset, (d) => d.data.key );
        // update
        joined
            .select('path')
            /* NOTE: Must use select() instead of selectAll()
                Nesting selections has another subtle yet critical side-effect: it sets the parent node for each group.
                The parent node is a hidden property on selections that determines where to append entering elements.
                There is an important difference between select and selectAll:
                    - select preserves the existing grouping
                    - selectAll creates a new grouping.
                Calling select thus preserves the data, index and even the parent node of the original selection!
            */
            .attr('d', (d) => self.state.arc(d) );
        joined
            .select('text')
            .attr('transform', (d) => 'translate(' + self.state.arc.centroid(d) + ')' )
            .text( (d) => {
                let percentage = (d.value / self.state.dataset.count) * 100;
                return (percentage >= 5) ? d.value : '';
            } );
        // adds new keys:
        let added = joined
            .enter()
            .append('g')
                .attr('group', 'arc')
                .attr('key', (d) => d.data.key )
                .on('mouseenter', function(d) {
                    self.state.tooltip
                        .select('circle')
                        .style('fill', self.state.color(d.data.key) );
                    self.state.tooltip
                        .select('text')
                        .text(d.data.key);
                })
                .on('mouseleave', function(d) {
                    self.state.tooltip
                        .select('circle')
                        .style('fill', '#fff');
                    self.state.tooltip
                        .select('text')
                        .text(self.state.dataset.count + ' Vulnerabilities');
                });
        added
            .append('path')
            .attr('d', (d) => self.state.arc(d) )
            .style('stroke', 'white')
            .style('fill', (d) => self.state.color(d.data.key) )
            .style('opacity', 0.5);
        added
            .append('text')
            .attr('transform', (d) => 'translate(' + self.state.arc.centroid(d) + ')' )
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .text( (d) => {
                let percentage = (d.value / self.state.dataset.count) * 100;
                return (percentage >= 5) ? d.value : '';
            } );
        // removes excess keys:
        joined
            .exit()
            .remove();

        /* ===< EVENT CAPTURE >=== */
        console.log(this.state)
    }

    render() {
        return (
            <div name="varRadiusDonut">               
                <svg svg="varRadiusDonut" width={this.props.width} xmlns="http://www.w3.org/2000/svg" version="1.1">
                    <defs></defs>
                </svg>
            </div>
        );
    }
}