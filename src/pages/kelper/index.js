import React, {Component} from 'react';
import * as wasm from "hello-wasm-pack";
import { start, GlCanvas, ViewType } from "kepler";
import { Spin} from 'antd';
import {get, post} from '@/utils/request'
import io from 'socket.io-client';
import axios from 'axios'
import 'antd/es/spin/style/css';
const socket = io();
import {connect} from 'react-redux';
@connect((store) => {
    return {app:store.app};
})
class kp extends Component {
    static displayName = "Kelper";
    constructor(props, context) {
        super(props, context);
        this.glcanvas = null;
    }
    state={
        loading:false,
        slider_window:"18500",
        slider_level:"12000",
        pan:"transverse",
        slider_scale:"1",
        slider_pan_x:"0",
        slider_pan_y:"0",
        slider_slice:"0"
    }
    fnChange(e){
        const {name,value} = e.target;
        const obj = {};
        obj[name] = value;

        //var glcanvas = this.getGlCanvas();
        console.log(value);
        switch (name){
            case 'slider_window':
                this.glcanvas.set_window(value);
                break;
            case 'slider_level':
                this.glcanvas.set_level(value);
                break;
            case 'pan'://类型
                break;
            case 'slider_scale':
                this.glcanvas[`set_scale_${this.state.pan}`](value)
                //glcanvas.set_scale_transverse(scale);
                console.log(value);
                break;
            case 'slider_pan_x':
                this.glcanvas[`set_pan_${this.state.pan}_x`](value);
                break;
            case 'slider_pan_y':
                this.glcanvas[`set_pan_${this.state.pan}_y`](value);
                break;
            case 'slider_slice':
                this.glcanvas[`set_slice_${this.state.pan}`](value);
                break;
        }

        this.glcanvas.render();
        this.setState(obj);
    }
    concatArrayBuffer(arr){
        var arr1 = [];
        arr.map((arrayBuffer,index)=>{
            //console.log(111,arrayBuffer);
            //console.log(222,Buffer.from(arrayBuffer));
            arr1.push(Buffer.from(arrayBuffer));
            return arrayBuffer
        });
        //console.log(arr1);
        return Buffer.concat(arr1)
    }
    base64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    async getFile(){
        var _this = this;
        //let response = await fetch('/static/a.raw');
        var arr = [];
        var i = 0;
        console.log(new Date())
        //this.props.dispatch({type:'setData',payload:{key:'loading',value:true}});
        this.setState({loading:true})
        axios.get('/curie-api/patient/rawFile',{type:"arrayBuffer"}).then(res=>{
            console.log(111,res);
        });

        socket.on('chunk', (msg)=>{
            arr.push(this.base64ToUint8Array(msg));
            i++;
            console.log('我收到管理员的chunk了:'+i);
        });

        socket.on('chunk end',(msg)=>{
            console.log('我收到管理员的chunk end 了:',msg);
            if(arr.length == msg){
                //let dataBuffer = await response.arrayBuffer();
                var dataBuffer = (this.concatArrayBuffer(arr)).buffer;//这里是arrayBuffer格式
                console.log('dataBuffer',dataBuffer);
                console.log(new Date());
                var array_view = new Uint16Array(dataBuffer);
                console.log("start of transforming...");
                array_view.forEach((element, index, array) => array[index] += 1000);
                console.log("end of transforming...");
                console.log("JS - Read file complished.")
                // glcanvas.load_volume_from_array_buffer(file_reader.result, 1024, 1024, 360);
                // glcanvas.load_volume_from_array_buffer(file_reader.result, 512, 512, 133);
                //this.glcanvas.load_primary(dataBuffer, 512, 512, 133);
                this.glcanvas.load_primary(dataBuffer, 1024, 1024, 3);
                // glcanvas.set_window(12000);
                // glcanvas.set_level(15000);
                // glcanvas.setup_geometry();
                this.glcanvas.render();
                this.setState({loading:false})
                //this.props.dispatch({type:'setData',payload:{key:'loading',value:false}});
            }
        });

    }
    componentDidMount(){
        console.log('mounted');
        let canvas = document.getElementById("mycanvas");
        let w = canvas.clientWidth;
        let h = canvas.clientHeight;
        /*this.glcanvas = GlCanvas.new("mycanvas", w, h, 12000, 15000);
         this.glcanvas.load_shaders();*/

        this.glcanvas = GlCanvas.new("mycanvas", w, h, 12000, 15000);
        this.glcanvas.set_window(12000);
        this.glcanvas.set_level(15000);
        this.glcanvas.setup_geometry();
        this.glcanvas.render();
        //console.log(ViewType.SAGITTAL);

        console.log(ViewType.SAGITTAL || 'ssss' );
        console.log('window:',this.glcanvas.window);
        this.getFile();
    }
    render() {
        const {slider_window,slider_level,pan,slider_scale,slider_pan_x,slider_pan_y,slider_slice} = this.state;
        return (
            <Spin spinning={this.state.loading} tip="文件读取中..." className="noTextShadow">
            <div className="kelper page">
                {/* <input type="file" id="read_image" onChange={this.onGetFile.bind(this)} multiple="multiple" /><br /><br />*/}
                <canvas id="mycanvas" width="750" height="600"></canvas>
                {/*slider_window*/}
                <div className="slide">
                    <input type="range" min="1" max="65535" name="slider_window" value={slider_window} onChange={this.fnChange.bind(this)} className="slider" id="slider_window"/>
                    <span>Window</span>
                </div>
                {/*slider_level*/}
                <div className="slide">
                    <input type="range" min="0" max="65535" name="slider_level" value={slider_level}  onChange={this.fnChange.bind(this)} className="slider" id="slider_level"/>
                    <span>Level</span>
                </div>
                <form>
                    {/*pan*/}
                    <input type="radio" id="radio_transverse" name="pan" value="transverse" checked={pan=='transverse'} onChange={this.fnChange.bind(this)} />
                    <label htmlFor="transverse">Transverse</label>
                    <input type="radio" id="radio_sagittal" name="pan" value="sagittal" checked={pan=='sagittal'} onChange={this.fnChange.bind(this)}/>
                    <label htmlFor="transverse">Sagittal</label>
                    <input type="radio" id="radio_coronal" name="pan" value="coronal" checked={pan=='coronal'} onChange={this.fnChange.bind(this)}/>
                    <label htmlFor="transverse">Coronal</label>
                </form>
                {/*scale*/}
                <div className="slide">
                    <input type="range" min="1" max="10" name="slider_scale" value={slider_scale} onChange={this.fnChange.bind(this)} step="0.1" className="slider" id="slider_scale"/>
                    <span>Zoom in/out</span>
                </div>
                {/*slider_pan_x*/}
                <div className="slide">
                    <input type="range" min="-1" max="1" name="slider_pan_x" value={slider_pan_x} onChange={this.fnChange.bind(this)} step="0.01" className="slider" id="slider_pan_x"/>
                    <span>Pan: X</span>
                </div>
                {/*slider_pan_y*/}
                <div className="slide">
                    <input type="range" min="-1" max="1" name="slider_pan_y" value={slider_pan_y} onChange={this.fnChange.bind(this)} step="0.01" className="slider" id="slider_pan_y"/>
                    <span>Pan: Y</span>
                </div>
                {/*slice*/}
                <div className="slide">
                    <input type="range" min="0" max="1" name="slider_slice" value={slider_slice} onChange={this.fnChange.bind(this)} step="0.01" className="slider" id="slider_slice"/>
                    <span>Slice</span>
                </div>
            </div>
            </Spin>
        );
    }
}


export default kp;
