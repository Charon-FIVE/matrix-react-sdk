/*
Copyright 2017 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

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

import React, { ChangeEvent, createRef, KeyboardEvent, SyntheticEvent } from "react";
import { Room } from "matrix-js-sdk/src/models/room";

import SdkConfig from '../../../SdkConfig';
import withValidation, { IFieldState } from '../elements/Validation';
import { _t } from '../../../languageHandler';
import { MatrixClientPeg } from '../../../MatrixClientPeg';
import { Key } from "../../../Keyboard";
import { IOpts } from "../../../createRoom";
import { JoinRule, Preset, Visibility } from "matrix-js-sdk/src/@types/partials";
import { RoomType } from "matrix-js-sdk/src/@types/event";
import Field from "../elements/Field";
import RoomAliasField from "../elements/RoomAliasField";
import LabelledToggleSwitch from "../elements/LabelledToggleSwitch";
import DialogButtons from "../elements/DialogButtons";
import BaseDialog from "../dialogs/BaseDialog";
import { privateShouldBeEncrypted } from "../../../utils/rooms";

interface IProps {
    type?: RoomType;
    defaultPublic?: boolean;
    defaultName?: string;
    parentSpace?: Room;
    defaultEncrypted?: boolean;
    onFinished(proceed: boolean, opts?: IOpts): void;
}

interface IState {
    joinRule: JoinRule;
    isPublic: boolean;
    isEncrypted: boolean;
    name: string;
    topic: string;
    alias: string;
    detailsOpen: boolean;
    noFederate: boolean;
    nameIsValid: boolean;
    canChangeEncryption: boolean;
    publicMAXNum:Number;
    privateMAXNum:Number;
}


export default class CreateRoomNewDialog extends React.Component<IProps, IState> {
    private nameField = createRef<Field>();
    private aliasField = createRef<RoomAliasField>();
    private readonly supportsRestricted: boolean;
    constructor(props) {
        super(props);
        this.supportsRestricted = !!this.props.parentSpace;
        let joinRule = JoinRule.Invite;
        if (this.props.defaultPublic) {
            joinRule = JoinRule.Public;
        } else if (this.supportsRestricted) {
            joinRule = JoinRule.Restricted;
        }
        const config = SdkConfig.get();
        this.state = {
            isPublic: this.props.defaultPublic || false,
            isEncrypted:this.props.defaultEncrypted ?? privateShouldBeEncrypted(),
            joinRule:joinRule,
            name: this.props.defaultName || "",
            topic: "",
            alias: "",
            detailsOpen: false,
            noFederate: config.default_federate === false,
            nameIsValid: false,
            canChangeEncryption: true,
            publicMAXNum:0,
            privateMAXNum:0
        };

        MatrixClientPeg.get().doesServerForceEncryptionForPreset(Preset.PrivateChat)
            .then(isForced => this.setState({ canChangeEncryption: !isForced }));
    }

    private roomCreateOptions() {
        const opts: IOpts = {};
        const createOpts: IOpts["createOpts"] = opts.createOpts = {};
        createOpts.name = this.state.name;
        if (this.state.isPublic) {
            createOpts.visibility = Visibility.Public;
            createOpts.preset = Preset.PublicChat;
            opts.guestAccess = false;
            const { alias } = this.state;
            //如果alias 不存在 就赋值name 由于传入别名参数会影响创建同名群故次参数忽略不传
           // createOpts.room_alias_name = alias.substr(1, alias.indexOf(":") - 1)?alias.substr(1, alias.indexOf(":") - 1):this.state.name;
        }
        if (this.state.topic) {
            createOpts.topic = this.state.topic;
        }
        if (this.state.noFederate) {
            createOpts.creation_content = { 'm.federate': false };
        }
       // opts.guestAccess = true;
       // opts.historyVisibility = false;

       //if (!this.state.isPublic) {
        //    if (this.state.canChangeEncryption) {
         opts.encryption = this.state.isEncrypted;
        //    } else {
                // the server should automatically do this for us, but for safety
                // we'll demand it too.
            //    opts.encryption = true;
        //    }
      //  }

        // if (CommunityPrototypeStore.instance.getSelectedCommunityId()) {
        //     opts.associatedWithCommunity = CommunityPrototypeStore.instance.getSelectedCommunityId();
        // }

        if (this.props.parentSpace) {
            opts.parentSpace = this.props.parentSpace;
        }

        return opts;
    }

    componentDidMount() {
        // move focus to first field when showing dialog
        this.nameField.current.focus();
        this.getConfig();
    }

    componentWillUnmount() {
    }

    private onKeyDown = (event: KeyboardEvent) => {
        if (event.key === Key.ENTER) {
            this.onOk();
            event.preventDefault();
            event.stopPropagation();
        }
    };

    private onOk = async () => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
            activeElement.blur();
        }
        await this.nameField.current.validate({allowEmpty: false});
        if (this.aliasField.current) {
            await this.aliasField.current.validate({allowEmpty: false});
        }
        // Validation and state updates are async, so we need to wait for them to complete
        // first. Queue a `setState` callback and wait for it to resolve.
        await new Promise<void>(resolve => this.setState({}, resolve));
        //&& (!this.aliasField.current || this.aliasField.current.isValid)
        if (this.state.nameIsValid ) {
            this.props.onFinished(true, this.roomCreateOptions());
        } else {
            let field;
            if (!this.state.nameIsValid) {
                field = this.nameField.current;
            } else if (this.aliasField.current && !this.aliasField.current.isValid) {
                field = this.aliasField.current;
            }
            if (field) {
                field.focus();
                field.validate({ allowEmpty: false, focused: true });
            }
        }
    };

    private onCancel = () => {
        this.props.onFinished(false);
    };

    private onNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        this.setState({ name: ev.target.value });
    };

    private onTopicChange = (ev: ChangeEvent<HTMLInputElement>) => {
        this.setState({ topic: ev.target.value });
    };

    private onPublicChange = (isPublic: boolean) => {
        this.setState({ isPublic });
    };

    private onEncryptedChange = (isEncrypted: boolean) => {
        this.setState({ isEncrypted });
    };

    private onAliasChange = (alias: string) => {
        this.setState({ alias });
    };

    private onDetailsToggled = (ev: SyntheticEvent<HTMLDetailsElement>) => {
        this.setState({ detailsOpen: (ev.target as HTMLDetailsElement).open });
    };

    private onNoFederateChange = (noFederate: boolean) => {
        this.setState({ noFederate });
    };

    private onNameValidate = async (fieldState: IFieldState) => {
        const result = await CreateRoomNewDialog.validateRoomName(fieldState);
        this.setState({nameIsValid: result.valid});
        return result;
    };

    private static validateRoomName = withValidation({
        rules: [
            {
                key: "required",
                test: async ({ value }) => !!value,
                invalid: () => _t("Please enter a name for the room"),
            },
        ],
    });


    private async getConfig(){

      await  MatrixClientPeg.get().getSystemConfig().then((res:any) => {
            //max_number_of_encryption_group: 7
            // max_number_of_group: 5
            this.setState({
                publicMAXNum:res.max_number_of_encryption_group,
                privateMAXNum:res.max_number_of_group
            });
        }, function(err) {
           throw err;
        });


    }

    render() {
        let aliasField;
        if (this.state.isPublic) {
            const domain = MatrixClientPeg.get().getDomain();
            aliasField = (
                <div className="mx_CreateRoomDialog_aliasContainer">
                    <RoomAliasField
                        ref={this.aliasField}
                        onChange={this.onAliasChange}
                        domain={domain}
                        value={this.state.alias}
                    />
                </div>
            );
        }

       


        let publicPrivateLabel = <p className="mx_publicPrivate_Label">{_t(
            "Private rooms can be found and joined by invitation only. Public rooms can be " +
            "found and joined by anyone.",
        )}</p>;

        let encryptionLabel1 = <p className="mx_publicPrivate_Label">{_t("After encryption is turned on, the maximum number of group members is")+this.state.publicMAXNum+_t("people")}</p>;
        let encryptionLabel2 = <p className="mx_publicPrivate_Label">{_t("After the encryption is turned off, the maximum number of group members is")+this.state.privateMAXNum+_t("people")}</p>;

        let federateLabel = _t(
            "You might enable this if the room will only be used for collaborating with internal " +
            "teams on your homeserver. This cannot be changed later.",
        );
        if (SdkConfig.get().default_federate === false) {
            // We only change the label if the default setting is different to avoid jarring text changes to the
            // user. They will have read the implications of turning this off/on, so no need to rephrase for them.
            federateLabel = _t(
                "You might disable this if the room will be used for collaborating with external " +
                "teams who have their own homeserver. This cannot be changed later.",
            );
        }

        let title = this.state.isPublic ? _t('Create a public room') : _t('Create a private room');
        // if (CommunityPrototypeStore.instance.getSelectedCommunityId()) {
        //     const name = CommunityPrototypeStore.instance.getSelectedCommunityName();
        //     title = _t("Create a room in %(communityName)s", {communityName: name});
        // }
        return (
            <BaseDialog className="mx_CreateRoomDialog" onFinished={this.props.onFinished}
                title={title}
            >
                <form onSubmit={this.onOk} onKeyDown={this.onKeyDown}>
                    <div className="mx_Dialog_content">
                        <Field
                            ref={this.nameField}
                            label={_t('Name')}
                            onChange={this.onNameChange}
                            onValidate={this.onNameValidate}
                            value={this.state.name}
                            className="mx_CreateRoomDialog_name"
                        />
                        <Field
                            label={_t('Topic (optional)')}
                            onChange={this.onTopicChange}
                            value={this.state.topic}
                            className="mx_CreateRoomDialog_topic"
                        />
                        <LabelledToggleSwitch
                            label={_t("Make this room public")}
                            onChange={this.onPublicChange}
                            value={this.state.isPublic}
                        />
                        { publicPrivateLabel }

                        <LabelledToggleSwitch
                            label={_t("Enable encryption (irreversible)")}
                            onChange={this.onEncryptedChange}
                            value={this.state.isEncrypted}
                        />
                        { encryptionLabel1 }
                        {encryptionLabel2}
                       
                    </div>
                </form>
                <DialogButtons primaryButton={_t('Create Room')}
                    onPrimaryButtonClick={this.onOk}
                    onCancel={this.onCancel} />
            </BaseDialog>
        );
    }
}
