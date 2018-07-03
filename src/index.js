import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// functional component
function Square(props) {
  return (
    <button 
      className={props.win ? "square-win square" : "square"} 
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square key={i}
        win={this.props.winningLine && this.props.winningLine.includes(i)}
        value={this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const size = [0, 1, 2];

    return (
      <div>
        {size.map((row) => {
          return (
            <div key={row} className="board-row">
              {size.map((col) => this.renderSquare(row * 3 + col))}
            </div>
          );
        })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      location: [],
      stepNumber: 0,
      xIsNext: true,
      ascendingMoves: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const location = this.state.location.slice(0, this.state.stepNumber);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      location: location.concat([i]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleOrder() {
    this.setState({
      ascendingMoves: !this.state.ascendingMoves,
    });
  }

  render() {
    const history = this.state.history;
    const location = this.state.location;
    const current = history[this.state.stepNumber];
    const winResult = calculateWinner(current.squares);
    const winner = winResult.winner;

    const moves = history.map((step, move) => {
      const desc = move ? 
        'Go to move #' + move + ' ' + getLocation(location[move - 1]):
        'Go to game start';
      return (
        <li key={move}>
          <button 
            className={this.state.stepNumber === move ? 'selected' : ''} 
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      )
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            winningLine={winResult.winningLine}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{ status }</div>
          <button onClick={() => this.toggleOrder()}>
            {this.state.ascendingMoves ? 'Ascending Order' : 'Dscending Order'}
          </button>
          <ol>{ this.state.ascendingMoves ? moves : moves.reverse() }</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function getLocation(index) {
  const col = index % 3 + 1;
  const row = parseInt(index / 3, 10) + 1;
  return '(' + col + ', ' + row + ')';
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
      return { winner: squares[a], winningLine: lines[i] };
    }
  }
  return { winner: null, winningLine: null };
}
