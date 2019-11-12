import * as React from 'react';
import Tag from '../../../index';
import templateJson from '../../../demo/index.js';

class App extends React.Component {
    constructor(prop) {
        super(prop);
        this.state = {
            module: ''
        }
    }
    getBuileModule(json) {
        const moduleProps = {};
        console.log(88888888, json.props)
        const childrenHtml = (<div dangerouslySetInnerHTML={{__html: json.children}} />)
        return React.createElement(Tag, json.props, childrenHtml);
    }
    render() {
        return (<div>{this.getBuileModule(templateJson)}</div>)
    }
}

export default App;