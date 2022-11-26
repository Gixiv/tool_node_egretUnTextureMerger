const images = require("images");
const fs = require('fs');
const path = require('path');

//获取命令行参数
var arguments = process.argv
var url = arguments[2]; //第0个索引包含节点可执行路径，第1个索引包含当前文件的路径，后续是参数
var filename = arguments[3];
if(!url||!filename){
    console.log('no input params')
    return;
}
console.log(url,filename)



let url_png = url+'/'+filename+ '.png';
let url_json = url+'/'+filename+ '.json';

// 创建
const absPath = path.resolve(__dirname, url);
if (!fs.existsSync(absPath)) {
    fs.mkdirSync(absPath);
}

let json_data = fs.readFileSync(url_json);
let json = JSON.parse(json_data);

let big_image = images(url_png);


var max_w = 0;
var max_h = 0;

for (let key1 in json.mc) {
    for (let key2 in json.mc[key1].frames) {
        var frame = json.mc[key1].frames[key2];
        var res = json.res[frame.res]
        if(max_w<(Math.abs(frame.x)+res.w)){
            max_w = Math.abs(frame.x)+res.w //无论中心位置定到中心，还是脚底等，统一处理为考虑极限位置，故采用 Math.abs(frame.x)
        }
        if(max_h<(Math.abs(frame.y)+res.h)){
            max_h = Math.abs(frame.y)+res.h
        }
    }
}

for (let key1 in json.mc) {
    for (let key2 in json.mc[key1].frames) {
        var frame = json.mc[key1].frames[key2];
        var res = json.res[frame.res]

        let single_png = images(big_image, res.x, res.y, res.w, res.h);
        //第1步准备大画布
        var image = images(max_w, max_h);
        //第2步将原图片中心对准大画布中心
        var x = (max_w-res.w)*0.5
        var y = (max_h-res.h)*0.5
        //第3步将偏移量加进去
        x += (res.w*0.5+frame.x);
        y += (res.h*0.5+frame.y);

        image.draw(single_png,x,y)
        //第4步保存
        image.save(url + '/' + frame.res + ".png", {
            quality: 100
        });
    }
}