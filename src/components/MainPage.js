import {collection} from '../client/api';

const React = require('react');
const ListGroup = require('react-bootstrap/lib/ListGroup');
const ListGroupItem = require('react-bootstrap/lib/ListGroupItem');

class MainPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {boards: []};
    }

    loadFromServer() {
        collection('boards').then(data => {
                this.setState({
                    boards: data._embedded['boards']
                })
            });
    }

    componentDidMount() {
        this.loadFromServer();
    }

    render() {
        let boards = this.state.boards.map(board =>
            <ListGroupItem header={'/' + board.id} key={board._links.self.href} href={board.id}>
              {board.title}
            </ListGroupItem>
        );
        return (
            <div className="panel">
                <div>
                    <h4>Board List</h4>
                </div>
                <ListGroup>
                    {boards}
                </ListGroup>

            </div>
        )
    }
}

export default MainPage;
