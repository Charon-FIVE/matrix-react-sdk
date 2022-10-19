/*
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.

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
import { _t } from "../../../languageHandler";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import Field from "../elements/Field";
import AccessibleButton from 'matrix-react-sdk/src/components/views/elements/AccessibleButton';

interface IState {
    userId?: string;
    Introduction:string;//简介
    enableProfileSave?: boolean;
}

export default class IntroductionSettings extends React.Component<{}, IState> {
    constructor(props: {}) {
        super(props);
        const client = MatrixClientPeg.get();
        this.state = {
            userId: client.getUserId(),
            Introduction:'Not introduced yet!',
            enableProfileSave: false,
        };
        this.GetIntroduction();
    }

    /**
     * 获取个人简介
     */
    private GetIntroduction(){
        const cli = MatrixClientPeg.get();
        cli.getUserIntroduction(cli.getUserId()).then((res) => {
           if(res.introduction){
               this.setState({
                 Introduction: res.introduction,
               })    
           }
       });
    }
    /**
    * 个人简介修改
    */
    private onIntroductionChanged=(e) => {
        this.setState({
            Introduction: e.target.value,
            enableProfileSave: true,
        });
    };
    /**
     * 
     * @param e 
     * @returns 
     * 取消修改
     */
    private cancelProfileChanges = async (e: React.MouseEvent): Promise<void> => {
        e.stopPropagation();
        e.preventDefault();

        if (!this.state.enableProfileSave) return;
        this.setState({
            enableProfileSave: false,
            Introduction:this.state.Introduction
        });
    };

    /**
     * 
     * @param e 
     * 保存修改
     * @returns 
     */
    private saveProfile = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.stopPropagation();
        e.preventDefault();

        if (!this.state.enableProfileSave) return;
        this.setState({ enableProfileSave: false });

        const client = MatrixClientPeg.get();
        client.setUserIntroduction(client.getUserId(),{introduction:this.state.Introduction}).then((res) => {
            this.setState({
                Introduction: res.introduction,
                enableProfileSave:false,
            })    
       });

     };


   

    public render(): JSX.Element {
        return (
            <form
                onSubmit={null}
                autoComplete="off"
                noValidate={true}
                className="mx_ProfileSettings"
            >
               
                <div className="mx_ProfileSettings_profile">
                    <div className="mx_ProfileSettings_profile_controls">
                        <span className="mx_SettingsTab_subheading">{ _t("Introduction") }</span>
                        <Field
                            type="text"
                            value={this.state.Introduction}
                            autoComplete="off"
                            maxLength={140}

                            onChange={this.onIntroductionChanged}
                        />
                    </div>
                   
                </div>
                <div className="mx_ProfileSettings_buttons">
                    <AccessibleButton
                        onClick={this.cancelProfileChanges}
                        kind="link"
                        disabled={!this.state.enableProfileSave}
                    >
                        { _t("Cancel") }
                    </AccessibleButton>
                    <AccessibleButton
                        onClick={this.saveProfile}
                        kind="primary"
                        disabled={!this.state.enableProfileSave}
                    >
                        { _t("Save") }
                    </AccessibleButton>
                </div>
               
            </form>
        );
    }
}
