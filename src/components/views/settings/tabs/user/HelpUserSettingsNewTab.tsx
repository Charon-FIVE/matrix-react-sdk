/*
Copyright 2019-2021 The Matrix.org Foundation C.I.C.

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

import React from 'react';
import {_t} from "../../../../../languageHandler";
import {MatrixClientPeg} from "../../../../../MatrixClientPeg";
import SdkConfig from "../../../../../SdkConfig";
import Modal from "../../../../../Modal";
import UpdateCheckButton from "../../UpdateCheckButton";
import dis from "../../../../../dispatcher/dispatcher";


interface IProps {
    closeSettingsFn: () => void;
}

interface IState {
    appVersion: string;
    canUpdate: boolean;
    customer_contact;//客服联系方式
    customer_group;//客服群号
    version;//版本信息
}


export default class HelpUserSettingsNewTab extends React.Component<IProps, IState> {
    protected closeCopiedTooltip: () => void;

    constructor(props) {
        super(props);

        this.state = {
            appVersion: null,
            canUpdate: false,
            customer_contact:"",
            customer_group:"",
            version:"",
        };
        this.getSyatemInfo();
    }

    componentWillUnmount() {
        // if the Copied tooltip is open then get rid of it, there are ways to close the modal which wouldn't close
        // the tooltip otherwise, such as pressing Escape
        if (this.closeCopiedTooltip) this.closeCopiedTooltip();
    }



    private getSyatemInfo(){
        const cli = MatrixClientPeg.get();
        cli.getSystemInfo().then((res) => {
            this.setState({
                customer_contact:res.customer_contact,
                customer_group:res.customer_group
            });
        }, function(err) {
           throw err;
        });
       

            this.setState({
                version: SdkConfig.get().version,
            });
    }

    //跳转去官方群
    private onGoToCustomerGroup(){
        dis.dispatch({
            action: 'view_room',
            room_id:this.state.customer_group,
            should_peek: false,
            joining: false,
        });
        Modal.closeCurrentModal("");
    }


    render() {
     
      let updateButton = null;
       updateButton = <UpdateCheckButton />;
       const appVersion = SdkConfig.get().version|| '1.0.1';

        let olmVersion = MatrixClientPeg.get().olmVersion;
        olmVersion = olmVersion ? `${olmVersion[0]}.${olmVersion[1]}.${olmVersion[2]}` : '<not-enabled>';
        return (
            <div className="mx_SettingsTab">
                <div className="mx_SettingsTab_logo">
                   <img width="74" height="74"  src="themes/element/img/logos/element-logo.svg" alt="TalkTalk" />
                   <br></br>
                   <br></br>
                   {appVersion}
                </div> 
              
               <div className="mx_SettingsTab_txt"> 
                    {
                        <h3><span>{ _t("Official customer service")+"："}</span><span>{this.state.customer_contact.split('\r')[0]} <br />{this.state.customer_contact.split('\r')[1]}</span></h3>
                    }
                    {  
                        <h3>{ _t("Official group")+"："} <a onClick={this.onGoToCustomerGroup.bind(this)}>{this.state.customer_group}</a> </h3>
                    }
                </div>
               
                <div className='mx_SettingsTab_updata'>
                {updateButton} 
                    <br></br>
                    <br></br>
                </div>
            </div>  
        );
    }
}
