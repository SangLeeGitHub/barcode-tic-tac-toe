import React, {Component} from 'react';
import socketIOClient from "socket.io-client";
import './Game.css';
import JsBarcode from "jsbarcode";

function Square(props) {
    let style = (props.value === "O" || props.value === "X") ? {display: "none"} : {height: "200vh", width: "200vw"};

    return (
        <button className="square" onClick={props.onClick}>
            <svg id={"barcode" + props.idx} style={style}></svg>
            {props.value}
        </button>
    );
}

class Board extends Component {

    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            xIsNext: true,
            endpoint: "http://netrol.com",
            sIndex: 0,
        }
    }

    handleClick(i) {
        console.log("handleClick:", i);
        console.log("sIndex:", this.state.sIndex);

        const squares = this.state.squares.slice();

        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            squares: squares,
            xIsNext: !this.state.xIsNext,
        });
    }

    renderSquare(i) {
        return (
            <Square
                idx={i}
                value={this.state.squares[i]}
                onClick={()=>this.handleClick(i)}
            />
        )
    }

    componentDidMount() {
        const {endpoint} = this.state;
        const socket = socketIOClient(endpoint, {'path': '/ttta/socket.io'});
        socket.on("FromAPI", data => {
            this.handleClick(data);
        });
        socket.on("sIndex", data => {
            this.setState({sIndex: data});

            for (let j = 0; j < 9; j++)
                JsBarcode("#barcode" + j, this.state.sIndex + ":" + j, {width: 5, height: 170, fontSize: 40});
        });
    }

    render() {
        const winner = calculateWinner(this.state.squares);
        let status;

        if (winner) {
            status = "Winner: " + winner;
        }
        else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div>
                <div className="status" style={{display: 'flex', justifyContent: 'center', fontSize: 28}}>{status}</div>
                <div></div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends Component {

    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
                <div className="game-info">
                    <div>{/* status */}</div>
                    <ol>{/* TODO */}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {

    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

export default Game;
