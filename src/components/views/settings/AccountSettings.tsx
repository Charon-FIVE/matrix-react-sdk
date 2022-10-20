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
import { logger } from "matrix-js-sdk/src/logger";
import Spinner from "../elements/Spinner";
import DiscoveryEmailAddresses from "../../views/settings/discovery/EmailAddresses";
import DiscoveryPhoneNumbers from "../../views/settings/discovery/PhoneNumbers";
import { IThreepid } from "matrix-js-sdk/src/@types/threepids";
import { getThreepidsWithBindStatus } from 'matrix-react-sdk/src/boundThreepids';
import { Policies, Service } from 'matrix-react-sdk/src/Terms';

interface IState {
    userId?: string;
    loading3pids: boolean; // whether or not the emails and msisdns have been loaded
    canChangePassword: boolean;
    haveIdServer: boolean;
    emails: IThreepid[];
    msisdns: IThreepid[];
    idServerHasUnsignedTerms: boolean;
    requiredPolicyInfo: {       // This object is passed along to a component for handling
        hasTerms: boolean;
        policiesAndServices: {
            service: Service;
            policies: Policies;
        }[]; // From the startTermsFlow callback
        agreedUrls: string[]; // From the startTermsFlow callback
        resolve: (values: string[]) => void; // Promise resolve function for startTermsFlow callback
    };
}

export default class AccountSettings extends React.Component<{}, IState> {
    constructor(props: {}) {
        super(props);
        const client = MatrixClientPeg.get();
        this.state = {
            userId: client.getUserId(),
            loading3pids: true,// whether or not the emails and msisdns have been loaded
            canChangePassword: false,
            haveIdServer: Boolean(MatrixClientPeg.get().getIdentityServerUrl()),
            emails: [],
            msisdns: [],
            idServerHasUnsignedTerms: false,
            requiredPolicyInfo: {       // This object is passed along to a component for handling
                hasTerms: false,
                policiesAndServices: null, // From the startTermsFlow callback
                agreedUrls: null,          // From the startTermsFlow callback
                resolve: null,             // Promise resolve function for startTermsFlow callback
            },
        };
       
    }
    public async UNSAFE_componentWillMount(): Promise<void> {
        this.getThreepidState();
    }

    private async getThreepidState(): Promise<void> {
        const cli = MatrixClientPeg.get();

        // Need to get 3PIDs generally for Account section and possibly also for
        // Discovery (assuming we have an IS and terms are agreed).
        let threepids = [];
        try {
            threepids = await getThreepidsWithBindStatus(cli);
        } catch (e) {
            const idServerUrl = MatrixClientPeg.get().getIdentityServerUrl();
            logger.warn(
                `Unable to reach identity server at ${idServerUrl} to check ` +
                `for 3PIDs bindings in Settings`,
            );
            logger.warn(e);
        }
        this.setState({
            emails: threepids.filter((a) => a.medium === 'email'),
            msisdns: threepids.filter((a) => a.medium === 'msisdn'),
            loading3pids: false,
        });
    }

    public render(): JSX.Element {
        const emails = this.state.loading3pids ? <Spinner /> : this.state.emails.length?<DiscoveryEmailAddresses emails={this.state.emails} />:null;
        const msisdns = this.state.loading3pids ? <Spinner /> : this.state.msisdns.length?<DiscoveryPhoneNumbers msisdns={this.state.msisdns} />:null;

        const threepidSection = this.state.haveIdServer ? <div className='mx_GeneralUserSettingsTab_discovery'>
           {this.state.emails.length? <span className="mx_SettingsTab_subheading">{ _t("Email addresses") }</span>:null}
                { emails }
           {this.state.msisdns.length? <span className="mx_SettingsTab_subheading">{ _t("Phone numbers") }</span>:null}
            { msisdns }
        </div> : null;

        return (
                <div className="mx_SettingsTab_section">
                  { threepidSection }
              </div>
        );
    }
}
