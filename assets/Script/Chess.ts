import { PieceColor } from "./Global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Chess extends cc.Component {

    @property(cc.SpriteFrame)
    colorSpriteFrame: cc.SpriteFrame[] = [];

    public myColor: PieceColor = PieceColor.None;

    public row: number = 0;

    public col: number = 0;


    initData(row: number, col: number, color: PieceColor): void {
        this.myColor = color;
        this.node.getComponent(cc.Sprite).spriteFrame = this.colorSpriteFrame[color];
        this.row = row;
        this.col = col;
    }

}
