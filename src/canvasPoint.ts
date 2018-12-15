
export default class CanvasPoint {
    public x: number;
    public y: number;
    constructor(x1: number, y1: number) {
        this.x = x1;
        this.y = y1;
    }
    public set(p: CanvasPoint) {
        this.x = p.x;
        this.y = p.y;
    }
    public setXY(x2: number, y2: number) {
        this.x = x2;
        this.y = y2;
    }
    public setX(x: number) {
        this.x = x;
    }
    public setY(y: number) {
        this.y = y;
    }
    public getX() {
        return this.x;
    }
    public getY() {
        return this.y;
    }
}
