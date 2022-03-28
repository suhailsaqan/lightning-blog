import * as React from 'react';
import {addNewBlock, addNewBlockAt, getCurrentBlock} from '../util/helpers';
import {Block} from '../util/constants';
import {SideButtonComponentProps} from '../MediumDraftEditor';

export class SeparatorButton extends React.PureComponent<SideButtonComponentProps> {

    public render() {
        return (
            <button className="md-sb-button" onClick={this.onClick} type="button">
                <svg viewBox="0 0 14 14" height="14" width="14">
                    <rect y="6" width="14" height="2"/>
                </svg>
            </button>
        );
    }

    private onClick = () => {
        let state = addNewBlock(
            this.props.getEditorState(),
            Block.BREAK
        );

        const currentBlock = getCurrentBlock(state);
        const key = currentBlock.getKey();

        state = addNewBlockAt(state, key);

        this.props.setEditorState(state);

        this.props.close();
    }
}
