const React = require('react');
const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

class ContentViewer extends React.Component {

    render() {
        let style = this.props.content.visible ? block : none;
        return (
            <div style={style} id="content-viewer">
                <img id="" alt="content" src={this.props.content.src} onClick={this.handleThumbClick}/>
            </div>
        )
    }

    constructor(props) {
        super(props);
        this.handleThumbClick = (event) => {
            this.props._onThumbClick(event);
        }
    }
}

export default ContentViewer;
