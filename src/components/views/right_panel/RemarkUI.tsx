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
import { _t } from 'matrix-react-sdk/src/languageHandler';
import { RemarkUtils } from 'matrix-react-sdk/src/utils/RemarkUtils';
import React from 'react';
import dis from '../../../dispatcher/dispatcher';//node_modules/matrix-react-sdk/src/dispatcher/dispatcher.ts
interface IProps {
    userid;//需要获取备注名的userid
}

interface IState {
    remarkName:string;
}


export default class RemarkUI extends  React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            remarkName:"",
        };
    }
    
    public componentDidMount(): void {
        let tempName=  RemarkUtils.getRemarkNameById(this.props.userid);
            this.setState({
                remarkname:tempName,
            });
    }

    private onRemarkFocus(){
        let remarkName= RemarkUtils.getRemarkNameById(this.props.userid);
        this.setState({
            remarkname:remarkName,
        });
    }


    private async onRemarkBlur(e){
        if(!e.target.value){
            //失去焦点时,备注名为空还原备注名为对应的昵称或者用户名
            RemarkUtils.deleteRemarkNameByUserId(this.props.userid);
            dis.dispatch({action: 'remarked',userId:this.props.userid});
            this.setState({
                remarkname:"",
            });
        }else{
            RemarkUtils.setRemarkNameById(this.props.userid,e.target.value);
            dis.dispatch({action: 'remarked',userId:this.props.userid});
        }
    }

     /**
     * 
     * @returns 
     * 备注名称事件处理函数
     */
      private onRemarkChanged(e){
        this.setState({
            remarkname:e.target.value,
        });
    }

    render() {
        return (
            <div className="mx_UserInfo_container">
            <h3>{ _t("Remark") }</h3>
               <input
                  type="text"
                  className="mx_MyGroups_DM_MarkInput"
                  value={this.state.remarkName}
                  onFocus={this.onRemarkFocus}
                  onBlur={this.onRemarkBlur}
                  onChange={this.onRemarkChanged}
                  autoComplete="off"
                  placeholder={_t("Click to modify")}
            />
        </div>
        );
    }
}
