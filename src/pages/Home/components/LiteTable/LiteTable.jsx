import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import { Table,Button,Feedback,Dialog  } from '@icedesign/base';
import axios from 'axios';

const Toast = Feedback.toast;
const styles = {
  processing: {
    color: '#5485F7',
  },
  finish: {
    color: '#64D874',
  },
  terminated: {
    color: '#999999',
  },
  pass: {
    color: '#FA7070',
  },
};



const statusComponents = {
  0: <span style={styles.processing}>待明日打卡</span>,
  1: <span style={styles.finish}>打卡成功</span>,
  2: <span style={styles.terminated}>好人雷锋</span>,
  3: <span style={styles.pass}>已获得奖金</span>,
};

export default class LiteTable extends Component {
  static displayName = 'LiteTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      contract:"",
      net:"",
      visible:false,
      content:"点击“我要早起”，最低支付0.001NAS即可参与早起挑战！明天早5点至早8点间打卡就算打卡成功，打卡成功后记得在9点之后来收奖金哦！奖金计算规则为：前一日入奖池总额/前一日参与成功且今日成功打卡的人数，即未在参与后第二天早上打卡的群众，他们支付的财产将被平均分给成功打卡的人！所以，尽力早起吧少年！  注：今日序号是自1970-01-01至今的天数.",

    };
  }

  componentDidMount(){
    var thiz = this;
    axios.get('https://wx.nanayun.cn/api?act=3b49a643d5d7b5e')
    .then((response) => {
        thiz.setState({
          contract:response.data.contract,
          net:response.data.net,
        },function(){
          thiz.fetchData();
        }
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchData(){
    var thiz = this;
    thiz.call("memberList","[]",function(data){
      var ls = JSON.parse(data.result);
      console.log(ls);
      thiz.setState({tableData:ls});
    });
  }

  call = (method,args,func)=>{
    var thiz =this;
    axios.post(thiz.state.net+'/v1/user/call', {
          "from": "n1HYFhQwgC2y2StMpTMSkoHbqSKsZEVErFk",
          "to": thiz.state.contract,
          "value": "0",
          "nonce": 0,
          "gasPrice": "1000000",
          "gasLimit": "2000000",
          "contract": {
              "function": method,
              "args": args
          }
      })
      .then(function (response) {
        func(response.data.result);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  iWantToGetUpEarly = ()=>{
    window.postMessage({
          "target": "contentscript",
          "data":{
              "to" : this.state.contract,
              "value" : "0.001",
              "contract" : {
                  "function" : 'participate',
                  "args" : "[]"
              }
          },
          "method": "neb_sendTransaction"
      }, "*");
  }

  renderStatus = (a,b,value) => {
    var day = parseInt(new Date().getTime()/86400000);
    if(value.tag == 0 && value.payDay == day){
      return statusComponents[0];
    }
    if(value.tag == 1){
      return statusComponents[1];
    }
    if(value.tag == 3){
      return statusComponents[1];
    }
    return statusComponents[2];
  };

  renderPayMuch = (value)=>{
    var o = Number(value);
    var d = Number("1000000000000000000");
    return (o/d).toFixed(3);
  }

  mark = ()=>{
    var ts = parseInt(new Date().getTime()/1000);

    var hour = parseInt(((ts/3600)%24+8)%24);
    if(hour >= 5 && hour < 8){
      this.toMark();
    }else{
      // this.toMark();
      console.log("now time:"+hour);
      Toast.error("抱歉已经过了打卡时间!点击“我要早起”再次挑战自己吧！");
    }
  }

  toMark(){
    window.postMessage({
          "target": "contentscript",
          "data":{
              "to" : this.state.contract,
              "value" : "0",
              "contract" : {
                  "function" : 'morning',
                  "args" : "[]"
              }
          },
          "method": "neb_sendTransaction"
      }, "*");
  }

  onClose = ()=>{
    this.setState({visible:false})
  }

  onOpen = ()=>{
    this.setState({visible:true})
  }

  pull = ()=>{
    var ts = new Date().getTime()/1000;
    var hour = parseInt((ts/3600)%24+8);
    if(hour < 9){
      Toast.success("如您打卡成功，请在9点之后领取奖金！");
      return;
    }
    console.log(this.state);
    window.postMessage({
          "target": "contentscript",
          "data":{
              "to" : this.state.contract,
              "value" : "0",
              "contract" : {
                  "function" : 'distribution',
                  "args" : "[]"
              }
          },
          "method": "neb_sendTransaction"
      }, "*");
  }

  render() {
    const { tableData } = this.state;
    return (
      <div className="lite-table">
        <IceContainer style={styles.tableCard}>
          <Button type="primary" onClick={this.iWantToGetUpEarly}>我要早起!</Button> &nbsp;&nbsp;
          <Button type="secondary" onClick={this.mark}>现在打卡!</Button> &nbsp;&nbsp;
          <Button type="normal" onClick={this.pull}>提取奖金</Button> &nbsp;&nbsp;
          <Button type="normal" onClick={this.onOpen}shape="warning">玩法介绍</Button>
          <Dialog
          visible={this.state.visible}
          onOk={this.onClose}
          onCancel={this.onClose}
          shouldUpdatePosition
          minMargin={50}
          onClose={this.onClose}
          title="玩法介绍"
        >
          {this.state.content}
        </Dialog>
        </IceContainer>
        <IceContainer style={styles.tableCard}>
          <Table dataSource={tableData} hasBorder={false}>
            <Table.Column title="支付地址" dataIndex="from" width={200} />
            <Table.Column title="支付日" dataIndex="payDay" width={100} />
            <Table.Column title="支付金额" dataIndex="payMuch" cell={this.renderPayMuch} width={100} />
            <Table.Column
              title="状态"
              cell={this.renderStatus}
              width={100}
            />
          </Table>
        </IceContainer>
      </div>
    );
  }
}
