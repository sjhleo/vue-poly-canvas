import CanvasPoint from './canvasPoint';
export default class CanvasPoly {
    [index: number]: CanvasPoint;
    public ps: CanvasPoint[] = [];
    public size: number = this.ps.length;
    public d!: CanvasPoint;
    constructor(ps: CanvasPoint[]) {
        if (ps && ps.length > 1) {
            this.ps = ps;
            this.size = this.ps.length;
        }
    }
    public set(ps: CanvasPoint[]) {
        this.ps = ps;
    }
    public getSize() {
        return this.size;
    }
    public setPoint(p: CanvasPoint, i: number) {
        if (p && !isNaN(i)) {
            this.ps[i] = p;
        }
    }
    public setDanamic(p: CanvasPoint) {
        this.d = p;
    }
    public setStart(p: CanvasPoint) {
        if (this.ps && this.ps.length > 1) {
            this.ps[0] = p;
        } else {
            this.ps.push(p);
        }
    }
    public add(p: CanvasPoint) {
        if (!this.ps) {
            this.ps = [];
        }
        this.ps.push(p);
    }
    public pop() {
        if (this.ps) {
            return this.ps.pop();
        }
        return null;
    }
    public shift() {
        if (this.ps) {
            return this.ps.shift();
        }
        return null;
    }
    public get() {
        return this.ps;
    }
    public draw(cxt: CanvasRenderingContext2D) {
        cxt.beginPath();
        for (let i = 0; i < this.ps.length; i++) {
            if (i === 0) {
                cxt.moveTo(this.ps[i].getX(), this.ps[i].getY());
            } else {
                cxt.lineTo(this.ps[i].getX(), this.ps[i].getY());
            }
        }
        if (this.d) {
            cxt.lineTo(this.d.getX(), this.d.getY());
        }
        cxt.closePath();
        cxt.stroke();
    }
}
