import {Button, FormControl, FormGroup, Modal} from "react-bootstrap";
import {Editor} from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import toolbarConfig from "./ToolbarConfig";
import draftToHtml from "draftjs-to-html";
import {convertToRaw, EditorState} from "draft-js";

const React = require('react');
const Dropzone = require('react-dropzone');

class CreateDialog extends React.Component {

    state = {files: [], title: '', editorState: EditorState.createEmpty()};

    render() {
        return (
            <Modal className="create-dialog" show={this.props.visible} onHide={this.props.onClose} backdrop={false}
                   enforceFocus={false}>
                <Modal.Body>
                    <form>
                        <FormGroup controlId="formBasicText" validationState={this._getValidationState()}>
                            <FormControl
                                type="text"
                                value={this.state.title}
                                placeholder="Enter title"
                                onChange={this._handleTitleChange}/>
                            <FormControl.Feedback />
                            <div className="editor-wrapper">
                                <Editor
                                    editorState={this.state.editorState}
                                    onEditorStateChange={this._onEditorStateChange}
                                    toolbar={toolbarConfig}/>
                            </div>
                        </FormGroup>
                        <Dropzone className="dropzone" onDrop={this._onFileDrop} maxSize={10485760} accept="image/*">
                            <span
                                id="dropzone-text">Try dropping some files here, or click to select files to upload.</span>
                        </Dropzone>
                        {this.state.files.length > 0 ? <div>
                            Uploading {this.state.files.length} file(s)...
                            <div className="thumb-box">
                                {this.state.files.map((file) =>
                                    <div key={file.name} className="thumb-box item">
                                        <img className="thumb" alt="thumb" src={file.preview}/>
                                    </div>)}
                            </div>
                        </div> : <span/>}
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="success" bsSize="xsmall" onClick={this._handleSubmit}>Create</Button>
                    <Button bsSize="xsmall" onClick={this.props.onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    constructor(props) {
        super(props);
        this._handleSubmit = this._handleSubmit.bind(this);
        this._handleTitleChange = this._handleTitleChange.bind(this);
        this._handleTextChange = this._handleTextChange.bind(this);
        this._onFileDrop = this._onFileDrop.bind(this);
        this._onEditorStateChange = (editorState) => this.setState({editorState});
    }

    _getValidationState() {
        const length = this.state.title.length;
        if (this.state.editorState.length === 0) return 'error';
        if (length > 1) return 'success';
        else if (length > 50) return 'warning';
    }

    _handleTitleChange(e) {
        this.setState({title: e.target.value});
    }

    _handleTextChange(e) {
        this.setState({text: e.target.value});
    }

    _handleSubmit(e) {
        e.preventDefault();
        let form = new FormData();
        let title = this.state.title.substring(0, 49);
        let text = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
        if (this.props.threadId) {
            form.append('thread', this.props.threadId);
        } else {
            if (title === '') {
                window.alert('Title cannot be empty!');
                return;
            }
            if (this.state.files.length === 0) {
                window.alert('Thread needs an image!');
                return;
            }
            form.append('board', this.props.boardName);
        }
        if (text === '') {
            window.alert('Text cannot be empty!');
            return;
        }
        if (this.state.files.length > 4) {
            window.alert('4 files maximum');
            return;
        }
        this.state.files.map(file => form.append(file.name, file));
        form.append('title', title);
        form.append('text', text);
        this.props.onCreate(form);

        this.setState({
            files: [],
            editorState: EditorState.createEmpty(),
            title: ''
        });
        this.props.onClose();
    }

    _onFileDrop(acceptedFiles, rejectedFiles) {
        if (rejectedFiles.length > 0) {
            console.log(rejectedFiles);
        }
        this.setState({
            files: acceptedFiles.slice(0, 4)
        });
    }
}

export default CreateDialog;
