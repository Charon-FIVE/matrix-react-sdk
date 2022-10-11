/*
Copyright 2019 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * 二维码页面对应官方欢迎页面
 * 因登录方式不同故此页面重写
 */

import React from 'react';
import classNames from "classnames";

import SdkConfig from '../../../SdkConfig';
import AuthPage from "./AuthPage";
import { _td } from "../../../languageHandler";
import SettingsStore from "../../../settings/SettingsStore";
import { UIFeature } from "../../../settings/UIFeature";
import { IMatrixClientCreds } from 'matrix-react-sdk/src/MatrixClientPeg';
import { ValidatedServerConfig } from 'matrix-react-sdk/src/utils/ValidatedServerConfig';
import { ToDeviceChannel } from 'matrix-js-sdk/src/crypto/verification/request/ToDeviceChannel';
import CryptoJS from 'crypto-js';
import {createClient} from 'matrix-js-sdk/src/matrix';


interface IProps {
    // Called when the user has logged in. Params:
    // - The object returned by the login API
    // - The user's password, if applicable, (may be cached in memory for a
    //   short time so the user is not required to re-enter their password
    //   for operations like uploading cross-signing keys).
    fallbackHsUrl?: string;
    defaultDeviceDisplayName?: string;
    defaultUsername?: string;
    onLoggedIn(data: IMatrixClientCreds, password: string): void;
    onServerConfigChange(config: ValidatedServerConfig): void;
    isSyncing?: boolean;
    fragmentAfterLogin?: string;
}

interface IState {
    qrData:string;
    transactionId:string;
    isPolling:boolean;
    invalid:boolean;
}


export default class QRCodePage extends React.PureComponent<IProps, IState> {

    private timer;
    private transactionId:string = "";
    private loginTime;
    private initial_device_display_name;//初始名称
    private hsUrl;
    private generateTimes = 1;//生成次数
    private setTimeoutTimer;
    constructor(props: IProps) {
        super(props);
        this.state={
            qrData:"",
            transactionId:"",
            isPolling:false,
            invalid:false,
        }
    }

    /**
     * 组件即将被挂载
     */
    public UNSAFE_componentWillMount (){
        clearInterval(this.timer);
        clearInterval(this.loginTime);
       
        this.getDeviceId();
        this.initial_device_display_name = this.getUA();
        this.setState({
            qrData:this.createQRdata(),
            transactionId:this.transactionId ,//交易id
        });
        //这里通过轮询确认域名轮询已结束
         let server_url = localStorage.getItem("SERVER_URL");
         if(server_url){
             this.hsUrl = server_url;
             this.startTimerHander();
             this.dataReportingHandler();
         }else{
            //延迟获取轮询后的域名  先暂时这么处理有时间了再改1
            this.setTimeoutTimer = setInterval(()=>{
                let server_url = localStorage.getItem("SERVER_URL");
                if(server_url){
                    this.hsUrl = server_url;
                    clearInterval(this.setTimeoutTimer);
                    this.startTimerHander();
                    this.dataReportingHandler();
                }
            },200)
         }
    }


    //倒计时处理
    private  startTimerHander()  {
        // 清除可能存在的定时器
        clearInterval(this.timer)
        this.timer = setInterval(()=>{
            if(this.generateTimes>5){
                this.generateTimes =1;
                clearInterval(this.timer);
                clearInterval(this.loginTime);
                this.setState({invalid:true});
            }
            this.setState({
                qrData:this.createQRdata(),
                transactionId:this.transactionId,//交易id
              });
              this.dataReportingHandler();
              this.generateTimes++;
        },60000)
      }

       /**
       * 轮询获取登录参数
       */
        private pollingGetLoginData(){
            clearInterval(this.loginTime);
            this.loginTime = setInterval(()=>{
               this.getLoginData();
            },2000)
          }

          private getLoginData(){
            const config = SdkConfig.get();
            const client = createClient({
                baseUrl:  config["validated_server_config"].hsUrl,
                idBaseUrl:config["validated_server_config"].isUrl,
            });
            const device_id=this.getDeviceId();
          //  const transactionId = this.state.transactionId;
            const data = {
                qr_id: this.transactionId,
                device_id: device_id,
                initial_device_display_name:this.initial_device_display_name,
            }

            client.getLoginData(data).catch((e) => {
                this.setState({
                    isPolling:true
                });
                console.log("轮询中.............");
            }).then((res) => {
                if(res){
                    clearInterval(this.loginTime);
                    clearInterval(this.timer);
                    this.setState({
                        isPolling:false
                    });
                        const creds: IMatrixClientCreds = {
                            homeserverUrl: config["validated_server_config"].hsUrl,
                            identityServerUrl: config["validated_server_config"].isUrl,
                            userId: res.user_id,
                            deviceId: res.device_id,
                            accessToken: res.access_token,
                        };
                        creds["freshLogin"] = true;
                        this.props.onLoggedIn(creds);
                }
              }, (err)=> {
               //  clearInterval(this.loginTime);
              });
          }
    
    /**
      * 数据上报
    */
     private dataReportingHandler(){
        const config = SdkConfig.get();
        const client = createClient({
            baseUrl:localStorage.getItem("SERVER_URL"),//config["validated_server_config"].hsUrl,
            idBaseUrl:config["validated_server_config"].isUrl,
        });
        const device_id=this.getDeviceId();//设备id
        //const transactionId = this.state.transactionId;
        const data = {
                qr_id: this.transactionId,
                device_id: device_id
        }
        client.dataReporting(data).then((res) => {
            //开始请求登录参数
            if(res.msg=="success"){
                this.pollingGetLoginData();
            }
          }, (err)=> {
              //重新生成二维码
              if(err.code == 429){
                 this.setState({
                    qrData:this.createQRdata(),
                    transactionId:ToDeviceChannel.makeTransactionId(),//交易id
                });
              }
        });
      }

    /**
     * 组件卸载
     */
    componentWillUnmount() {
        clearInterval(this.timer);
        clearInterval(this.loginTime);
        this.state={
            qrData:"",
            transactionId:"",
            isPolling:false,
            invalid:false,
        }
        this.hsUrl = null;
        clearInterval(this.setTimeoutTimer);
    }


    /**
     * 设备类型
     * @returns 
     */
    private getUA = () => {
        let device = "Unknown";
        const ua = {
            "Generic Linux": /Linux/i,
            "Android": /Android/i,
            "BlackBerry": /BlackBerry/i,
            "Bluebird": /EF500/i,
            "Chrome OS": /CrOS/i,
            "Datalogic": /DL-AXIS/i,
            "Honeywell": /CT50/i,
            "iPad": /iPad/i,
            "iPhone": /iPhone/i,
            "iPod": /iPod/i,
            "macOS": /Macintosh/i,
            "Windows": /IEMobile|Windows/i,
            "Zebra": /TC70|TC55/i,
        }
        Object.keys(ua).map(v => navigator.userAgent.match(ua[v]) && (device = v));
        return device;
    }


    /**
     * 
     * @returns 
     * 设备ID 10位随机大写字母(A-Z) 
     */
     private fn_Guid() {
        const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        let ret = "";
        for (let i = 0; i < 10; ++i) {
            ret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return this.getUA()+"_"+ret;
    }

    /**
     * 获取设备ID
     * */
     private  getDeviceId(){
        let device_id = localStorage.getItem("DEVICE_ID");
        if(!device_id){
            device_id = this.fn_Guid();
            localStorage.setItem("DEVICE_ID",device_id);
        }
       return device_id;
    }

    /**
     * 
     * @returns {string} QRData  二维码数据
     */
     private  createQRdata():string{
        const device_id=this.getDeviceId();
        const transactionId = this.transactionId =ToDeviceChannel.makeTransactionId();//交易id
        const  newDate= new  Date()
        const timestamp = newDate.getTime();//时间戳
        const Initials = "Talktalk://";//头部字母
        const key=CryptoJS.enc.Utf8.parse("b9c8e878aa8e2134f6d4f41a");
        const iv = CryptoJS.enc.Utf8.parse("d89aa057");
        const QRstr = Initials+device_id+"$"+transactionId+"$"+timestamp;
        const QRData=this.aesDecrypt(QRstr,key,iv);
        return QRData;
    }


    private aesDecrypt(encrypted, key,iv):string {
        const test = CryptoJS.TripleDES.encrypt(encrypted, key, { 
            iv: iv, 
            mode: CryptoJS.mode.CBC,  
            padding: CryptoJS.pad.Pkcs7  
        });
        return test.toString();
      }






    render(): React.ReactNode {
        const pagesConfig = SdkConfig.getObject("embedded_pages");
        let pageUrl = null;
        if (pagesConfig) {
            pageUrl = pagesConfig.get("welcome_url");
        }
        if (!pageUrl) {
            pageUrl = 'QRCodePage.html';
        }

        return (
            <AuthPage>
                <div className={classNames("mx_Welcome", {
                    mx_WelcomePage_registrationDisabled: !SettingsStore.getValue(UIFeature.Registration),
                })}>
                    {/* <EmbeddedPage
                        className="mx_WelcomePage"
                        url={pageUrl}
                        replaceMap={{
                            "$riot:ssoUrl": "#/start_sso",
                            "$riot:casUrl": "#/start_cas",
                            "$matrixLogo": MATRIX_LOGO_HTML,
                            "[matrix]": MATRIX_LOGO_HTML,
                        }}
                    /> */}
                    {/* <LanguageSelector /> */}
                </div>
            </AuthPage>
        );
    }
}
