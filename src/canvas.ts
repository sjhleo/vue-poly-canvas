import { Component, Prop, Vue } from "vue-property-decorator";
import "./canvas.less";
import CanvasPoint from "./canvasPoint";
import CanvasPoly from "./canvasPoly";
@Component({
    template: require("./canvas.html"),
    components: {}
})
export default class Canvas extends Vue {
    @Prop({ default: "" })
    public url!: string;
    @Prop({ default: 0 })
    public index!: number;
    // canvas宽高
    public width!: number;
    public height!: number;
    // 图片原始宽高
    public originalWidth !: number;
    public originalHeight !: number;
    // 区域数据数组
    public areas: CanvasPoly[] = [];
    // 绘图容器
    public cbtCanvas!: HTMLCanvasElement;
    // 绘图对象
    public cxt!: CanvasRenderingContext2D;
    // 背景图片绘制配置
    public bgPictureConfig = {
        // 背景图片地址或路径
        pic: "",
        // 是否作为永久背景图，每次清除时会进行重绘
        repaint: true
    };
    // 绘图基础配置
    public paintConfig = {
        lineWidth: 1, // 线条宽度，默认1
        strokeStyle: "red", // 画笔颜色，默认红色
        fillStyle: "red", // 填充色
        lineJoin: "round", // 线条交角样式，默认圆角
        lineCap: "round" // 线条结束样式，默认圆角
    };
    // 鼠标图形
    public cursors = ["crosshair", "pointer"];
    // 操作控制变量组
    public ctrlConfig: {
        isPainting: boolean;
        startPoint: CanvasPoint;
        cuGraph: CanvasPoly;
        cuPoint: CanvasPoint[];
        cuAngle: number;
        vertex: number[];
    } = {
        isPainting: false, // 是否开始绘制
        startPoint: new CanvasPoint(0, 0), // 起始点
        cuGraph: new CanvasPoly([]), // 当前绘制的图像
        cuPoint: [], // 当前临时坐标点，确定一个坐标点后重新构建
        cuAngle: 0, // 当前箭头角度
        vertex: [] // 坐标点
    };
    // 公共方法
    public getDom(id: string) {
        return document.getElementById(id);
    }
    public isNull(s: any) {
        return (
            s === undefined ||
            typeof s === "undefined" ||
            s === null ||
            s === "null" ||
            s === "" ||
            (s.length < 1 || s.size < 1 || (s.x === 0 && s.y === 0))
        );
    }
    // 屏蔽浏览器默认鼠标事件
    public hideDefRM() {
        document.oncontextmenu = () => false;
    }
    // 加载并绘制图片(src:图片路径或地址),默认重绘背景图
    public loadPicture(src: string, repaint?: boolean) {
        this.switchCorser(true);
        if (repaint) {
            this.bgPictureConfig.repaint = repaint;
        }
        if (
            this.isNull(this.bgPictureConfig.repaint) ||
            this.bgPictureConfig.repaint
        ) {
            this.bgPictureConfig.pic = src;
        }
        this.repaint();
    }

    // 重新载入绘制样式
    public resetStyle() {
        this.cxt.strokeStyle = this.paintConfig.strokeStyle;
        this.cxt.lineWidth = this.paintConfig.lineWidth;
        this.cxt.lineJoin = this.paintConfig.lineJoin as CanvasLineJoin;
        this.cxt.lineCap = this.paintConfig.lineCap as CanvasLineCap;
        this.cxt.fillStyle = this.paintConfig.fillStyle;
    }
    // 切换鼠标样式
    public switchCorser(b: boolean) {
        this.cbtCanvas.style.cursor = (this.isNull(b)
        ? this.isDrawing()
        : b)
            ? this.cursors[0]
            : this.cursors[1];
    }
    // 获取当前坐标点*/
    public getCuPoint(i: number) {
        return this.ctrlConfig.cuPoint[i];
    }
    // 设置当前坐标点*/
    public setCuPoint(p: CanvasPoint, i: number) {
        return (this.ctrlConfig.cuPoint[i] = p);
    }
    // *设置当前临时坐标点值*/
    public setCuPointXY(x: number, y: number, i: number) {
        if (this.isNull(this.ctrlConfig.cuPoint)) {
            let arr = new Array();
            arr[i] = new CanvasPoint(x, y);
            this.ctrlConfig.cuPoint = arr;
        } else if (this.isNull(this.ctrlConfig.cuPoint[i])) {
            this.setCuPoint(new CanvasPoint(x, y), i);
        } else {
            this.ctrlConfig.cuPoint[i].setXY(x, y);
        }
        return this.getCuPoint(i);
    }

    // 是否正在绘制*/
    public isDrawing() {
        return this.ctrlConfig.isPainting;
    }
    // 开始绘制状态*/
    public beginDrawing() {
        this.ctrlConfig.isPainting = true;
    }
    // 结束绘制状态*/
    public stopDrawing() {
        // this.ctrlConfig.isPainting = false;
        // this.ctrlConfig.cuGraph = new CanvasPoly([]);
        this.ctrlConfig = {
            isPainting: false, // 是否开始绘制
            startPoint: new CanvasPoint(0, 0), // 起始点
            cuGraph: new CanvasPoly([]), // 当前绘制的图像
            cuPoint: [], // 当前临时坐标点，确定一个坐标点后重新构建
            cuAngle: 0, // 当前箭头角度
            vertex: [] // 坐标点
        };
    }
    // 是否有开始坐标点*/
    public hasStartPoint() {
        return !this.isNull(this.ctrlConfig.startPoint);
    }
    // 设置当前绘制的图形*/
    public setCuGraph(g: CanvasPoly) {
        this.ctrlConfig.cuGraph = g;
    }
    // *获取当前绘制的图形*/
    public getCuGraph() {
        return this.ctrlConfig.cuGraph;
    }
    // **设置开始坐标点（线条的起始点，三角形的顶点，圆形的圆心，四边形的左上角或右下角，多边形的起始点）*/
    public setStartPoint(p: CanvasPoint) {
        this.ctrlConfig.startPoint = p;
    }
    // *获取开始坐标点*/
    public getStartPoint() {
        return this.ctrlConfig.startPoint;
    }

    // *清空全部*/
    public clearAll() {
        this.cxt.clearRect(0, 0, this.cbtCanvas.width, this.cbtCanvas.height);
    }
    /*/ 重绘*/
    public repaint() {
        let img = new Image();
        img.src = this.bgPictureConfig.pic;
        let that = this;
        img.onload = () => {
            that.originalWidth = img.width;
            that.originalHeight = img.height;
            that.cxt.drawImage(img, 0, 0, this.width, this.height);
            if (that.bgPictureConfig.repaint) {
                // 原始图片上的坐标在绘图时要根据图片的缩放比例进行描绘
                // loadPicture(bgPictureConfig.pic);
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < that.areas.length; i++) {
                    that.cxt.beginPath();
                    let p = that.areas[i].get()[0];
                    let x = p.x * that.widthZoom;
                    let y = p.y * that.heightZoom;
                    that.cxt.moveTo(x, y);
                    for (let j = 1; j < that.areas[i].ps.length; j++) {
                        that.cxt.lineTo(
                            that.areas[i].get()[j].x * that.widthZoom,
                            that.areas[i].get()[j].y * that.heightZoom
                        );
                    }
                    that.cxt.lineTo(x, y);
                    that.cxt.stroke();
                }
                that.getCuGraph().draw(that.cxt);
            }
        };
    }
    // 鼠标按键点击（首次点击确定开始坐标点，拖动鼠标不断进行图形重绘）
    // tslint:disable-next-line:no-any
    public mouseDown(e: any) {
        let btnNum = e.button;
        if (btnNum === 0) {
            // 设置起始点
            let p = new CanvasPoint(e.offsetX, e.offsetY);
            if (this.isDrawing()) {
                this.getCuGraph().add(p); // 添加到
            } else {
                // 第一次确定开始坐标
                this.beginDrawing(); // 开始绘制
                this.setStartPoint(p);
                // tslint:disable-next-line:no-shadowed-variable
                let poly = new CanvasPoly([]);
                poly.add(p);
                this.setCuGraph(poly); // 设置当前绘制图形
            }
        } else if (btnNum === 2) {
            // console.log("右键由于结束多边形绘制");
            // this.areas.push(this.ctrlConfig.cuGraph);
            this.confirm(this.ctrlConfig.cuGraph);
            if (this.isDrawing()) {
                this.repaint();
                // this.getCuGraph().draw(this.cxt);
                this.stopDrawing(); // 结束绘制
            }
        }
        this.hideDefRM(); // 屏蔽浏览器默认事件
    }
    // 鼠标移动（拖动，根据鼠标移动的位置不断重绘图形）
    // tslint:disable-next-line:no-any
    public mouseMove(e: any) {
        if (this.isDrawing() && this.hasStartPoint()) {
            // 检查是否开始绘制，检查是否有开始坐标点
            let p = this.setCuPointXY(e.offsetX, e.offsetY, 0); // 设置共享的临时坐标点，用于防止重复创建对象
            let poly = this.getCuGraph();
            poly.setDanamic(p);
            // poly.draw(this.cxt);
            this.repaint(); // 重绘
        }
    }
    // 鼠标按键松开
    // tslint:disable-next-line:no-any
    public mouseUp(e: any) {
        if (this.isDrawing()) {
            // console.log("松开鼠标按键:"+e.offsetX+","+e.offsetY);
            this.repaint();
        }
    }

    // 鼠标移出
    // tslint:disable-next-line:no-any
    public mouseOut(e: any) {
        // console.log("鼠标移出绘制区域" + e.offsetX + "," + e.offsetY);
        if (this.isDrawing()) {
            // console.log("停止绘制");
            this.repaint();
            this.stopDrawing(); // 停止绘制
        }
    }
    public clear() {
        this.stopDrawing(); // 停止绘制
        this.repaint();
    }
    public init(params: {id: string}) {
        this.cbtCanvas = this.getDom(params.id) as HTMLCanvasElement;
        let p = document.getElementById("vue-canvas" + this.index) as HTMLElement;
        let width = p.offsetWidth;
        let height = p.offsetHeight;
        this.cbtCanvas.width =  width;
        this.cbtCanvas.height = height;
        this.width = width;
        this.height = height;
        // 浏览器是否支持Canvas
        if (this.cbtCanvas.getContext) {
            // *绘图对象*/
            this.cxt = this.cbtCanvas.getContext(
                "2d"
            ) as CanvasRenderingContext2D;
            this.cbtCanvas.onmousedown = this.mouseDown;
            this.cbtCanvas.onmouseup = this.mouseUp;
            this.cbtCanvas.onmousemove = this.mouseMove;
            this.cbtCanvas.onmouseout = this.mouseOut;
            this.resetStyle(); // 载入样式
            return true;
        } else {
            console.log("不支持Canvas");
            return false;
        }
    }
    public setAreas(areas: CanvasPoint[][]) {
        this.areas = [];
        areas.forEach((value: CanvasPoint[]) => {
            let poly: CanvasPoly = new CanvasPoly(value);
            this.areas.push(poly);
        });
        this.repaint();
    }
    public deleteArea() {
        if (this.areas.length > 0) {
            this.areas.pop();
            this.repaint();
            this.$emit("confirm", this.areas.map(v => v.ps));
        }
    }
    public confirm(area: CanvasPoly) {
        // 在图上绘制的区域 坐标要变成原始图像上的坐标
        if (area.ps.length > 2) {
            area.ps = area.ps.map((v: CanvasPoint) => {
                // 小数点四舍五入保留两位 这里不用toFixed是因为toFixed直接截取 而且返回的是string类型
                v.x = Math.round((v.x / this.widthZoom) * 100) / 100;
                v.y = Math.round((v.y / this.heightZoom) * 100) / 100;
                return v;
            });
            this.areas.push(area);
        }
        this.$emit("confirm", this.areas.map(v => v.ps));
    }
    public get widthZoom() {
        return this.width / this.originalWidth;
    }
    public get heightZoom() {
        return this.height / this.originalHeight;
    }
    public mounted() {
        this.init({ id: "calibrationCanvas" + this.index });
        this.loadPicture(
            // "http://192.168.101.65:8097/files/attachment/images/20181112182002_67549964.images",
            this.url,
            // "http://120.202.26.100:8888/t_pic/(12997).jpg",
            true
        );
    }
}
