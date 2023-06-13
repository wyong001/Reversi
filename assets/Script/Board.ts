import ChessBoard from "./ChessBoard";
import Global, { PieceColor } from "./Global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Board extends cc.Component {

    public myColor: PieceColor = PieceColor.None;

    public row: number = 0;

    public col: number = 0;

    private gameMain: ChessBoard = null;

    private canClick: boolean = false;

    protected start(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onClick, this);
    }

    initData(row: number, col: number, color: PieceColor, gameMain: ChessBoard): void {
        this.myColor = color;
        this.gameMain = gameMain;
        this.row = row;
        this.col = col;
        this.canClick = false;
    }

    showCanFlipCount(count: number): void {
        if (count > 0) {
            this.node.children[0].children[0].getComponent(cc.Label).string = count.toString();
            this.node.children[0].opacity = 255;
            this.canClick = true;
        } else {
            this.node.children[0].opacity = 0;
            this.canClick = false;
        }
    }

    onClick() {
        if (Global.currTurn != PieceColor.Black || Global.gameOver) {
            return;
        }
        if (this.myColor != PieceColor.None) {
            return;
        }

        if (this.canClick) {
            this.gameMain.handlePieceClick(this.row, this.col);
        }
    }

}
