export enum PieceColor {
    None,
    Black,
    White,
}

export default class Global {

    public static currTurn: PieceColor = PieceColor.Black;
    public static blackChess: number = 0;
    public static whiteChess: number = 0;
    public static gameOver: boolean = false;

    public static MyTime: number = 0;
    public static AITime: number = 0;

    public static clearData() {
        this.currTurn = PieceColor.Black;
        this.blackChess = 0;
        this.whiteChess = 0;
        this.gameOver = false;
        this.AITime = 0;
        this.MyTime = 0;
    }

    static getRandomInt(min: number = 0, max: number = 1): number {
        return Math.floor(Math.random() * (max - min) + min);
    }

    static formatTime(seconds: number): string {
        let minutes = Math.floor(seconds / 60);
        let leftSeconds = seconds % 60;
        return `${minutes < 10 ? "0" : ""}${minutes}:${leftSeconds < 10 ? "0" : ""}${leftSeconds}`;
    }

}
