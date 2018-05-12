import React, { Component } from 'react';
import axios from 'axios';
export default class MainData extends Component {
  static displayName = 'MainData';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      totalMem:'loading...',
      totalMoney:'loading',
      'today':'loading...',
      contract:"",
      net:"",
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
    this.call("recordLength","[]",function(data){
      thiz.setState({totalMem:data.result});
    });

    this.call("getJackpot","[]",function(data){
      var num_ = data.result.substring(1,data.result.length-1);
      var num = Number(num_);
      thiz.setState({totalMoney:(num/Number("1000000000000000000")).toFixed(3)});
    });

    var ts = new Date().getTime()/1000;

    this.setState({today:parseInt(ts/86400)});
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



  render() {
    return (
      <div style={styles.wrapper}>
        <div style={styles.content}>
          <div style={styles.contentItem}>
            <div style={styles.contentNum}>
              <span style={styles.bigNum}>{this.state.totalMem}</span>
            </div>
            <div style={styles.contentDesc}>参与人数</div>
          </div>
          <div style={styles.contentItem}>
            <div style={styles.contentNum}>
              <span style={styles.bigNum}>{this.state.totalMoney}</span>
            </div>
            <div style={styles.contentDesc}>奖池奖金(NAS)</div>
          </div>
          <div style={styles.contentItem}>
            <div style={styles.contentNum}>
              <span style={styles.bigNum}>{this.state.today}</span>
            </div>
            <div style={styles.contentDesc}>今日序号</div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  wrapper: {
    background: '#F4F4F4',
  },
  content: {
    width: '100%',
    height: 220,
    maxWidth: 1024,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: '0 auto',
  },
  contentItem: {},
  contentNum: {
    display: 'flex',
    alignItems: 'center',
  },
  bigNum: {
    color: '#333',
    fontSize: 68,
  },
  symbol: {
    color: '#333',
    fontSize: 40,
    marginLeft: 10,
  },
  contentDesc: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 6,
  },
};
