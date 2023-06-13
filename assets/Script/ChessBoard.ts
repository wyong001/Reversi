import Chess from "./Chess";
import Global, { PieceColor } from "./Global";
import Board from "./Board";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChessBoard extends cc.Component {

    @property(cc.Prefab)
    piecePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    whiteItem: cc.Prefab = null;

    @property(cc.Prefab)
    blackItem: cc.Prefab = null;

    @property(cc.Node)
    board: cc.Node = null;

    @property(cc.Node)
    left: cc.Node = null;

    @property(cc.Node)
    right: cc.Node = null;

    @property(cc.Node)
    startNode: cc.Node = null;

    @property(cc.Node)
    endNode: cc.Node = null;

    @property(cc.Label)
    mytime: cc.Label = null;

    @property(cc.Label)
    aitime: cc.Label = null;

    @property(cc.Label)
    myChess: cc.Label = null;

    @property(cc.Label)
    aiChess: cc.Label = null;

    @property(cc.Label)
    mytime2: cc.Label = null;

    @property(cc.Label)
    aitime2: cc.Label = null;

    @property(cc.Label)
    myChess2: cc.Label = null;

    @property(cc.Label)
    aiChess2: cc.Label = null;

    @property(cc.Label)
    message: cc.Label = null;

    private boardData: PieceColor[][] = [];

    private buttons: Board[][] = [];

    onLoad() {
        // this.initializeBoard();
        // this.updateButtons();
        this.startNode.active = true;
    }

    onStartGame() {
        this.startNode.active = false;
        this.initData();
        this.initializeBoard();
        this.updateButtons();
        this.timingBegins();
        this.updateChessNum();
    }

    goBack() {
        this.unscheduleAllCallbacks();
        this.startNode.active = true;
        this.initData();
    }

    initData() {
        Global.clearData();
        this.clearBoard();
        this.endNode.active = false;
        this.mytime.string = Global.formatTime(Global.MyTime);
        this.aitime.string = Global.formatTime(Global.AITime);
        this.left.removeAllChildren();
        this.right.removeAllChildren();
    }

    clearBoard() {
        this.boardData = [];
        this.buttons = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.board.children[row].children[col].children[0].opacity = 0;
                if (this.board.children[row].children[col].children[1]) {
                    this.board.children[row].children[col].children[1].removeFromParent();
                }
            }
        }
    }

    timingBegins() {
        let callb = () => {
            if (Global.currTurn == PieceColor.Black) {
                Global.MyTime += 1;
                this.mytime.string = Global.formatTime(Global.MyTime);
            } else if (Global.currTurn == PieceColor.White) {
                Global.AITime += 1;
                this.aitime.string = Global.formatTime(Global.AITime);
            }
        }
        this.schedule(callb, 1)
    }

    private initializeBoard() {
        for (let row = 0; row < 8; row++) {
            this.boardData[row] = [];
            this.buttons[row] = [];
            for (let col = 0; col < 8; col++) {
                this.boardData[row][col] = PieceColor.None;
                this.buttons[row][col] = this.board.children[row].children[col].getComponent(Board);
                this.buttons[row][col].initData(row, col, PieceColor.None, this);
            }
        }
        this.setPiece(3, 3, PieceColor.White);
        this.setPiece(4, 4, PieceColor.White);
        this.setPiece(3, 4, PieceColor.Black);
        this.setPiece(4, 3, PieceColor.Black);

        for (let i = 0; i < 62; i++) {
            let item1 = cc.instantiate(this.whiteItem);
            item1.setParent(this.left);

            let item2 = cc.instantiate(this.blackItem);
            item2.setParent(this.right)
        }
    }

    public handlePieceClick(row: number, col: number) {
        if (Global.gameOver) {
            return;
        }
        let color = Global.currTurn;
        if (this.boardData[row][col] === PieceColor.None) {
            let flipped = this.getFlippedPieces(row, col, color);
            if (flipped.length > 0) {
                this.setPiece(row, col, color);
                flipped.forEach((pos) => {
                    this.setPiece(pos.row, pos.col, color);
                });
                this.changeTurn();
                if (!this.hasValidMoves()) {
                    this.changeTurn();
                    if (!this.hasValidMoves()) {
                        Global.gameOver = true;
                        this.showGameOver();
                        return;
                    }
                }
            }
        }
    }

    updateChessNum() {
        let blackCount = 0;
        let whiteCount = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.boardData[row][col] === PieceColor.Black) {
                    blackCount++;
                } else if (this.boardData[row][col] === PieceColor.White) {
                    whiteCount++;
                }
            }
        }
        Global.blackChess = blackCount;
        Global.whiteChess = whiteCount;
        this.myChess.string = "x" + Global.blackChess;
        this.aiChess.string = "x" + Global.whiteChess;
    }

    changeTurn() {

        Global.currTurn = 3 - Global.currTurn;
        this.updateButtons();
        this.updateChessNum();
        if (Global.currTurn == PieceColor.White && this.hasValidMoves()) {
            let time = Global.getRandomInt(3, 6);
            let aiPlay = () => {
                const [x, y] = this.getGreedyAIStep();
                this.handlePieceClick(x, y);
            }
            this.scheduleOnce(aiPlay, time);
        }
    }

    private getValidMoves(): Array<[number, number]> {
        const moves: Array<[number, number]> = [];
        const SIZE = 8;

        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (this.boardData[i][j] !== PieceColor.None) {
                    continue;
                }
                for (let k = -1; k <= 1; k++) {
                    for (let l = -1; l <= 1; l++) {
                        if (k === 0 && l === 0) {
                            continue;
                        }
                        let x = i + k;
                        let y = j + l;
                        let count = 0;
                        while (x >= 0 && x < SIZE && y >= 0 && y < SIZE &&
                            this.boardData[x][y] !== Global.currTurn && this.boardData[x][y] !== PieceColor.None) {
                            x += k;
                            y += l;
                            count++;
                        }
                        if (x >= 0 && x < SIZE && y >= 0 && y < SIZE &&
                            this.boardData[x][y] === Global.currTurn && count > 0) {
                            moves.push([i, j]);

                            break;
                        }
                    }
                }
            }
        }
        return moves;
    }

    private updateButtons() {
        if (Global.currTurn != PieceColor.Black) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    this.buttons[i][j].showCanFlipCount(0);
                }
            }
            return;
        }
        const moves = this.getValidMoves();

        for (let i = 0; i < moves.length; i++) {
            const [x, y] = moves[i];
            const button = this.buttons[x][y];
            const count = this.getFlippedPieces(x, y, Global.currTurn);
            button.showCanFlipCount(count.length);
        }
    }

    private setPiece(row: number, col: number, color: PieceColor) {
        let isEat = false;
        if (this.boardData[row][col] != PieceColor.None) {
            isEat = true
            let eat = this.board.children[row].children[col].children[1];
            cc.tween(eat)
                .to(0.3, { scaleX: 0 })
                .call(() => {
                    eat.removeFromParent();
                })
                .start();
            if (this.boardData[row][col] == PieceColor.White) {
                let item1 = cc.instantiate(this.whiteItem);
                item1.setParent(this.left);

            } else if (this.boardData[row][col] == PieceColor.Black) {
                let item2 = cc.instantiate(this.blackItem);
                item2.setParent(this.right)
            }
        }

        this.boardData[row][col] = color;
        this.buttons[row][col].initData(row, col, color, this);

        let tempChess = cc.instantiate(this.piecePrefab);
        tempChess.getComponent(Chess).initData(row, col, color);
        if (isEat) {
            tempChess.scaleX = 0;
            tempChess.setParent(this.board.children[row].children[col]);
            cc.tween(tempChess)
                .delay(0.2)
                .to(0.3, { scaleX: 1 })
                .start();
        } else {
            tempChess.setParent(this.board.children[row].children[col]);
        }

        if (color == PieceColor.White) {
            this.left.removeChild(this.left.children[0]);

        } else if (color == PieceColor.Black) {
            this.right.removeChild(this.right.children[0]);
        }

    }

    private getFlippedPieces(row: number, col: number, color: PieceColor) {
        let result = [];
        let directions = [cc.v2(-1, -1), cc.v2(-1, 0), cc.v2(-1, 1), cc.v2(0, -1), cc.v2(0, 1), cc.v2(1, -1), cc.v2(1, 0), cc.v2(1, 1)];
        for (let dir of directions) {
            let flipped: { row: number, col: number }[] = [];
            let r = row + dir.y;
            let c = col + dir.x;
            while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.boardData[r][c] === 3 - color) {
                flipped.push({ row: r, col: c });
                r += dir.y;
                c += dir.x;
            }
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && this.boardData[r][c] === color) {
                result.push(...flipped);
            }
        }
        return result;
    }

    private hasValidMoves() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.boardData[row][col] === PieceColor.None && this.getFlippedPieces(row, col, Global.currTurn).length > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    private showGameOver() {
        Global.gameOver = true;

        let blackCount = 0;
        let whiteCount = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.boardData[row][col] === PieceColor.Black) {
                    blackCount++;
                } else if (this.boardData[row][col] === PieceColor.White) {
                    whiteCount++;
                }
            }
        }
        let message = '';
        if (blackCount > whiteCount) {
            message = 'BLACK WINS';
        } else if (whiteCount > blackCount) {
            message = 'WHITE WINS';
        } else {
            message = 'DRAW';
        }

        this.myChess2.string = 'x' + blackCount;
        this.aiChess2.string = 'x' + whiteCount;

        this.mytime2.string = Global.formatTime(Global.MyTime);
        this.aitime2.string = Global.formatTime(Global.AITime);
        this.message.string = message;

        this.endNode.active = true;
        cc.log(message, blackCount, whiteCount);

        this.unscheduleAllCallbacks();
    }

    getGreedyAIStep(): number[] {
        let bestStep: number[] = [];
        let maxCount = -1;

        const moves = this.getValidMoves();

        for (let i = 0; i < moves.length; i++) {
            const [x, y] = moves[i];
            const count = this.getFlippedPieces(x, y, Global.currTurn);
            if (count.length > maxCount) {
                bestStep = [x, y];
                maxCount = count.length;
            }
        }

        return bestStep;
    }
}
