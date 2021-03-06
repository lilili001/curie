import React, {Component} from 'react';
import {connect} from 'react-redux';
import DLayouta  from '@/components/dLayout1'
import {SearchOutlined} from '@ant-design/icons';
import _ from 'lodash';
import '@/assets/css/cbct.css'
import Kp from '../kelper/index'
import SideL from './sideL';
import EventBus from '@/utils/eventBus';
@connect((store) => {
    return {app:store.app,};
})
class Index extends Component {
    static displayName='Dash';

    constructor(props, context) {
        super(props, context);
        this.child = null;
    }
    state={
        tabbar:[
            {title:"CURIE",url:""}
        ],
        showPatientInfo:false,
        showSideL:true,
        hideR:false,
        curRow:null, //当前选中node
        showWLList:false,
        wlList:[
            {sw:40,sl:40,label:'STROKE'},
            {sw:80,sl:40,label:'BRAIN'},
            {sw:100,sl:40,label:'BRAIN_POSTERIOR_FOSSA'},
            {sw:150,sl:30,label:'LIVER'},
            {sw:200,sl:80,label:'SUBDURAL'},
            {sw:350,sl:50,label:'MEDIASTINUM'},
            {sw:400,sl:40,label:'CHEST_SOFT_TISSUE'},
            {sw:400,sl:420,label:'ABDOMEN'},
            {sw:500,sl:50,label:'SPINE_SOFT_TISSUE'},
            {sw:600,sl:300,label:'ANGIO'},
            {sw:1000,sl:-700,label:'LUNGS'},
            {sw:1500,sl:450,label:'BONE'},
            {sw:1600,sl:300,label:'BONE_SPINE'},
            {sw:3000,sl:500,label:'BONE_TEMPORAL'}
        ],
        psb:"" //primary secondary blend
    };
    onRef(ref){
        this.child = ref
    }
    componentWillReceiveProps(nextProps){
        console.log('===nextProps:===',nextProps);
        //this.setState({curRow:nextProps.app.curRow});
        const {showSideBar,showPatientInfo,action,kpData,curRow} = nextProps.app;
        //如果左侧都展开了 右侧隐藏
        if(showSideBar && showPatientInfo){
            this.setState({hideR:true,action,kpData,curRow})
        }else{
            this.setState({hideR:false,action,kpData,curRow})
        }
    }
    componentDidMount(){
    }
    fnChange(e){
        const {kpData} = this.props.app;
        const {name,value} = e.target;
        kpData[name] = value;
        switch (name){
            case 'slider_window':
                break;
            case 'slider_level':
                break
        }
        this.setState({...kpData});
        this.props.dispatch({type:'setData',payload:{key:'kpData',value:kpData}})
    }
    showWLList(item){
        const {showWLList} = this.state;
        this.setState({showWLList:!showWLList});
        if(item.label){
            const {kpData} = this.props.app;
            kpData['slider_window'] = item.sw;
            kpData['slider_level'] = item.sl;
            this.props.dispatch({type:'setData',payload:{key:'kpData',value:kpData}});
            EventBus.emit('setGl',{name:'slider_window',value:item.sw});
            EventBus.emit('setGl',{name:'slider_level', value:item.sl});
        }
    }
    setBlend(type){
        var val;
        switch (type){
            case 'primary':
                val = 0;
                break;
            case 'secondary':
                val = 1;
                break;
            case 'blend':
                val = 0.5;
                break;
        }
        this.setState({psb:type});
        EventBus.emit('setGl',{name:'slider_blend', value:val});
    }
    setAction(action){
        const {kpData} = this.props.app;
        this.props.dispatch({type:'setData',payload:{key:'action',value:action}});
    }
    toggleSideL(){
        var show = !this.state.showSideL;
        this.setState({showSideL:show});
        this.props.dispatch({type:'setData',payload:{key:'showSideBar',value:show}});
    }
    togglePatientInfo(){
        var show = !this.state.showPatientInfo;
        this.props.dispatch({type:'setData',payload:{key:'showPatientInfo',value:show}});
        this.setState({showPatientInfo:show});
    }
    render() {
        //const {kpData} = this.props.app;
        const {showSideL,showPatientInfo,hideR ,showWLList ,wlList , psb , action } = this.state;
        var patinfo = null;
        if(this.state.curRow){
            var {detail} = this.state.curRow;
            if(detail){
                 var {patinfo} = detail;
            }
        }
        const {curNode} = this.props.app;
        var isEmptyCurNode = _.isEmpty(curNode);
        var {level} = curNode;
        return (
            <DLayouta tabbar={this.state.tabbar} className="admin-kelper">
                {/*左侧开始*/}
                {showSideL ? <div className="cl-sidebar" data-position="right" id="leftMenu" style={{"background":"#292929"}}>
                    <div className="patientlist cl-navblock" style={{"height":"100%"}}>
                        <SideL onRef={c=>this.child=c}/>
                    </div>
                </div> : '' }

                {/*左侧结束*/}
                 <div className="container-fluid" id="pcont" style={{"paddingBottom": "49px" , "height":"100%","width":"85" }}>
                     {!showPatientInfo ? <div id="hidden-patient-info" style={{"paddingLeft":"1px","width":"36px","float":"left"}}>
                         <div className="box box-solid box-info box2" style={{"height":"106%","marginTop":"1px"}}>
                             <div className="box-body" style={{"textAlign":"center","marginTop":"1px"}}>
                                 {showSideL ? <ul className="navbar-nav" style={{padding:"2px",marginTop:"8px"}} id="nav-menu">
                                     <li className="iconList" onClick={this.toggleSideL.bind(this)}>
                                         <a  data-toggle="offLeftMenu" role="button" title="hidden menu">
                                             <span className="sr-only">Toggle navigation</span>
                                             <span className="icon-bar"></span>
                                             <span className="icon-bar"></span>
                                             <span className="icon-bar"></span>
                                         </a>
                                     </li>
                                 </ul> :  <SearchOutlined style={{fontSize:"22px",color:"#fff"}} onClick={this.toggleSideL.bind(this)}/>
                                 }

                                 <img src="/static/images/show-patient.png" style={{width:"20px",height:"30px",cursor:"pointer"}} id="show-patient" title="Show Patient Info" onClick={this.togglePatientInfo.bind(this)}/>
                                 <img src="/static/images/show-treatment.png" style={{width: "20px",height:"20px",cursor: "pointer",marginTop:"5px"}} id="show-treatment" title="Show Treatment Info" onClick={this.togglePatientInfo.bind(this)}/>
                                 <img src="/static/images/show-comment.png" style={{width: "20px",height:"20px",cursor: "pointer",marginTop:"5px"}} id="show-comment" title="Show Comment Info" onClick={this.togglePatientInfo.bind(this)}/>
                             </div>
                         </div>
                     </div> : '' }

                     {showPatientInfo ? <div id="patient-info-div" className="col-sm-2 col-md-2 patient-info" style={{width:"14%",paddingLeft:"1px"}}>
                         <div className="box box-solid box-info" style={{height: "38%", marginTop:0, marginBottom:"1px"}}>
                             <div className="box-header">
                                 <h3 className="box-title">
                                     Patient Info
                                     <a id="show-list" style={{float: "right",color: "#FCFAF2"}} onClick={this.togglePatientInfo.bind(this)}>
                                         <img src="/static/images/show-patient.png" style={{width: "17px",height:"25px",marginTop: "-9px"}} id="show-patient2" title="Show Patient List"/>
                                     </a>
                                 </h3>
                             </div>
                             <div className="box-body box-body2" style={{marginTop:"0px"}}>
                                 <p>
                                     <span>Patient Name:</span>
                                     <span id="patientnm" >{patinfo ? patinfo[0]: ''}</span>
                                 </p>
                                 <p>
                                     <span>Patient ID:</span>
                                     <span id="patientid" >{patinfo ? patinfo[1] : ''}</span>
                                 </p>
                                 <p>
                                     <span>Gender:</span>
                                     <span>&nbsp;</span>
                                 </p>
                                 <p>
                                     <span>Age:</span>
                                     <span>&nbsp;</span>
                                 </p>
                                 <p>
                                     <span>Diagnosis:</span>
                                     <span>&nbsp;</span>
                                 </p>
                                 <p style={{marginTop:"-2px"}}>
                                     <span>Institution:</span>
                                     <span>&nbsp;</span>
                                 </p>
                             </div>
                         </div>
                         <div className="box box-solid box-info box-body2" style={{height: "40%"}}>
                             <div className="box-header">
                                 <h3 className="box-title">Treatment Infomation</h3>
                             </div>
                             <div className="box-body">
                                 <p style={{paddingTop: "23px",marginTop: "13px"}}>
                                     <span>Physician Name:</span>
                                     <span>&nbsp;</span>
                                 </p>
                                 <p>
                                     <span>physicist Name:</span>
                                     <span>&nbsp;</span>
                                 </p>
                                 <p>
                                     <span>Date & Time:</span>
                                     <span>&nbsp;</span>
                                 </p>
                                 <p>
                                     <span>Plan Name:</span>
                                     <span>&nbsp;</span>
                                 </p>
                                 <p>
                                     <span>Fraction:</span>
                                     <span>&nbsp;</span>
                                 </p>
                                 <p>
                                     <span>Treatment Unit:</span>
                                     <span>&nbsp;</span>
                                 </p>
                             </div>
                         </div>

                     </div> : ''}

                     <div id="TSC3D" className="flex" style={{alignItems:"start"}}>
                         <div style={{background:"#1c1c1c"}}>
                             <Kp></Kp>
                         </div>
                         {hideR ? '' :
                         <div id="tool-div"  style={{ width:"225px", height: "100%",paddingLeft: "1px",paddingRight: "1px" }}>
                             <div className="box box-solid box-info img-tool2" style={{height: "56%",marginTop: "0px",marginBottom: "3px"}}>
                                 <div className="box-body">
                                     <div className="img-tool-p" style={{ lineHeight: "2px",textAlign:"center"}}>
                                         <button type="button" disabled={isEmptyCurNode} className="tool-btn" style={{marginTop: "18px",height: "40px",width: "93%"}} id="acquireCBCTButton">Acquire CBCT</button>
                                     </div>
                                     <div className="img-tool-p flex flex-wrap align-start" style={{ lineHeight: "2px"}}>
                                         <button disabled={isEmptyCurNode} onClick={this.setBlend.bind(this,'primary')} className={`tool-btn  tool-btn1 ${psb=='primary' ? 'active' : ''}`} >Primary</button>
                                         <button disabled={level!==2} onClick={this.setBlend.bind(this,'secondary')} className={`tool-btn  tool-btn1 ${psb=='secondary' ? 'active' : ''}`}>Secondary</button>
                                         <button disabled={level!==2} onClick={this.setBlend.bind(this,'blend')} className={`tool-btn  tool-btn1 ${psb=='blend' ? 'active' : ''}`}>Blend</button>
                                         <button disabled={isEmptyCurNode} onClick={this.setAction.bind(this,'scale')} className={`tool-btn  tool-btn1 ${action == 'scale' ? 'active' : ''} `}>Zoom</button>
                                         <button disabled={isEmptyCurNode} onClick={this.setAction.bind(this,'pan')} className={`tool-btn  tool-btn1 ${action == 'pan' ? 'active' : ''} `}>Pan</button>
                                         <button disabled={isEmptyCurNode} onClick={this.setAction.bind(this,'reset')} className={`tool-btn  tool-btn1 ${action == 'reset' ? 'active' : ''} `}>Reset</button>
                                         <button disabled={isEmptyCurNode} className="tool-btn  tool-btn1">W/L</button>
                                          <div className="wl-wigdet">
                                             <input type="number" disabled={isEmptyCurNode} className="tool-number" id="wwidth" title="Window Width" style={{width: "46%"}} name="slider_window" value={this.state['slider_window'] || ''} onChange={this.fnChange.bind(this)} />
                                             <input type="number" disabled={isEmptyCurNode} className="tool-number" id="wcenter"  title="Window Level" style={{width: "46%",float: "right"}} name="slider_window" value={this.state['slider_level'] || ''} onChange={this.fnChange.bind(this)} />
                                             <div className="dropdown drop-select-parent" id="AdjustWL">
                                                 <a onClick={this.showWLList.bind(this)} className="dropdown-toggle" data-toggle="dropdown"><img src="/static/images/off.png" style={{marginBottom: "-10px"}}/></a>
                                                 {showWLList ? <ul className="dropdown-menu">
                                                         {wlList.map((item , index)=><li onClick={this.showWLList.bind(this,item)} key={index}><a className="drop-wl drop-select-wl" sw={item.sw} sl={item.sl}>{item.label}</a></li>)}
                                                 </ul> : ''}
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                             <div className="box box-solid box-info img-tool2" style={{marginTop: "1px",height: "51%"}}>
                                 <div className="box-body text-center">
                                     <div className="reg-tool-p  " style={{paddingLeft: "1px" }}>
                                         <button type="button" disabled className="tool-btn" id="manualReg" style={{width: "93%"}}>Start Auto Registration
                                         </button>
                                         {/*<button type="button" className="tool-btn" id="autoReg" style={{width: "47%",marginLeft:"10px"}}>Auto Reg</button>*/}
                                     </div>

                                     <div className="reg-tool-p reg-tool-p3 margin-t-10  ">
                                         <div className="inner-div" style={{borderTopLeftRadius: "10px",borderTopRightRadius: "10px",paddingTop: "5px"}}>
                                             Couch Shift Result:
                                         </div>
                                         <div className="inner-div">
                                             X: <input type="number" className="operator-input" step="0.01"/> cm &nbsp;<button id="xPlus" className="operator-btn">+</button>&nbsp;<button id="xMinus" className="operator-btn">-</button>
                                         </div>
                                         <div className="inner-div">
                                             Y: <input type="number" className="operator-input" step="0.01"/> cm &nbsp;<button id="yPlus" className="operator-btn">+</button>&nbsp;<button id="yMinus" className="operator-btn">-</button>
                                         </div>
                                         <div className="inner-div" style={{borderBottomLeftRadius: "10px",borderBottomRightRadius: "10px"}}>
                                             Z: <input type="number" className="operator-input" step="0.01"/> cm &nbsp;<button id="zPlus" className="operator-btn">+</button>&nbsp;<button id="zMinus" className="operator-btn">-</button>
                                         </div>
                                     </div>
                                     <div className="reg-tool-p" style={{paddingLeft: "1px",width: "93%"}}>
                                         <button type="button" className="tool-btn tool-btn2" style={{width: "47%"}} id="save">Lock</button>
                                         <button type="button" className="tool-btn tool-btn2" style={{width: "47%",marginLeft:"10px"}} id="printCouchShift">Print</button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         }
                     </div>


                </div>
            </DLayouta>
        );
    }
}

/*export default connect(
    mapStateToProps,
)(dashLayout(Index));*/

export default  (Index)
