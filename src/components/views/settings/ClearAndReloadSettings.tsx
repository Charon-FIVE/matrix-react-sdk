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
import { _t } from "matrix-react-sdk/src/languageHandler";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import { logger } from "matrix-js-sdk/src/logger";
import AccessibleButton from "../elements/AccessibleButton";
import PlatformPeg from 'matrix-react-sdk/src/PlatformPeg';

export default class ClearAndReloadSettings extends React.Component<{}> {
    constructor(props: {}) {
        super(props);
    }
   

    private onClearCacheAndReload= (e) => {
        if (!PlatformPeg.get()) return;

        // Dev note: please keep this log line, it's useful when troubleshooting a MatrixClient suddenly
        // stopping in the middle of the logs.
        logger.log("Clear cache & reload clicked");
        MatrixClientPeg.get().stopClient();
        MatrixClientPeg.get().store.deleteAllData().then(() => {
            PlatformPeg.get().reload();
        });
    };

    public render(): JSX.Element {
        return (
            <div>
                <br/>
                <AccessibleButton className='clear-cache-button' onClick={this.onClearCacheAndReload} kind='danger'>
                    { _t("Clear cache and reload") }
                </AccessibleButton>
            </div>);
    }
}
